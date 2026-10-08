import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const sourceRoot = resolve(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "revyo-package-"));
const archive = join(scratch, "revyo-stack.tgz");

function run(cwd, args) {
  const result = Bun.spawnSync(args, { cwd, env: process.env });
  if (result.exitCode !== 0)
    throw new Error(
      `${args.join(" ")} failed:\n${result.stdout.toString()}${result.stderr.toString()}`,
    );
  return result.stdout.toString();
}

function writeCrapFixture(root, hits) {
  const folder = join(root, "crap-smoke");
  mkdirSync(folder, { recursive: true });
  const lines = [
    "export function choose(first: boolean, second: boolean) {",
    "  if (first) return 1;",
    "  if (second) return 2;",
    "  return 0;",
    "}",
  ];
  const statements = lines.slice(1, -1).map((line, index) => [
    index,
    {
      start: { line: index + 2, column: 2 },
      end: { line: index + 2, column: line.length },
    },
  ]);
  const coverage = {
    path: "choose.ts",
    statementMap: Object.fromEntries(statements),
    s: Object.fromEntries(statements.map(([index]) => [index, hits])),
    fnMap: {
      0: {
        name: "choose",
        loc: {
          start: { line: 1, column: lines[0].indexOf("{") },
          end: { line: 5, column: 1 },
        },
      },
    },
    f: { 0: hits },
    branchMap: {},
    b: {},
  };
  writeFileSync(join(folder, "choose.ts"), lines.join("\n") + "\n");
  writeFileSync(
    join(folder, "coverage-final.json"),
    JSON.stringify({ "choose.ts": coverage }),
  );
  writeFileSync(
    join(folder, "crap.config.json"),
    JSON.stringify({
      include: ["*.ts"],
      coverage: ["coverage-final.json"],
      maxScore: 8,
    }),
  );
}

function installedCrapReport(root, commandRoot, expectedExit) {
  const result = Bun.spawnSync(
    [
      "bunx",
      "--no-install",
      "revyo-crap",
      "--config",
      join(root, "crap-smoke/crap.config.json"),
    ],
    { cwd: commandRoot, env: process.env },
  );
  assert.equal(
    result.exitCode,
    expectedExit,
    `Installed CRAP gate returned an unexpected status:\n${result.stdout.toString()}${result.stderr.toString()}`,
  );
  return JSON.parse(
    readFileSync(join(root, "crap-smoke/reports/crap.json"), "utf8"),
  );
}

function verifyCrap(root, commandRoot) {
  writeCrapFixture(root, 1);
  const passing = installedCrapReport(root, commandRoot, 0);
  assert.equal(passing.passed, true);
  assert.equal(passing.maxScore, 8);
  assert.equal(passing.functions[0].score, 3);
  writeCrapFixture(root, 0);
  const failing = installedCrapReport(root, commandRoot, 1);
  assert.equal(failing.passed, false);
  assert.equal(failing.functions[0].score, 12);
  run(commandRoot, [
    "bun",
    "-e",
    'import assert from "node:assert/strict"; import { crapScore } from "@revyo/stack/crap"; assert.equal(crapScore(4, 0.5), 6);',
  ]);
}

function verify(root, commandRoot = root) {
  assert.ok(
    existsSync(join(root, ".agents/skills/revyo-project/SKILL.md")),
    `entry point was not installed at ${root}`,
  );
  assert.ok(
    existsSync(join(root, ".agents/skills/revyo-testing/scripts/crap.mjs")),
    "CRAP resource was not packed",
  );
  assert.ok(
    existsSync(
      join(root, ".agents/skills/revyo-testing/assets/vitest.config.ts"),
    ),
    "coverage template was not packed",
  );
  assert.ok(
    readFileSync(join(root, "AGENTS.md"), "utf8").includes(
      "revyo-project/SKILL.md",
    ),
  );
  const state = JSON.parse(
    readFileSync(join(root, ".agents/revyo-stack.json"), "utf8"),
  );
  assert.equal(
    Object.keys(state.files).filter((file) => file.endsWith("/SKILL.md"))
      .length,
    9,
  );
  assert.ok(
    run(commandRoot, ["bunx", "--no-install", "revyo-crap", "--help"]).includes(
      "Usage: revyo-crap",
    ),
  );
  verifyCrap(root, commandRoot);
}

try {
  run(sourceRoot, ["bun", "pm", "pack", "--filename", archive, "--quiet"]);
  const trusted = join(scratch, "trusted");
  mkdirSync(trusted);
  run(trusted, ["bun", "add", "--dev", "--trust", archive]);
  verify(trusted);
  const manifest = JSON.parse(
    readFileSync(join(trusted, "package.json"), "utf8"),
  );
  assert.ok(manifest.trustedDependencies.includes("@revyo/stack"));
  run(trusted, ["bunx", "--no-install", "revyo-stack", "install", "--claude"]);
  assert.ok(existsSync(join(trusted, ".claude/skills/revyo-web/SKILL.md")));
  const instructions = readFileSync(join(trusted, "AGENTS.md"), "utf8");
  run(trusted, ["bunx", "--no-install", "revyo-stack", "install"]);
  assert.equal(readFileSync(join(trusted, "AGENTS.md"), "utf8"), instructions);

  const explicit = join(scratch, "explicit");
  mkdirSync(explicit);
  run(explicit, ["bun", "add", "--dev", "--ignore-scripts", archive]);
  assert.ok(
    !existsSync(join(explicit, ".agents")),
    "ignore-scripts should skip copying",
  );
  run(explicit, ["bunx", "--no-install", "revyo-stack", "install"]);
  verify(explicit);

  const workspace = join(scratch, "workspace");
  const app = join(workspace, "apps/web");
  mkdirSync(app, { recursive: true });
  writeFileSync(
    join(workspace, "package.json"),
    JSON.stringify({
      name: "smoke-workspace",
      private: true,
      workspaces: ["apps/*"],
    }),
  );
  writeFileSync(
    join(app, "package.json"),
    JSON.stringify({ name: "smoke-web", private: true }),
  );
  run(app, ["bun", "add", "--dev", "--trust", archive]);
  verify(workspace, app);
  assert.ok(
    !existsSync(join(app, ".agents")),
    "hoisted lifecycle should install at the workspace root",
  );
  console.log(
    "Packed-package smoke passed: empty repo, explicit/Claude/workspace installs, CRAP pass/fail, and shared scoring export.",
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
