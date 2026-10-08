import { afterEach, describe, expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  analyzeSource,
  crapScore,
  createReport,
  measureFunctions,
  runGate,
} from "../skills/revyo-testing/scripts/crap.mjs";

const roots = [];
function project() {
  const root = mkdtempSync(join(tmpdir(), "revyo-crap-"));
  roots.push(root);
  mkdirSync(join(root, "src"));
  mkdirSync(join(root, "coverage"));
  return root;
}
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);
const config = {
  include: ["src/**/*.ts"],
  coverage: ["coverage/*.json"],
  maxScore: 8,
};
const location = (line, column) => ({ line, column });
const span = (startLine, startCol, endLine, endCol) => ({
  start: location(startLine, startCol),
  end: location(endLine, endCol),
});
const source =
  "export function choose(flag: boolean) {\n  if (flag) return 1;\n  return 0;\n}\n";
const record = (hits = [1, 0]) => ({
  path: "src/choose.ts",
  statementMap: { 0: span(2, 2, 2, 21), 1: span(3, 2, 3, 11) },
  s: { 0: hits[0], 1: hits[1] },
  fnMap: {
    0: { name: "choose", decl: span(1, 16, 1, 22), loc: span(1, 38, 4, 1) },
  },
  f: { 0: 1 },
});

function coveredDecisions(root, decisions) {
  const lines = [
    "export function choose(flags: boolean[]) {",
    ...Array.from(
      { length: decisions },
      (_, index) => `  if (flags[${index}]) return ${index + 1};`,
    ),
    "  return 0;",
    "}",
  ];
  const coverage = {
    path: "src/choose.ts",
    statementMap: {},
    s: {},
    fnMap: {
      0: { loc: span(1, lines[0].indexOf("{"), lines.length, 1) },
    },
    f: { 0: 1 },
  };
  lines.slice(1, -1).forEach((line, index) => {
    coverage.statementMap[index] = span(index + 2, 2, index + 2, line.length);
    coverage.s[index] = 1;
  });
  writeFileSync(join(root, "src/choose.ts"), lines.join("\n") + "\n");
  writeFileSync(
    join(root, "coverage/one.json"),
    JSON.stringify({ "src/choose.ts": coverage }),
  );
}

describe("CRAP metric", () => {
  test("uses a fraction and preserves the known formula values", () => {
    expect(crapScore(10, 0)).toBe(110);
    expect(crapScore(10, 0.5)).toBe(22.5);
    expect(crapScore(10, 1)).toBe(10);
    expect(crapScore(5, 0)).toBe(30);
    expect(() => crapScore(10, 50)).toThrow("fraction");
    expect(() => crapScore(0, 1)).toThrow("positive integer");
  });

  test("counts actual branching, with nested functions measured separately", () => {
    const text = `function outer(x: number = 1) {
  // if while && text do not add decisions
  const message = "if for ??";
  const inner = () => { if (x) return x; return 0; };
  for (const value of [x]) { if (value && x) continue; }
  try { return x ? inner() : 0; } catch { return 0; }
}`;
    const result = analyzeSource("example.ts", text).functions;
    expect(result.map((fn) => [fn.name, fn.complexity])).toEqual([
      ["outer", 7],
      ["inner", 2],
    ]);
  });

  test("includes logical assignment, nullish, optional chains, cases, and real methods", () => {
    const text = `class Example {
  run(value: { x?: number } | undefined) {
    let result = value?.x ?? 0;
    result ||= 2;
    switch (result) { case 1: return 1; case 2: return 2; default: return 0; }
  }
}
function overload(value: string): string;
function overload(value: number): number;
function overload(value: string | number) { return value; }`;
    const result = analyzeSource("example.ts", text).functions;
    expect(result.map((fn) => [fn.name, fn.complexity])).toEqual([
      ["run", 6],
      ["overload", 1],
    ]);
    expect(() => analyzeSource("bad.ts", "function { ")).toThrow(
      "Invalid source",
    );
  });

  test("uses function-owned executable lines rather than the entry counter", () => {
    const result = measureFunctions(
      analyzeSource("src/choose.ts", source),
      record(),
    );
    expect(result[0].complexity).toBe(2);
    expect(result[0].totalLines).toBe(2);
    expect(result[0].coveredLines).toBe(1);
    expect(result[0].coverage).toBe(0.5);
    expect(result[0].score).toBe(2.5);
  });

  test("does not let a covered nested function inflate its parent's coverage", () => {
    const text =
      "function outer() {\n  const inner = () => {\n    return 1;\n  };\n  return 0;\n}\n";
    const coverage = {
      statementMap: {
        0: span(2, 2, 4, 4),
        1: span(3, 4, 3, 13),
        2: span(5, 2, 5, 11),
      },
      s: { 0: 0, 1: 1, 2: 0 },
      fnMap: { 0: { loc: span(1, 17, 6, 1) }, 1: { loc: span(2, 22, 4, 3) } },
      f: { 0: 1, 1: 1 },
    };
    const result = measureFunctions(analyzeSource("nested.ts", text), coverage);
    expect(result.map((fn) => [fn.name, fn.coverage])).toEqual([
      ["outer", 0],
      ["inner", 1],
    ]);
  });

  test("empty functions use an explicit entry fallback; nonempty missing data fails", () => {
    const empty = {
      statementMap: {},
      s: {},
      fnMap: { 0: { loc: span(1, 17, 1, 19) } },
      f: { 0: 0 },
    };
    expect(
      measureFunctions(
        analyzeSource("empty.ts", "function empty() {}"),
        empty,
      )[0].coverage,
    ).toBe(0);
    const missing = record();
    missing.statementMap = {};
    missing.s = {};
    expect(
      measureFunctions(analyzeSource("src/choose.ts", source), missing)[0]
        .error,
    ).toContain("statement coverage");
    const ambiguous = record();
    ambiguous.fnMap[1] = structuredClone(ambiguous.fnMap[0]);
    ambiguous.f[1] = 1;
    expect(
      measureFunctions(analyzeSource("src/choose.ts", source), ambiguous)[0]
        .error,
    ).toBe("Ambiguous function coverage");
  });

  test("rejects invalid counters, unmapped functions, and source range mismatch", () => {
    const invalid = record();
    invalid.s[0] = -1;
    expect(() =>
      measureFunctions(analyzeSource("src/choose.ts", source), invalid),
    ).toThrow("counter");
    const malformed = record();
    malformed.fnMap[0].loc.end.line = 99;
    expect(() =>
      measureFunctions(analyzeSource("src/choose.ts", source), malformed),
    ).toThrow("outside source");
    const unmapped = record();
    unmapped.fnMap[0].loc = span(1, 0, 5, 0);
    expect(() =>
      measureFunctions(analyzeSource("src/choose.ts", source), unmapped),
    ).toThrow("does not match");
  });

  test("rejects malformed coverage coordinates before scoring source", () => {
    const analysis = analyzeSource("src/choose.ts", source);
    for (const position of [
      null,
      { line: 0, column: 2 },
      { line: 2.5, column: 2 },
      { line: 2, column: -1 },
      { line: 2, column: null },
    ]) {
      const malformed = record();
      malformed.statementMap[0].start = position;
      expect(() => measureFunctions(analysis, malformed)).toThrow(
        "Invalid coverage location",
      );
    }
    const outside = record();
    outside.statementMap[0].end.column = 999;
    expect(() => measureFunctions(analysis, outside)).toThrow(
      "column outside source",
    );
    const reversed = record();
    reversed.statementMap[0] = span(3, 2, 2, 2);
    expect(() => measureFunctions(analysis, reversed)).toThrow(
      "Reversed coverage range",
    );
  });

  test("scores real Vitest V8 output, including null ends and never-imported code", () => {
    const fixture = resolve(import.meta.dir, "fixtures/vitest-v8");
    const report = JSON.parse(
      readFileSync(join(fixture, "coverage-final.json"), "utf8"),
    );
    const workflow = measureFunctions(
      analyzeSource(
        "workflow.ts",
        readFileSync(join(fixture, "workflow.ts"), "utf8"),
      ),
      report["workflow.ts"],
    );
    expect(workflow).toHaveLength(9);
    expect(workflow.every((fn) => !fn.error && Number.isFinite(fn.score))).toBe(
      true,
    );
    expect(workflow.find((fn) => fn.name === "label").complexity).toBe(2);
    expect(workflow.find((fn) => fn.name === "constructor").coverage).toBe(1);
    const missing = measureFunctions(
      analyzeSource(
        "never-imported.ts",
        readFileSync(join(fixture, "never-imported.ts"), "utf8"),
      ),
      report["never-imported.ts"],
    );
    expect(missing[0].coverage).toBe(0);
    expect(missing[0].score).toBe(6);
  });
});

describe("coverage gate", () => {
  test("defaults to 8, permits exactly 8, and fails covered complexity above 8", () => {
    const root = project();
    const { maxScore, ...defaults } = config;
    coveredDecisions(root, 7);
    const passing = createReport(root, defaults);
    expect(passing.maxScore).toBe(8);
    expect(passing.functions[0].score).toBe(8);
    expect(passing.passed).toBe(true);

    coveredDecisions(root, 8);
    const failing = createReport(root, defaults);
    expect(failing.functions[0].coverage).toBe(1);
    expect(failing.functions[0].score).toBe(9);
    expect(failing.passed).toBe(false);
    expect(failing.summary.failing).toBe(1);
  });

  test("rejects configurations above 8 instead of weakening the Revyo gate", () => {
    const root = project();
    coveredDecisions(root, 7);
    for (const maxScore of [8.000001, 9, 30, Infinity, "8", 0]) {
      expect(() => createReport(root, { ...config, maxScore })).toThrow(
        "from 1 through 8",
      );
    }
  });

  test("rejects absent, empty, and escaping source/coverage globs", () => {
    const root = project();
    for (const key of ["include", "coverage"]) {
      for (const value of [undefined, "src/**/*.ts", [], ["../outside/**"]]) {
        expect(() => createReport(root, { ...config, [key]: value })).toThrow(
          `${key} must contain`,
        );
      }
    }
    for (const exclude of ["**/*.test.ts", ["/outside/**"], [null]]) {
      expect(() => createReport(root, { ...config, exclude })).toThrow(
        "exclude must contain",
      );
    }
  });

  test("discovers source independently and fails missing coverage even for simple functions", () => {
    const root = project();
    writeFileSync(join(root, "src/choose.ts"), source);
    writeFileSync(
      join(root, "src/missing.ts"),
      "export const missing = () => 1;\n",
    );
    writeFileSync(
      join(root, "coverage/one.json"),
      JSON.stringify({ "src/choose.ts": record([1, 1]) }),
    );
    const result = createReport(root, config);
    expect(result.passed).toBe(false);
    expect(result.summary.failing).toBe(1);
    expect(
      result.functions.find((fn) => fn.name === "missing").score,
    ).toBeNull();
  });

  test("merges compatible report counters without averaging coverage percentages", () => {
    const root = project();
    writeFileSync(join(root, "src/choose.ts"), source);
    writeFileSync(
      join(root, "coverage/one.json"),
      JSON.stringify({ "src/choose.ts": record([1, 0]) }),
    );
    writeFileSync(
      join(root, "coverage/two.json"),
      JSON.stringify({ "src/choose.ts": record([0, 1]) }),
    );
    const result = createReport(root, config);
    expect(result.functions[0].coverage).toBe(1);
    expect(result.functions[0].score).toBe(2);
    const altered = record([1, 1]);
    altered.statementMap[0].start.column = 3;
    writeFileSync(
      join(root, "coverage/two.json"),
      JSON.stringify({ "src/choose.ts": altered }),
    );
    expect(() => createReport(root, config)).toThrow(
      "Incompatible coverage maps",
    );
  });

  test("the threshold is per function and includes exact-boundary scores", () => {
    const root = project();
    writeFileSync(join(root, "src/choose.ts"), source);
    writeFileSync(
      join(root, "coverage/one.json"),
      JSON.stringify({ "src/choose.ts": record([0, 0]) }),
    );
    expect(createReport(root, { ...config, maxScore: 6 }).passed).toBe(true);
    expect(createReport(root, { ...config, maxScore: 5.999 }).passed).toBe(
      false,
    );
    const path = join(root, "crap.config.json");
    writeFileSync(path, JSON.stringify({ ...config, maxScore: 5 }));
    expect(runGate(path)).toBe(1);
    expect(
      JSON.parse(readFileSync(join(root, "reports/crap.json"), "utf8"))
        .functions[0].score,
    ).toBe(6);
  });

  test("exclusions are explicit and missing reports cannot silently pass", () => {
    const root = project();
    writeFileSync(join(root, "src/choose.ts"), source);
    expect(() => createReport(root, config)).toThrow("No coverage reports");
    writeFileSync(
      join(root, "coverage/one.json"),
      JSON.stringify({ "src/choose.ts": record([1, 1]) }),
    );
    writeFileSync(
      join(root, "src/choose.test.ts"),
      "const testOnly = () => 1;",
    );
    expect(
      createReport(root, { ...config, exclude: ["**/*.test.ts"] }).summary
        .functions,
    ).toBe(1);
    expect(() => createReport(root, { ...config, threshold: 20 })).toThrow(
      "Unknown CRAP config key",
    );
    expect(() =>
      createReport(root, { ...config, output: "../outside.json" }),
    ).toThrow("within the project");
  });

  test("rejects summary reports and paths from a different checkout", () => {
    const root = project();
    writeFileSync(join(root, "src/choose.ts"), source);
    writeFileSync(
      join(root, "coverage/one.json"),
      JSON.stringify({ total: { lines: { pct: 100 } } }),
    );
    expect(() => createReport(root, config)).toThrow("coverage-summary.json");
    const outside = record();
    outside.path = "/another-checkout/src/choose.ts";
    writeFileSync(
      join(root, "coverage/one.json"),
      JSON.stringify({ [outside.path]: outside }),
    );
    expect(() => createReport(root, config)).toThrow("outside project");
  });

  test("CLI writes a report for missing data and distinguishes invalid input", () => {
    const root = project();
    writeFileSync(join(root, "src/choose.ts"), source);
    writeFileSync(
      join(root, "coverage/one.json"),
      JSON.stringify({ "src/choose.ts": record([1, 1]) }),
    );
    const path = join(root, "crap.config.json");
    writeFileSync(path, JSON.stringify(config));
    const cli = resolve(
      import.meta.dir,
      "../skills/revyo-testing/scripts/crap.mjs",
    );
    expect(
      Bun.spawnSync([process.execPath, cli, "--config", path]).exitCode,
    ).toBe(0);
    writeFileSync(
      join(root, "src/uncovered.ts"),
      "export const uncovered = () => 1;\n",
    );
    expect(
      Bun.spawnSync([process.execPath, cli, "--config", path]).exitCode,
    ).toBe(1);
    rmSync(join(root, "coverage/one.json"));
    expect(
      Bun.spawnSync([process.execPath, cli, "--config", path]).exitCode,
    ).toBe(2);
  });
});
