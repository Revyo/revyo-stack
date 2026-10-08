# Revyo Stack maintenance

This repository packages reusable agent skills. Keep application scaffolding guidance under `skills/`; do not turn this package into an application monorepo.

- Use Bun for dependencies and commands. `bun run check` validates skills/links, tests the installer and CRAP analyzer, and installs a packed release into isolated repositories.
- `skills/revyo-project/SKILL.md` is the consumer entry point. Keep sibling references relative so installed copies work in both `.agents/skills` and `.claude/skills`.
- All Revyo databases use PostgreSQL on Neon or PlanetScale Postgres. Never introduce MySQL/Vitess options, drivers, schema generation, or migration guidance.
- Preserve user-edited installed files by default. Keep postinstall scoped to the consuming project and make maintainer installs a no-op.
- Keep the installer free of third-party dependencies. The CRAP analyzer can use the package's TypeScript JavaScript API dependency; its scoring and missing-data behavior are documented under `revyo-testing/references/crap.md`.
- Maintain shared CRAP logic in this package. Consumer projects use `revyo-crap` or the `@revyo/stack/crap` export and supply measurement/configuration rather than duplicating the implementation.
- Enforce CRAP ≤ 8 for every executable function in this repository, including the analyzer itself. Run fresh measured coverage before the gate; do not raise the threshold or exclude complex runtime code to pass.
- Verify stack instructions against current official docs when updating APIs. The requested defaults supersede the ar-platform reference.
- Do not publish a release or create remote resources unless requested. `bun pm pack` is the local review artifact.
