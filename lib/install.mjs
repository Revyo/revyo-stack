import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const skillsRoot = join(packageRoot, "skills");
const { name, version } = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
);
const statePath = ".agents/revyo-stack.json";
const begin = "<!-- revyo-stack:start -->";
const end = "<!-- revyo-stack:end -->";
const block = `${begin}
## Revyo Software skills

For new Revyo projects, use [revyo-project](.agents/skills/revyo-project/SKILL.md) as the entry point. It routes to the stack-specific skills beside it. Read the relevant skills before scaffolding or changing the stack. Preserve these installed skills when setting up the workspace.
${end}`;
const hash = (contents) => createHash("sha256").update(contents).digest("hex");

function readOptional(path, fallback) {
  return existsSync(path) ? readFileSync(path, "utf8") : fallback;
}

function sourceFiles(directory = skillsRoot) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink())
        throw new Error(`Skill source must not be a symlink: ${path}`);
      return entry.isDirectory() ? sourceFiles(path) : [path];
    })
    .sort();
}

function optionalStat(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return undefined;
  }
}

function checkEntry(path, directory) {
  const stat = optionalStat(path);
  if (!stat) return;
  if (stat.isSymbolicLink()) throw new Error(`Refusing symlink: ${path}`);
  const valid = directory ? stat.isDirectory() : stat.isFile();
  if (!valid)
    throw new Error(`Expected ${directory ? "directory" : "file"}: ${path}`);
}

function checkPath(root, path) {
  let current = root;
  const parts = path.split("/");
  for (let index = 0; index < parts.length; index++) {
    current = join(current, parts[index]);
    checkEntry(current, index < parts.length - 1);
  }
}

function nodeModulesRoot(path) {
  let consumer;
  for (
    let current = resolve(path);
    dirname(current) !== current;
    current = dirname(current)
  ) {
    // Use the outer boundary to escape Bun's isolated .bun dependency store.
    if (basename(current) === "node_modules") consumer = dirname(current);
  }
  return consumer;
}

function workspaceAt(path) {
  const manifest = JSON.parse(readOptional(join(path, "package.json"), "{}"));
  return (
    Array.isArray(manifest.workspaces) ||
    Array.isArray(manifest.workspaces?.packages)
  );
}

function workspaceRoot(consumer) {
  for (
    let current = consumer;
    dirname(current) !== current;
    current = dirname(current)
  ) {
    if (workspaceAt(current)) return current;
  }
  return consumer;
}

export function postinstallRoot(installationPath = packageRoot) {
  const consumer = nodeModulesRoot(installationPath);
  // A maintainer's install must not write consumer skills into this repo.
  return consumer ? workspaceRoot(consumer) : undefined;
}

function readState(root) {
  checkPath(root, statePath);
  const previous = JSON.parse(readOptional(join(root, statePath), "{}"));
  if (previous.package && previous.package !== name)
    throw new Error(`Unexpected installer state: ${statePath}`);
  return previous;
}

function chooseTargets(claude, previous) {
  const targets = [".agents/skills"];
  if (claude || previous.targets?.includes(".claude/skills"))
    targets.push(".claude/skills");
  return targets;
}

function planSkillFile(context, target, source) {
  const path = `${target}/${relative(skillsRoot, source).split("\\").join("/")}`;
  checkPath(context.root, path);
  const contents = readFileSync(source);
  context.files[path] = hash(contents);
  const destination = join(context.root, path);
  if (!existsSync(destination)) return { path, contents };
  const current = hash(readFileSync(destination));
  if (current === context.files[path]) return undefined;
  if (!context.force && context.previous.files?.[path] !== current) {
    context.conflicts.push(path);
    return undefined;
  }
  return { path, contents };
}

function markerRange(original) {
  const start = original.indexOf(begin);
  const finish = original.indexOf(end);
  const incomplete = (start === -1) !== (finish === -1);
  const duplicate =
    original.indexOf(begin, start + begin.length) !== -1 ||
    original.indexOf(end, finish + end.length) !== -1;
  if (incomplete || finish < start || duplicate) {
    throw new Error(
      "AGENTS.md has malformed revyo-stack markers; repair that block before reinstalling",
    );
  }
  return { start, finish };
}

function appendBlock(original) {
  const separator = original.endsWith("\n") ? "\n" : "\n\n";
  return original + (original ? separator : "") + block + "\n";
}

function editedBlock(existing, context) {
  return (
    !context.force &&
    existing !== block &&
    hash(existing) !== context.previous.agentsBlock
  );
}

function planAgents(context) {
  checkPath(context.root, "AGENTS.md");
  const original = readOptional(join(context.root, "AGENTS.md"), "");
  const { start, finish } = markerRange(original);
  if (start === -1)
    return { path: "AGENTS.md", contents: appendBlock(original) };
  const existing = original.slice(start, finish + end.length);
  if (editedBlock(existing, context)) {
    context.conflicts.push("AGENTS.md (Revyo block)");
    return undefined;
  }
  const contents =
    original.slice(0, start) + block + original.slice(finish + end.length);
  return contents === original ? undefined : { path: "AGENTS.md", contents };
}

function installationPlan(context) {
  const plan = [];
  for (const target of context.targets) {
    for (const source of sourceFiles()) {
      const item = planSkillFile(context, target, source);
      if (item) plan.push(item);
    }
  }
  const agents = planAgents(context);
  if (agents) plan.push(agents);
  if (context.conflicts.length) {
    throw new Error(
      `Edited files were preserved; no files were installed. Move your customizations into project instructions or rerun with --force:\n${context.conflicts.join("\n")}`,
    );
  }
  return plan;
}

function writeInstallation(context, plan) {
  for (const item of plan) {
    const path = join(context.root, item.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, item.contents);
  }
  const stateFile = join(context.root, statePath);
  mkdirSync(dirname(stateFile), { recursive: true });
  const state = {
    package: name,
    version,
    targets: context.targets,
    agentsBlock: hash(block),
    files: context.files,
  };
  writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
}

function checkRoot(root) {
  if (!existsSync(root) || !lstatSync(root).isDirectory())
    throw new Error(`Project directory does not exist: ${root}`);
}

export function installSkills({
  root = process.cwd(),
  force = false,
  claude = false,
  quiet = false,
} = {}) {
  root = resolve(root);
  checkRoot(root);
  const previous = readState(root);
  const targets = chooseTargets(claude, previous);
  const context = { root, force, previous, targets, files: {}, conflicts: [] };
  const plan = installationPlan(context);
  writeInstallation(context, plan);
  if (!quiet)
    console.log(
      `Installed ${name}@${version} in ${root}. Start with .agents/skills/revyo-project/SKILL.md.`,
    );
  return { root, version, changed: plan.map((item) => item.path), targets };
}
