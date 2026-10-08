// Test-only instrumentation harness. Source and published files stay untouched.
import { createInstrumenter } from "istanbul-lib-instrument";
import { createCoverageMap } from "istanbul-lib-coverage";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "revyo-coverage-"));
const records = join(scratch, ".coverage-records");
const recorder = join(scratch, "coverage-recorder.mjs");
const output = join(root, "coverage");
const config = JSON.parse(readFileSync(join(root, "crap.config.json"), "utf8"));

function copyProject() {
  const omitted = [".git", "node_modules", "coverage", "reports", "dist"];
  cpSync(root, scratch, {
    recursive: true,
    filter: (path) => {
      const local = relative(root, path).split("/")[0];
      return !omitted.includes(local);
    },
  });
  symlinkSync(
    join(root, "node_modules"),
    join(scratch, "node_modules"),
    "junction",
  );
  mkdirSync(records);
  writeFileSync(
    recorder,
    `
import { writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
const output = ${JSON.stringify(records)} + "/" + process.pid + "-" + randomUUID() + ".json";
export function flushCoverage() {
  const data = globalThis.__coverage__;
  if (data) writeFileSync(output, JSON.stringify(data));
}
if (!globalThis.__revyoCoverageRecorder) {
  globalThis.__revyoCoverageRecorder = true;
  process.on("exit", flushCoverage);
}
`,
  );
  writeFileSync(
    join(scratch, "coverage-preload.mjs"),
    `
import { afterAll } from "bun:test";
import { flushCoverage } from "./coverage-recorder.mjs";
// Bun's test runner does not reliably run process exit hooks.
afterAll(flushCoverage);
`,
  );
}

function instrumentSources() {
  const baseline = createCoverageMap({});
  for (const pattern of config.include) {
    for (const path of new Bun.Glob(pattern).scanSync({
      cwd: root,
      onlyFiles: true,
    })) {
      const original = join(root, path);
      const instrumenter = createInstrumenter({
        esModules: true,
        compact: false,
        preserveComments: true,
      });
      const source = instrumenter.instrumentSync(
        readFileSync(original, "utf8"),
        original,
      );
      writeFileSync(
        join(scratch, path),
        source + `\nimport ${JSON.stringify(pathToFileURL(recorder).href)};\n`,
      );
      baseline.addFileCoverage(instrumenter.lastFileCoverage());
    }
  }
  return baseline;
}

function run(args) {
  const result = Bun.spawnSync([process.execPath, ...args], {
    cwd: scratch,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (result.exitCode !== 0)
    throw new Error(`Coverage command failed: bun ${args.join(" ")}`);
}

function finishCoverage(map) {
  for (const file of readdirSync(records))
    map.merge(JSON.parse(readFileSync(join(records, file), "utf8")));
  mkdirSync(output, { recursive: true });
  writeFileSync(
    join(output, "coverage-final.json"),
    JSON.stringify(map.toJSON(), null, 2) + "\n",
  );
  const summary = map.getCoverageSummary().toJSON();
  writeFileSync(
    join(output, "coverage-summary.json"),
    JSON.stringify(summary, null, 2) + "\n",
  );
  for (const [metric, minimum] of Object.entries({
    lines: 90,
    statements: 90,
    functions: 90,
    branches: 80,
  })) {
    console.log(
      `Coverage ${metric}: ${summary[metric].pct}% (required ${minimum}%)`,
    );
    if (summary[metric].pct < minimum) process.exitCode = 1;
  }
}

try {
  rmSync(output, { recursive: true, force: true });
  copyProject();
  const baseline = instrumentSources();
  run(["test", "--preload", "./coverage-preload.mjs", "tests"]);
  run(["scripts/validate.mjs"]);
  run(["scripts/smoke-install.mjs"]);
  finishCoverage(baseline);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
