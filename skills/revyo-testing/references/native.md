# Native complexity and coverage

The bundled CLI analyzes JS/TS only. Native source needs its own per-function
complexity analyzer and source-mapped coverage exporter from the target toolchain.
Backend coverage does not establish native coverage.

Join measurements by source path and function range, excluding nested-function
statements from parents. Use supported line/region exports such as LLVM/Xcode,
JaCoCo/Kover, or .NET reports after checking the selected toolchain’s export support.
Keep a report with source/function range, complexity, covered/total lines, score,
and provenance.

A Bun adapter imports `crapScore` from `@revyo/stack/crap` with `@revyo/stack` as a
root development dependency. Reuse that formula and enforce the maximum of 8.
The shared API does not provide native analyzers. Verify covered/uncovered,
overloaded, and unmatched functions when implementing the measurement adapter.
Absent or ambiguous coverage fails instead of becoming 100% coverage.

Wire native measurement into the target’s Turbo wrapper and compatible CI runner.
If no suitable analyzer/exporter is available, finish behavior checks and native
builds that can run, then report the precise missing quality-gate component. Do
not describe the full requirement as passed.
