# CRAP measurement contract

`@revyo/stack` ships the `revyo-crap` executable and its TypeScript **JavaScript parser API** dependency. Run it directly from npm with Bun; CLI-only use needs no project dependency or trusted postinstall script. Projects configure coverage and source globs; the tested analyzer, formula, report, and gate remain maintained in this package. The [script beside this reference](../scripts/crap.mjs) documents the implementation; do not copy it into a new project or run the installed skill copy as a separate implementation.

```sh
bun run test:coverage
bunx --package @revyo/stack@latest revyo-crap --config crap.config.json
```

For root quality scripts and CI, resolve a published release during setup and replace `@latest` with its exact version, such as `@0.1.0`. A project can instead keep `@revyo/stack` in root dev dependencies and run the local `revyo-crap` bin.

For Bun-based measurement adapters and tooling, install `@revyo/stack` as a root development dependency to import the same implementation at `@revyo/stack/crap`:

```js
import { crapScore } from "@revyo/stack/crap";

const score = crapScore(complexity, coveredLines / totalLines);
```

`crapScore(complexity, coverage)` validates a positive integer complexity and a finite coverage fraction between 0 and 1. It calculates the metric; the JS/TS CLI enforces the maximum of 8. Native adapters must measure their own source/functions, handle absent or ambiguous coverage as failures, and enforce that same maximum. This export also provides `analyzeSource`, `measureFunctions`, `createReport`, and `runGate` for JS/TS tooling; it does not supply native analyzers.

All source/report/output globs are relative to the config file's directory. Use `--cwd PATH` only to locate a relative config from another directory. Score reports identify source files relative to that root. Supported source extensions are JS/JSX/TS/TSX/MJS/CJS/MTS/CTS.

## Configuration

| Key        | Meaning                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| `include`  | Nonempty source-glob array; enumerates source independently of coverage |
| `exclude`  | Source exclusions, mirrored in coverage configuration                   |
| `coverage` | Nonempty array of globs for Istanbul `coverage-final.json` files        |
| `maxScore` | Finite score threshold from 1 through 8; default and Revyo maximum 8    |
| `output`   | JSON report path under the config root; default `reports/crap.json`     |

Unknown keys are errors to prevent silent configuration mistakes. The gate fails if no source files, no coverage reports, or no executable functions are found. A native-only project needs a native gate rather than an empty TS config.

## Complexity convention

Analyze each executable function body separately, including arrows, generators, constructors, getters/setters, and methods. Declarations/overload signatures without bodies are not functions to score. Complexity starts at 1, then adds 1 for each `if`, loop (`for`, `for in`, `for of`, `while`, `do`), `catch`, ternary, non-default `case`, boolean/nullish short circuit (`&&`, `||`, `??` and assignment forms), optional-chain operation, and default parameter initializer.

Nested function decisions belong to the nested function, not its parent. Type-level conditional syntax and text in comments/strings do not add complexity. This is a documented TypeScript cyclomatic convention; tools using other conventions can yield different numbers. It is not cognitive complexity.

## Coverage convention

Require source-mapped Istanbul JSON with `statementMap`, `s`, `fnMap`, and `f`. Function ranges must map to the original source, not transpiled JS. Join coverage functions to the smallest containing AST function range. Some reporters use a null end column to represent an end-of-line boundary; accept it only as an end position and require the function's end line to match the AST. Fail on missing or ambiguous matches rather than inferring that unreported code is covered.

Assign each statement's start to the innermost containing function body or default-parameter range. Compute line coverage from distinct statement-start lines, marking a line covered if any owned statement on it executes (the Istanbul line convention). Exclude nested-function statements from the parent. Functions with executable statements are measured from those lines, **not** from the percent of functions called or the file's aggregate percentage. Empty functions with no executable statements use their entry counter as a single entry-line fallback; nonempty bodies without usable statement data fail.

The line convention can report a same-line expression as covered while one short-circuit branch is missed. Retain separate branch coverage and behavioral assertions; do not reinterpret the formula as proof of all paths being tested.

Multiple reports for one source are merged only when their statement/function maps match exactly; counts are added. Differing maps fail with a request to regenerate compatible reports. Source paths in reports must resolve in the current checkout; regenerate reports restored from another absolute checkout path unless normalized by a verified reporter.

## Gate and report

Use raw precision for comparison: a score passes when it is `<= maxScore`, whose maximum is 8. Round only for terminal display. JSON includes each function's path/name/range, complexity, executable/covered line counts, coverage fraction, score, and measurement errors. Missing data produces `null` for coverage/score and fails the gate, including when low complexity would otherwise keep the numeric score below 8. Apply the same rule to the analyzer and installer in this repository.

Exit 0 means every measured function passed. Exit 1 means a score failure or an AST function with missing/ambiguous coverage, with a JSON report. Exit 2 means invalid configuration/input/tooling (including missing reports, invalid source syntax, or coverage ranges that cannot map to source). The score never drops below complexity: full coverage gives `CRAP = CC`, and zero coverage gives `CRAP = CC² + CC`.

Coverage must be freshly generated from the checked-out source before gating. The file format alone does not prove freshness; the root script and CI sequence enforce it. Do not hand-edit coverage JSON or lower thresholds to hide a failing behavior.
