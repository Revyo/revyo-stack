---
name: revyo-testing
description: Implement behavioral tests, reproducible source coverage, and a per-function CRAP quality gate for Revyo TypeScript backends/web apps and native platform code.
---

# Testing and CRAP

Verify observable behavior and risk, including expected failures. CRAP (Change Risk Anti-Patterns) highlights functions that combine complexity with weak test coverage. It supplements assertions, branch coverage, integration tests, and review; it cannot prove correctness.

## Test the actual boundaries

- Domain: test the real Effect use case with fresh test layers, known time/random inputs, and fake external providers. Assert returned values and durable state or emitted effects, not private implementation calls.
- Persistence/auth: test live adapters and handlers against an isolated database, including uniqueness/transaction behavior, invalid/expired sessions, and unauthorized resource access. Keep these distinct from fake-layer tests.
- Web: test pure helpers and interactive components where appropriate; use Playwright for the first important browser workflow and server-rendered behavior. Include error/empty/loading states that the workflow exposes.
- Native: use native unit, integration, and UI test tools on compatible runners. Test API contracts, login callback/expiry/logout, cancellation, and the platform workflow.

Keep fast tests independent of live cloud credentials. Configure integration tests to use explicit isolated test infrastructure; never fall back to production. Keep clock-sensitive tests deterministic. Avoid snapshot-only assertions, tests that mirror each line, blanket mocking of the unit under test, and tests added solely to inflate coverage.

## TypeScript measurement pipeline

Use Vitest for the default TS coverage pipeline, installed with the matching coverage provider version. Bun manages dependencies and launches commands; Vitest's V8 provider runs under Node/V8, so do not force that command onto Bun's JavaScriptCore runtime. If using another runner, produce the same complete, source-mapped Istanbul JSON data and validate compatibility.

Keep `@revyo/stack` in root dev dependencies and use its packaged `revyo-crap` executable. The package supplies the analyzer, scoring logic, reporting, and TypeScript parser dependency; projects supply coverage and `crap.config.json`. Do not copy the script out of the installed skills or create another CRAP implementation in the project. Read [references/crap.md](references/crap.md) for the measurement contract and failure semantics.

1. Adapt [assets/vitest.config.ts](assets/vitest.config.ts) in each workspace with tested TS code. Set explicit coverage `include` globs for **all** executable source, including never-imported files. Match source exclusions in both the coverage configuration and CRAP configuration. Split Node/DOM/browser tests using the installed Vitest version's supported configuration. Export `coverage-final.json`, HTML, and a text summary.
2. Adapt [assets/crap.config.json](assets/crap.config.json) at repo root. Include each app/package's actual source directories, add or remove scopes deliberately, and document justified exclusions for generated/declaration/test-only code. Do not exclude auth, routes, migrations, or complex functions to pass the gate.
3. Each applicable workspace exposes `test: "vitest run"` and `test:coverage: "vitest run --coverage"`. Route those tasks through Turbo. Ensure `test:coverage` writes workspace-local `coverage/coverage-final.json` and is not skipped merely because a source package has no tests. A no-test package with runtime code needs a deliberate test plan, not `passWithNoTests` to create a green build.
4. Root `quality:crap` runs `bun run test:coverage && revyo-crap --config crap.config.json`. Do not score stale artifacts after a failing coverage run. For cross-machine caches, coverage paths must still map to the current source checkout; use fresh coverage when the report cannot be restored portably.
5. Run the gate and inspect the worst functions and uncovered lines. Refactor real branching or add assertions for missing behavior. Keep report output under `reports/` and coverage artifacts out of source control, but upload them as CI artifacts.

Use this root script after wiring the project's coverage command:

```json
{
  "scripts": {
    "quality:crap": "bun run test:coverage && revyo-crap --config crap.config.json"
  }
}
```

Run it with `bun run quality:crap`. For a direct diagnostic run after fresh coverage, use `bunx --no-install revyo-crap --config crap.config.json`.

The Revyo gate is **CRAP ≤ 8 for every measured function**, including nested callbacks/generators and class methods. Apply this rule to generated projects and to any repository that implements or uses these tools, including this skills package. A project can choose a stricter limit; do not raise the limit above 8 or grandfather violations to pass CI. Suggested initial aggregate thresholds are 90% lines/statements/functions and 80% branches; apply stronger assertions/coverage to security and irreversible state changes.

The score is:

```text
CRAP(f) = CC(f)^2 × (1 - coverage(f))^3 + CC(f)
coverage is a fraction in [0, 1], not a percent in [0, 100].
```

Examples: CC 4 with no coverage scores 20; CC 4 with 50% coverage scores 6; fully covered CC 8 scores 8. Coverage alone cannot bring a function with CC greater than 8 below the limit of 8; refactor it.

## Native measurement

The bundled CLI measures JS/TS only. Do not feed Swift/Kotlin/C# files into it, or use backend coverage as evidence for native code.

For each requested language, choose a supported per-function cyclomatic-complexity analyzer and source-mapped coverage exporter from the actual toolchain. Join by source path plus function range and exclude nested functions from parents. A Bun measurement adapter can import `crapScore` from `@revyo/stack/crap` to reuse the package's formula; do not reimplement scoring in each repo. Enforce the same maximum of 8 and test covered/uncovered, overloaded, and unmatched functions. Use native line/region reports (for example LLVM/Xcode, JaCoCo/Kover, or .NET coverage) after checking version-specific export support. Report incompatible or absent measurement as a failure/blocker, never as 100% coverage.

Keep a language-specific report with path, function/range, complexity, covered/total lines, score, and provenance. Run it in the target's Turbo wrapper and CI job. If a suitable analyzer is unavailable, complete behavior tests and native builds, then report the missing gate precisely; do not claim the full quality requirement passed.

## CI and completion

Install with the pinned Bun version and `bun install --frozen-lockfile`; use a compatible Node version for Vitest and native SDK runners for native apps. Gate changes on lint, type checks/native compilation, behavioral tests, fresh coverage plus CRAP, and production builds. Add integration/E2E jobs for implemented boundaries with isolated env. Serialize mutations that share a test database, or allocate independent databases per job.

Run the score against the whole executable source set, including the gate's own implementation when present. Keep test-only fixtures and generated assets separately scoped. Enforce the absolute limit of 8 without a baseline bypass, average-score substitute, or exclusions for difficult functions.

Verify the quality gate itself using a fixture above threshold and a missing-report case, then remove temporary failing fixtures. A passing mean score cannot hide one failing function. Report actual commands/results and unresolved adapter, toolchain, or credential limitations.

Official references: [original CRAP formula](https://www.artima.com/weblogs/viewpost.jsp?thread=215899), [Vitest coverage](https://vitest.dev/guide/coverage), [Next.js testing](https://nextjs.org/docs/app/guides/testing).
