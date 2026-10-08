import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { installSkills, postinstallRoot } from "../lib/install.mjs";

const roots = [];
const project = () => {
  const root = mkdtempSync(join(tmpdir(), "revyo-install-"));
  roots.push(root);
  return root;
};
const installed = ".agents/skills/revyo-project/SKILL.md";
const hash = (text) => createHash("sha256").update(text).digest("hex");
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);

describe("skill installation", () => {
  test("an empty project gets all skill resources, a route, and provenance", () => {
    const root = project();
    const result = installSkills({ root, quiet: true });
    expect(result.targets).toEqual([".agents/skills"]);
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toContain(
      ".agents/skills/revyo-project/SKILL.md",
    );
    expect(
      existsSync(join(root, ".agents/skills/revyo-testing/scripts/crap.mjs")),
    ).toBe(true);
    const state = JSON.parse(
      readFileSync(join(root, ".agents/revyo-stack.json"), "utf8"),
    );
    expect(
      Object.keys(state.files).filter((file) => file.endsWith("/SKILL.md")),
    ).toHaveLength(9);
    expect(state.files[installed]).toBe(
      hash(readFileSync(join(root, installed))),
    );
  });

  test("reinstallation preserves project instructions and unrelated skills", () => {
    const root = project();
    const instructions = "# Project instructions\n\nUse project vocabulary.\n";
    writeFileSync(join(root, "AGENTS.md"), instructions);
    mkdirSync(join(root, ".agents/skills/custom"), { recursive: true });
    writeFileSync(
      join(root, ".agents/skills/custom/SKILL.md"),
      "Custom guidance",
    );
    installSkills({ root, quiet: true });
    const first = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(installSkills({ root, quiet: true }).changed).toEqual([]);
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe(first);
    expect(first.startsWith(instructions)).toBe(true);
    expect(
      readFileSync(join(root, ".agents/skills/custom/SKILL.md"), "utf8"),
    ).toBe("Custom guidance");
  });

  test("an edited skill aborts the entire install before changing other files", () => {
    const root = project();
    installSkills({ root, quiet: true });
    writeFileSync(join(root, installed), "Local custom skill");
    const pending = join(root, ".agents/skills/revyo-web/SKILL.md");
    rmSync(pending);
    const stateBefore = readFileSync(
      join(root, ".agents/revyo-stack.json"),
      "utf8",
    );
    expect(() => installSkills({ root, quiet: true })).toThrow(
      "Edited files were preserved",
    );
    expect(existsSync(pending)).toBe(false);
    expect(readFileSync(join(root, installed), "utf8")).toBe(
      "Local custom skill",
    );
    expect(readFileSync(join(root, ".agents/revyo-stack.json"), "utf8")).toBe(
      stateBefore,
    );
    installSkills({ root, force: true, quiet: true });
    expect(readFileSync(join(root, installed), "utf8")).toContain(
      "name: revyo-project",
    );
    expect(existsSync(pending)).toBe(true);
  });

  test("unedited files from a previous release update", () => {
    const root = project();
    installSkills({ root, quiet: true });
    writeFileSync(join(root, installed), "Previous release content");
    const stateFile = join(root, ".agents/revyo-stack.json");
    const state = JSON.parse(readFileSync(stateFile, "utf8"));
    state.files[installed] = hash("Previous release content");
    writeFileSync(stateFile, JSON.stringify(state));
    expect(installSkills({ root, quiet: true }).changed).toContain(installed);
    expect(readFileSync(join(root, installed), "utf8")).toContain(
      "name: revyo-project",
    );
  });

  test("edited managed instructions need force, while outside text stays intact", () => {
    const root = project();
    installSkills({ root, quiet: true });
    const file = join(root, "AGENTS.md");
    writeFileSync(
      file,
      "Custom before\n" +
        readFileSync(file, "utf8").replace(
          "Read the relevant skills",
          "Edited routing",
        ) +
        "\nCustom after\n",
    );
    expect(() => installSkills({ root, quiet: true })).toThrow(
      "AGENTS.md (Revyo block)",
    );
    installSkills({ root, force: true, quiet: true });
    expect(readFileSync(file, "utf8").startsWith("Custom before\n")).toBe(true);
    expect(readFileSync(file, "utf8").endsWith("\nCustom after\n")).toBe(true);
  });

  test("Claude copies keep working sibling resources and update on reinstall", () => {
    const root = project();
    installSkills({ root, claude: true, quiet: true });
    const path = join(root, ".claude/skills/revyo-testing/references/crap.md");
    expect(existsSync(path)).toBe(true);
    rmSync(path);
    expect(installSkills({ root, quiet: true }).targets).toContain(
      ".claude/skills",
    );
    expect(existsSync(path)).toBe(true);
  });

  test("symlinked destinations do not redirect writes outside the project", () => {
    const root = project();
    const outside = project();
    symlinkSync(outside, join(root, ".agents"));
    expect(() => installSkills({ root, quiet: true })).toThrow(
      "Refusing symlink",
    );
    expect(existsSync(join(outside, "revyo-stack.json"))).toBe(false);
    expect(existsSync(join(root, "AGENTS.md"))).toBe(false);
  });

  test("malformed routing markers fail without editing the document", () => {
    const root = project();
    const text = "User text\n<!-- revyo-stack:start -->\nUnclosed block\n";
    writeFileSync(join(root, "AGENTS.md"), text);
    expect(() => installSkills({ root, quiet: true })).toThrow("malformed");
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe(text);
    expect(existsSync(join(root, installed))).toBe(false);
  });

  test("maintainer lifecycle is a no-op; explicit CLI installs at the requested cwd", () => {
    expect(postinstallRoot()).toBeUndefined();
    const root = project();
    const child = Bun.spawnSync([
      "node",
      resolve(import.meta.dir, "../bin/revyo-stack.mjs"),
      "install",
      "--cwd",
      root,
    ]);
    expect(child.exitCode).toBe(0);
    expect(existsSync(join(root, installed))).toBe(true);
    const invalid = Bun.spawnSync([
      "node",
      resolve(import.meta.dir, "../bin/revyo-stack.mjs"),
      "install",
      "--unknown",
    ]);
    expect(invalid.exitCode).toBe(1);
  });

  test("postinstall escapes Bun's isolated store and finds a workspace root", () => {
    const root = project();
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ private: true, workspaces: ["apps/*"] }),
    );
    const isolated = join(
      root,
      "node_modules/.bun/@revyo+stack@0.1.0/node_modules/@revyo/stack",
    );
    expect(postinstallRoot(isolated)).toBe(root);
    const childInstall = join(root, "apps/web/node_modules/@revyo/stack");
    expect(postinstallRoot(childInstall)).toBe(root);
  });
});
