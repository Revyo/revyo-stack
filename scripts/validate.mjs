import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const errors = [];
const skills = readdirSync(resolve(root, "skills"), {
  withFileTypes: true,
}).filter((entry) => entry.isDirectory());

function walk(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(resolve(path, entry.name))
      : [resolve(path, entry.name)],
  );
}

for (const { name } of skills) {
  const skill = resolve(root, "skills", name, "SKILL.md");
  if (!existsSync(skill)) {
    errors.push(`${name}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(skill, "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!frontmatter) errors.push(`${name}: missing YAML frontmatter`);
  else {
    if (!frontmatter[1].split(/\r?\n/).includes(`name: ${name}`))
      errors.push(`${name}: frontmatter name must match folder`);
    if (!/^description: .+/m.test(frontmatter[1]))
      errors.push(`${name}: missing description`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length >= 64)
    errors.push(`${name}: invalid skill name`);
  if (/\b(?:TODO|TBD|FIXME)\b|\[INSERT\b/.test(text))
    errors.push(`${name}: unfinished scaffold`);
  const metadata = resolve(dirname(skill), "agents", "openai.yaml");
  if (!existsSync(metadata)) errors.push(`${name}: missing UI metadata`);
  else if (!readFileSync(metadata, "utf8").includes(`$${name}`))
    errors.push(`${name}: default prompt must invoke this skill`);
}

for (const file of [
  resolve(root, "README.md"),
  ...walk(resolve(root, "skills")).filter((file) => file.endsWith(".md")),
]) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const link = match[1].split("#")[0];
    if (!link || /^https?:\/\//.test(link)) continue;
    if (!existsSync(resolve(dirname(file), link)))
      errors.push(`${file}: broken local link ${link}`);
  }
}

const manifest = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf8"),
);
for (const [name, path] of Object.entries(manifest.bin)) {
  const file = resolve(root, path);
  if (
    !existsSync(file) ||
    !readFileSync(file, "utf8").startsWith("#!/usr/bin/env ")
  )
    errors.push(`${name}: missing executable shebang`);
  else if (!(statSync(file).mode & 0o111))
    errors.push(`${name}: bin must be executable`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Validated ${skills.length} skills, UI metadata, local links, and package bins.`,
  );
