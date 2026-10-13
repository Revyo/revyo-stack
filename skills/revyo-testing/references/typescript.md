# TypeScript coverage and CI

## Runner and coverage configuration

Vitest with a matching coverage-provider version is the default TypeScript pipeline.
Bun manages dependencies and launches commands; Vitest’s V8 provider runs under
Node/V8, not Bun’s JavaScriptCore. Another runner is acceptable when it produces
complete, compatible source-mapped Istanbul JSON.

When setting up/changing coverage, adapt [vitest.config.ts](../assets/vitest.config.ts)
and [crap.config.json](../assets/crap.config.json) to the real source directories.
Include never-imported executable source, mirror justified generated/declaration/test-only
exclusions in both configurations, and export `coverage-final.json`, HTML, and a
text summary. Split Node/DOM/browser tests using the installed runner’s supported
configuration. Do not omit routes, auth, migrations, or complex functions to pass.

Applicable workspaces expose `test` and `test:coverage` through Turbo, with workspace-local
reports. Runtime code without tests needs a test plan; `passWithNoTests` is not
coverage evidence. Static configuration packages need only their applicable checks.

## Packaged analyzer

Projects supply coverage/configuration; `@revyo/stack` maintains the analyzer,
scoring, reporting, and parser dependency. Resolve a published release when
configuring/upgrading the gate, and pin it in quality scripts/CI. For example:

```json
{
  "scripts": {
    "quality:crap": "bun run test:coverage && bunx --package @revyo/stack@0.1.1 revyo-crap --config crap.config.json"
  }
}
```

CLI-only usage needs no project dependency or trusted postinstall. A root development
dependency and local `revyo-crap` bin are also supported. Use `@latest` for an
interactive diagnostic after fresh coverage, not for a reproducible CI pin.
Do not copy the installed analyzer into a consumer project.

## Gate integrity and CI

Coverage must succeed before scoring. Cached reports must map to the checked-out
source; regenerate when they cannot be restored portably. Keep reports under
`reports/`, exclude coverage artifacts from source control, and upload useful
reports as CI artifacts.

The maximum is 8 per function, including callbacks/generators/methods and a project’s
own gate implementation when present. No grandfathered violations or average-score
substitute. Initial aggregate thresholds of 90% lines/statements/functions and 80%
branches are suggestions; use assertions/coverage appropriate to the actual risk.

When introducing/changing the gate, verify an above-threshold fixture and a missing-report
case. When fixing a failure, inspect the affected function and uncovered behavior,
then refactor or add meaningful assertions. Avoid coverage-inflation tests.

CI uses the pinned Bun version and `bun install --frozen-lockfile`, a compatible
Node version, and the checks relevant to the implemented targets. Isolate integration/E2E
environments and serialize shared database mutations or allocate per-job databases.

References: [Vitest coverage](https://vitest.dev/guide/coverage),
[Next.js testing](https://nextjs.org/docs/app/guides/testing),
[original CRAP formula](https://www.artima.com/weblogs/viewpost.jsp?thread=215899).
