import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, posix } from "node:path";
import {
  description,
  digest,
  metadata,
  remoteDetail,
  renameInvocations,
  rewriteLinks,
  skillName,
  sourceUrl,
  vendorDetail,
  wrapper,
} from "./render.mjs";

export function git(cwd, args) {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }).trimEnd();
}

export function repositorySnapshot(
  source,
  cache,
  remote = `https://github.com/${source.repository}.git`,
) {
  const directory = join(cache, source.id);
  execFileSync(
    "git",
    ["clone", "--depth", "1", "--filter=blob:none", remote, directory],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  const revision = git(directory, ["rev-parse", "HEAD"]);
  const files = git(directory, ["ls-tree", "-r", "--name-only", "HEAD"]).split(
    "\n",
  );
  return {
    revision,
    files,
    read: (path) =>
      execFileSync("git", ["-C", directory, "show", `HEAD:${path}`], {
        maxBuffer: 32 * 1024 * 1024,
      }),
    mode: (path) => git(directory, ["ls-tree", "HEAD", "--", path]).slice(0, 6),
  };
}

export function selectedPaths(source, snapshot) {
  return snapshot.files
    .filter(
      (file) =>
        file.endsWith("/SKILL.md") &&
        source.paths.some((path) => file.startsWith(path + "/")),
    )
    .map(posix.dirname)
    .sort();
}

export function safeFile(path, mode) {
  if (path.split("/").some((part) => part === ".." || part === ".git"))
    throw new Error(`Unsafe upstream path: ${path}`);
  if (!["100644", "100755"].includes(mode))
    throw new Error(`Unsupported upstream file mode: ${path}`);
}

export function material(source, snapshot, path) {
  const files = snapshot.files.filter((file) => file.startsWith(path + "/"));
  const result = new Map();
  for (const file of files) {
    const mode = snapshot.mode(file);
    safeFile(file, mode);
    result.set(file.slice(path.length + 1), {
      data: snapshot.read(file),
      mode,
    });
  }
  result.set("LICENSE.upstream", {
    data: snapshot.read(source.license),
    mode: "100644",
  });
  return result;
}

export function sourceHash(files) {
  return digest(
    JSON.stringify(
      [...files].map(([path, { data, mode }]) => [path, digest(data), mode]),
    ),
  );
}

export function writeFile(root, path, contents, mode = 0o644) {
  const destination = join(root, path);
  mkdirSync(posix.dirname(destination), { recursive: true });
  writeFileSync(destination, contents, { mode });
}

export function renderSkill(source, snapshot, path, overrides, previous) {
  const name = skillName(path, source, overrides);
  const files = material(source, snapshot, path);
  const hash = sourceHash(files);
  const revision =
    previous?.hash === hash ? previous.revision : snapshot.revision;
  const summary = description(
    name,
    files.get("SKILL.md").data.toString(),
    overrides,
  );
  const context = {
    name,
    source,
    revision,
    path,
    names: selectedPaths(source, snapshot).map((entry) => [
      entry,
      skillName(entry, source, overrides),
    ]),
  };
  return { name, files, hash, revision, summary, context };
}

export function adaptedFile(path, data, context, renames) {
  if (!/\.(?:md|mdx)$/.test(path)) return data;
  return renameInvocations(
    rewriteLinks(data.toString(), { ...context, filePath: path }),
    renames,
  );
}

export function writeVendor(root, destination, skill, overrides) {
  for (const [path, { data, mode }] of skill.files) {
    const target = path === "SKILL.md" ? "UPSTREAM.md" : path;
    writeFile(
      root,
      `${destination}/${target}`,
      adaptedFile(
        path,
        data,
        skill.context,
        overrides.renames[skill.context.source.id],
      ),
      parseInt(mode, 8) & 0o777,
    );
  }
}

export function writeSkill(root, source, skill, overrides) {
  const destination = `${source.destination}/${skill.name}`;
  rmSync(join(root, destination), { recursive: true, force: true });
  const detail =
    source.mode === "remote"
      ? remoteDetail(source, skill.revision, skill.context.path)
      : vendorDetail(skill.name);
  if (source.mode === "vendor")
    writeVendor(root, destination, skill, overrides);
  writeFile(
    root,
    `${destination}/SKILL.md`,
    wrapper(skill.name, skill.summary, detail),
  );
  writeFile(
    root,
    `${destination}/agents/openai.yaml`,
    metadata(
      skill.name,
      skill.summary,
      skill.files.get("agents/openai.yaml")?.data.toString(),
    ),
  );
  writeFile(
    root,
    `${destination}/SOURCE.md`,
    `# Source\n\nUpstream: [${source.repository}](${sourceUrl(source, skill.revision, skill.context.path)})\n\nRevision: \`${skill.revision}\`\n\nMode: ${source.mode}. Revyo supplies the concise discovery wrapper and automatic invocation policy.\nRelative links and colliding skill invocations are adapted for the installed layout.\nDomain guidance and supporting files belong to their upstream authors.\n\nLicense: [upstream terms](${sourceUrl(source, skill.revision, source.license)}).\n`,
  );
  return {
    source: source.id,
    path: skill.context.path,
    destination,
    hash: skill.hash,
    revision: skill.revision,
    mode: source.mode,
  };
}

export function removeOldSkills(root, previous, current) {
  const retained = new Set(
    Object.values(current).map((entry) => entry.destination),
  );
  for (const entry of Object.values(previous)) {
    if (!retained.has(entry.destination))
      rmSync(join(root, entry.destination), { recursive: true, force: true });
  }
}

export function readJson(root, path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

export function readLock(root) {
  try {
    return readJson(root, "upstream-lock.json").skills;
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

export function collectSource(source, snapshot, overrides, previous, seen) {
  const paths = selectedPaths(source, snapshot);
  if (!paths.length) throw new Error(`No skills found for ${source.id}`);
  return paths.map((path) => {
    const name = skillName(path, source, overrides);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length >= 64)
      throw new Error(`Invalid skill name: ${name}`);
    if (seen.has(name)) throw new Error(`Duplicate skill name: ${name}`);
    seen.add(name);
    return renderSkill(source, snapshot, path, overrides, previous[name]);
  });
}

export function syncCatalog(root, load) {
  const { sources } = readJson(root, "upstream-sources.json");
  const overrides = readJson(root, "upstream-overrides.json");
  const previous = readLock(root);
  const seen = new Set(readdirSync(join(root, "skills")));
  // Resolve and validate every source before replacing tracked catalog files.
  const plans = sources.map((source) => ({
    source,
    skills: collectSource(source, load(source), overrides, previous, seen),
  }));
  const current = {};
  for (const { source, skills } of plans) {
    for (const skill of skills)
      current[skill.name] = writeSkill(root, source, skill, overrides);
  }
  removeOldSkills(root, previous, current);
  const sorted = Object.fromEntries(
    Object.entries(current).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFile(
    root,
    "upstream-lock.json",
    JSON.stringify({ version: 1, skills: sorted }, null, 2) + "\n",
  );
  return sorted;
}
