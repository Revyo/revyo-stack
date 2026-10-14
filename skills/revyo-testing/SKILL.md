---
name: revyo-testing
description: Configure or fix behavioral tests, source coverage, or the CRAP quality gate when changing test strategy or measurement.
---

# Testing and CRAP

Choose checks that establish the changed behavior and its risks. Use observable
outcomes, not implementation-call assertions or mocks of the unit under test.
Domain tests use controlled Effect services; real SQL/auth adapters and browser/native
behavior need checks at those boundaries when affected.

Keep fast tests independent of live credentials. Integration tests use explicit,
isolated infrastructure and never fall back to production.

Read the relevant setup/measurement reference:

- TypeScript coverage, Vitest, Turbo/CI wiring, or analyzer installation:
  [TypeScript pipeline](references/typescript.md).
- Scoring, source/report matching, configuration, or gate failures:
  [measurement contract](references/crap.md).
- Native-language coverage and complexity: [native measurement](references/native.md).

The Revyo maximum is **CRAP ≤ 8 per executable function**. Generate fresh coverage
before gating; missing/ambiguous measurement fails. Do not raise thresholds,
substitute averages, or exclude difficult source to pass. Reuse the packaged
analyzer/formula instead of maintaining project copies.

CRAP supplements behavioral assertions and branch coverage; it does not prove
correctness. Run affected checks, fix change-related failures, and repeat checks
when fixes or unresolved concerns warrant it. A full coverage/build/E2E cycle
belongs in the relevant project gate, not every small edit. Report the actual
outcome and any specific boundary that could not be verified.
