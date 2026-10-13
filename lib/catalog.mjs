import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export const collectionRoots = [
  "skills",
  "revyo-design",
  "revyo-engineering",
  "revyo-seo",
];

export function skillDirectories(root) {
  return collectionRoots.flatMap((collection) =>
    readdirSync(join(root, collection), { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          (collection === "skills" ||
            existsSync(join(root, collection, entry.name, "SKILL.md"))),
      )
      .map((entry) => ({
        name: entry.name,
        path: join(root, collection, entry.name),
      })),
  );
}

export function resolveSkillLink(file, link, skills) {
  const actual = resolve(dirname(file), link);
  if (existsSync(actual)) return actual;
  const sibling = link.match(/^\.\.\/([^/]+)\/(.+)$/);
  if (!sibling) return actual;
  const target = skills.find(({ name }) => name === sibling[1]);
  return target ? resolve(target.path, sibling[2]) : actual;
}
