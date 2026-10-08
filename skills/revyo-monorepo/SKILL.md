---
name: revyo-monorepo
description: Create or extend a Revyo Bun and Turborepo workspace with appropriate app/package boundaries, strict shared tooling, reproducible tasks, and environment-aware caching.
---

# Bun and Turborepo

Use Bun for dependency management and workspace commands. Keep a single root `bun.lock`, a private root package, `workspaces: ["apps/*", "packages/*"]`, a pinned `packageManager`, and the same Bun version in CI. Merge the package manifest created by installing `@revyo/stack`; keep that dependency in root `devDependencies`.

## Workspace shape

```text
apps/
  web/                  Next.js web/API host, when required
  api/                  Separate Vercel API, only if required
  ios/ android/         Requested native mobile targets
  macos/ windows/ linux/ Requested native desktop targets
packages/
  auth/                 Server configuration and explicit client exports
  data/                 Schema, migrations, repository adapters
  <domain>/             Effect services and domain contracts
  ui/                   Shared web components, when reuse exists
  typescript-config/
  eslint-config/
```

Create relevant directories only. Each app is a deployable/buildable boundary. Domain packages own behavior and depend on explicit service contracts. Avoid circular dependencies and app-to-app source imports. Use `@repo/<name>` for private TS packages and `workspace:*` for internal dependencies. Name runnable packages unambiguously for Turbo filters (`web`, `ios`, `macos`, etc.).

Native projects keep their actual platform manifests beneath an app directory. A small private `package.json` there wraps platform build/test commands so Turbo can schedule them. Bun orchestrates those commands; Swift, Gradle, and .NET manage their own dependencies and lockfiles.

Expose only supported entry points through package `exports`. Source-exported TS packages use a bundler-compatible `tsconfig` and require the consumer to transpile them. Compiled packages own `build`/`dist` exports. Do not mix emitted-library settings with a no-emit Next.js config. Share strict settings (`strict`, `noUncheckedIndexedAccess`); extend framework/platform-specific configs where needed. Keep server-only entry points separate from browser-safe contracts.

## Task contract

Root scripts delegate `dev`, `build`, `lint`, `check-types`, `test`, and `test:coverage` to `turbo run <task>`. Add `format` and `format:check`, and a root `quality:crap` script that runs coverage before the installed `revyo-crap` CLI and enforces CRAP ≤ 8 for every function. The [testing skill](../revyo-testing/SKILL.md) owns its config and CI wiring.

Every package with applicable source exposes the tasks that actually verify it. A root green check is insufficient if a package has no script and Turbo silently omits it. Native wrappers expose platform build/test/lint commands; omit TS type checks when no TS exists and verify native compilation through `build`.

Start from this task shape and tailor outputs to the actual tools:

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "!.next/dev/**", "dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "test": { "dependsOn": ["^build"], "outputs": [] },
    "test:coverage": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "test:integration": { "cache": false },
    "db:migrate": { "cache": false }
  }
}
```

Add native build outputs and inputs in app-specific Turbo overrides; do not cache signed binaries, keychain state, or credentials. Use `turbo run <task> --dry=json` to inspect the graph, and execute the relevant real tasks.

## Environment and cache correctness

Hash variables that affect outputs via task `env` or `globalEnv`, including public Next.js variables. `passThroughEnv` makes a variable available but does not hash its value. Do not copy a broad secret list into global pass-through settings. Disable caching for tests that depend on changing live services, migrations, deploy commands, and credential-sensitive integration work. Keep deterministic unit coverage cacheable and cache its actual reports.

Document where `.env` is loaded for each tool; Turbo does not load dotenv for the application. Watch out for workspace cwd differences. Include ignored `.env.example` exceptions in `.gitignore`, validate environment at the runtime boundary, and do not evaluate network clients during import just to satisfy a build.

Use explicit ESLint flat config and Prettier commands. Check the installed Next.js release's supported lint/type-generation commands instead of relying on removed `next lint` behavior. Shared config packages can omit tests when they have no runtime behavior.

Exclude the installed `.agents/skills/`, `.claude/skills/`, and `.agents/revyo-stack.json` from project formatting/lint tools. Reformatting vendor skill files changes the hashes used to protect local edits during package updates.

Official references: [Bun workspaces](https://bun.sh/docs/pm/workspaces), [Turbo tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks), [Turbo environment handling](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables).
