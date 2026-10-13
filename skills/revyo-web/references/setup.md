# Next.js setup and package boundaries

When scaffolding, resolve the latest stable Next.js release and its compatible
React/runtime requirements. Use TypeScript and supported generator options.
Generate in a temporary directory or merge deliberately into `apps/web`; preserve
the existing manifest and installed skills. Keep one root lockfile instead of
retaining a generator’s nested install/lockfile.

Mark server-only entry points with `server-only` where supported, with separate
browser-safe contract exports. Source-exported internal packages may need
`transpilePackages`; validate that boundary with a production build.

When changing framework APIs, follow the installed release’s async request APIs,
route/proxy conventions, and type generation. Provide applicable `dev`, `build`,
`start`, `lint`, `check-types`, `test`, and `test:coverage` commands. Run the supported
type-generation command before `tsc --noEmit` when route types need generation.
Keep Turbo output globs aligned with the actual build.

Builds do not apply migrations or require production data. Document safe fixture
values if build-time environment is necessary. Use the selected runtime’s supported
commands: Bun package management alone does not configure Vercel’s Bun runtime.

References: [installation](https://nextjs.org/docs/app/getting-started/installation),
[server/client components](https://nextjs.org/docs/app/getting-started/server-and-client-components),
[testing](https://nextjs.org/docs/app/guides/testing).
