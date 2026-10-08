# Revyo Stack

Agent skills for creating Revyo Software projects. The entry point coordinates focused skills for Bun and Turborepo, Next.js, native apps, Better Auth, PostgreSQL on Neon or PlanetScale Postgres, Effect v4, Vercel, and testing with a per-function CRAP gate.

## Install into a new project

After this package is published under the configured npm scope:

```sh
mkdir my-project
cd my-project
bun add --dev --trust @revyo/stack
```

The installer copies the skills into `.agents/skills/`, adds a small routing block to `AGENTS.md`, and records file hashes in `.agents/revyo-stack.json`. Commit all three with your project. Bun creates the initial `package.json` and lockfile; the agent then builds the app in the same repository.

`--trust` lets Bun run this package's postinstall script. Without it, the package installs but Bun blocks the file-copy step. See [Bun's trusted dependency documentation](https://bun.sh/docs/pm/cli/add).

For an explicit installation, or after installing with lifecycle scripts disabled:

```sh
bun add --dev @revyo/stack
bunx --no-install revyo-stack install
```

For Claude Code, also copy the skills into its discovery directory:

```sh
bunx --no-install revyo-stack install --claude
```

Both copies use the same sibling links. Subsequent installs update both if the Claude copy was previously installed. Restart the agent session if newly installed skills do not appear in its catalog. Any agent can read the entry point directly.

## Tell the agent what to build

```text
Use $revyo-project to set up this repository for a Revyo Software project.
Build a customer portal with a Next.js web app, Better Auth, and Neon.
Use the installed stack skills and wire up the testing and CRAP quality gate.
```

If skill invocation is unavailable:

```text
Read .agents/skills/revyo-project/SKILL.md and set up this project using its
linked skills. The product is a customer portal with a Next.js web app and Neon.
```

Specify mobile and desktop target operating systems when needed. Native means platform UI and toolchains: Swift/SwiftUI, Kotlin/Compose, WinUI, or an appropriate Linux toolkit. It does not mean a WebView shell. Vercel hosts the web app and backend; native binaries use platform distribution.

## Skills

| Skill                                            | Responsibility                                                 |
| ------------------------------------------------ | -------------------------------------------------------------- |
| [revyo-project](skills/revyo-project/SKILL.md)   | Entry point, decisions, project setup, completion checks       |
| [revyo-monorepo](skills/revyo-monorepo/SKILL.md) | Bun workspaces, Turborepo, package boundaries, shared tooling  |
| [revyo-web](skills/revyo-web/SKILL.md)           | Latest stable Next.js, App Router, server/client boundaries    |
| [revyo-native](skills/revyo-native/SKILL.md)     | Native mobile and desktop apps, contracts, platform checks     |
| [revyo-auth](skills/revyo-auth/SKILL.md)         | Better Auth, sessions, authorization, native login             |
| [revyo-database](skills/revyo-database/SKILL.md) | PostgreSQL on Neon/PlanetScale, Drizzle, drivers, migrations   |
| [revyo-effect](skills/revyo-effect/SKILL.md)     | Effect v4 services, typed failures, layers, runtime boundaries |
| [revyo-vercel](skills/revyo-vercel/SKILL.md)     | Vercel projects, environments, serverless execution            |
| [revyo-testing](skills/revyo-testing/SKILL.md)   | Behavioral tests, coverage, CRAP reporting, CI gates           |

The skills take architectural cues from `ar-platform` (domain packages, Effect services, composed live/test layers, shared tooling). They use the requested new-project defaults instead of carrying forward that project's WorkOS, Nile, pinned framework versions, or desktop implementation. Reference provenance is documented in [the entry point's reference](skills/revyo-project/references/ar-platform.md).

All Revyo databases use PostgreSQL. Choosing PlanetScale means PlanetScale Postgres. Both providers use PostgreSQL schemas and migrations, Drizzle Kit's `postgresql` dialect, and Better Auth's `pg` adapter provider. MySQL and Vitess are never used.

## Testing and CRAP

`@revyo/stack` ships the reusable `revyo-crap` CLI and its parser dependency. It combines TypeScript AST complexity with Istanbul JSON coverage. Generated projects keep this package as a root development dependency, configure coverage and `crap.config.json`, and use:

```sh
bunx --no-install revyo-crap --config crap.config.json
```

The testing skill wires the project's root quality script to this packaged executable:

```json
{
  "scripts": {
    "quality:crap": "bun run test:coverage && revyo-crap --config crap.config.json"
  }
}
```

Run `bun run quality:crap` to generate fresh coverage and check it. Projects reuse the package's implementation rather than copying or rewriting CRAP logic. Bun-based native measurement adapters can also import its shared `crapScore` function from `@revyo/stack/crap`; native complexity/coverage extraction still needs platform-specific tooling.

The Revyo maximum is **CRAP ≤ 8 for every function**. The skill supplies the configuration and Vitest wiring. The gate fails for missing source coverage, unmatched functions, malformed reports, or any function above the configured score (default 8; stricter values are allowed). Scores use per-function executable line coverage, not file averages or function call counts. Native projects use platform test tools and need a language-specific complexity/coverage adapter; this CLI analyzes JavaScript and TypeScript only.

This repository follows the same rule. `bun run quality:crap` runs its Bun tests and CLI smoke checks against an isolated Istanbul-instrumented copy, enforces 90% lines/statements/functions and 80% branches, then scores every function in the installer, analyzer, and repository scripts with a maximum of 8. Source and published files stay untouched. `bun run check` includes this gate, so it also runs in CI and before publication. Reports are written to `coverage/` and `reports/crap.json`.

## Updates

```sh
bun update @revyo/stack
bunx --no-install revyo-stack install
```

Reinstallation is idempotent. Unedited package-owned files update; locally edited skills are preserved and cause installation to stop before any writes. Existing `AGENTS.md` text outside the marked Revyo block and unrelated skills are preserved. Put project-specific guidance outside the managed block, then use `--force` only when you intend to replace edited Revyo files. Files removed from a later package release are retained for manual review.

## Develop and publish this repository

```sh
bun install
bun run check
bun pm pack
```

Source is maintained at [Revyo/revyo-stack](https://github.com/Revyo/revyo-stack). Before publishing the npm package, set the desired version and registry. Publish from an authorized session with `bun publish --access public`.

To test the unpublished package in an empty directory, use the absolute path to the tarball from `bun pm pack`:

```sh
bun add --dev --trust /absolute/path/to/revyo-stack-0.1.0.tgz
```

Requires Bun 1.3.12+ and Node 20+ for the installer. The installer uses Node's standard library; the CRAP CLI runs with Bun and uses the package's TypeScript parser dependency.

## License

[MIT](LICENSE), copyright 2026 Revyo Software.
