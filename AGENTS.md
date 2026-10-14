# Revyo Stack maintenance

This repository packages reusable agent skills. Keep application scaffolding guidance under `skills/`; do not turn this package into an application monorepo.

- Use Bun for dependencies and commands. `bun run check` validates skills/links, tests the installer and CRAP analyzer, and installs a packed release into isolated repositories.
- `skills/revyo-project/SKILL.md` is the consumer entry point. Keep sibling references relative so installed copies work in both `.agents/skills` and `.claude/skills`.
- All Revyo databases use PostgreSQL on Neon or PlanetScale Postgres. Never introduce MySQL/Vitess options, drivers, schema generation, or migration guidance.
- Preserve user-edited installed files by default. Keep postinstall scoped to the consuming project and make maintainer installs a no-op.
- Keep the installer free of third-party dependencies. The CRAP analyzer can use the package's TypeScript JavaScript API dependency; its scoring and missing-data behavior are documented under `revyo-testing/references/crap.md`.
- Maintain shared CRAP logic in this package. Consumer projects use `revyo-crap` or the `@revyo/stack/crap` export and supply measurement/configuration rather than duplicating the implementation.
- Enforce CRAP ≤ 8 for every Revyo-maintained executable function, including the analyzer and upstream updater. Run fresh measured coverage before the gate; do not raise the threshold or exclude complex runtime code to pass. Third-party snapshots retain upstream implementations and are not rewritten to satisfy our gate.
- Verify stack instructions against current official docs when updating APIs. The requested defaults supersede the ar-platform reference.
- Do not publish a release or create remote resources unless requested. `bun pm pack` is the local review artifact.

Curated skills live in `revyo-design/`, `revyo-engineering/`, and `revyo-seo/`. Update sources in
`upstream-sources.json` and discovery descriptions in `upstream-overrides.json`;
`bun run upstream:sync` rebuilds the snapshots. Keep source attribution and licenses.
Use concise discovery descriptions, automatic invocation, and task-specific
references. Follow the [OpenAI guidance](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)
when revising instructions. Local tests use disposable fixtures with no production
access; run them and fix change-related failures through completion.
