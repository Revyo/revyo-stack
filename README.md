# Revyo Stack

Agent skills for creating Revyo Software projects. The entry point coordinates focused skills for Bun and Turborepo, Next.js, native apps, Better Auth, PostgreSQL on Neon or PlanetScale Postgres, Effect v4, Vercel, and testing with a per-function CRAP gate.

## Install the skills

Revyo Software maintains these skills and the `@revyo/stack` npm package. The repository and package are MIT licensed and available for anyone to use. Install the skills from the public repository with the [open agent skills CLI](https://github.com/vercel-labs/skills):

```sh
mkdir my-project
cd my-project
bunx --bun skills@latest add Revyo/revyo-stack --skill '*'
```

Install all nine skills so the entry point's sibling references work. Choose the agents you use when prompted. `--bun` runs the CLI with Bun. Commit the installed skills and installation metadata with your project, then tell the agent what to build. The CRAP tester runs directly from our npm package as shown below.

### Install from npm

You can also use Revyo Software's npm installer directly:

```sh
bunx @revyo/stack@latest install
```

The installer copies the skills into `.agents/skills/`, adds a small routing block to `AGENTS.md`, and records file hashes in `.agents/revyo-stack.json`. Commit all three with your project. The agent then builds the app in the same repository. The CRAP tester also runs directly from npm, without a separate dependency installation.

This runs the installer explicitly, so no `--dev`, `--trust`, or `--no-install` flags are needed for the one-command setup. `bunx` downloads the npm package as needed; it does not add a dependency to your project's manifest.

For Claude Code, also copy the skills into its discovery directory:

```sh
bunx @revyo/stack@latest install --claude
```

Both copies use the same sibling links. Subsequent installs update both if the Claude copy was previously installed. Restart the agent session if newly installed skills do not appear in its catalog. Any agent can read the entry point directly.

### Install as a project dependency

To install the npm dependency first and run its local installer:

```sh
bun add --dev @revyo/stack
bunx --no-install revyo-stack install
```

`--no-install` prevents `bunx` from downloading a missing executable's package; this command uses the project's installed bin. You can also use `bun add --dev --trust @revyo/stack` to let Bun run the installer's postinstall script automatically. See [Bun's trusted dependency documentation](https://bun.sh/docs/pm/cli/add).

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

`@revyo/stack` ships the reusable `revyo-crap` CLI and its parser dependency. It combines TypeScript AST complexity with Istanbul JSON coverage. Configure your test runner to write `coverage-final.json`, adapt the [CRAP configuration template](skills/revyo-testing/assets/crap.config.json) to your source and coverage paths, and run:

```sh
bun run test:coverage
bunx --package @revyo/stack@latest revyo-crap --config crap.config.json
```

No prior `bun add`, `--trust`, or `--no-install` is needed. `--package` selects our npm package, and `revyo-crap` selects its testing executable.

For the root quality script and CI, pin the selected npm release instead of using `latest`. This example uses `0.1.0`:

```json
{
  "scripts": {
    "quality:crap": "bun run test:coverage && bunx --package @revyo/stack@0.1.0 revyo-crap --config crap.config.json"
  }
}
```

Run `bun run quality:crap` to generate fresh coverage and check it. Projects reuse the package's implementation rather than copying or rewriting CRAP logic. If you prefer a local dependency, add `@revyo/stack` to root dev dependencies and invoke `revyo-crap` directly in your quality script.

Bun-based native measurement adapters can import the shared `crapScore` function from `@revyo/stack/crap`. Add `@revyo/stack` as a root development dependency when importing that API; native complexity/coverage extraction still needs platform-specific tooling.

The Revyo maximum is **CRAP ≤ 8 for every function**. The skill supplies the configuration and Vitest wiring. The gate fails for missing source coverage, unmatched functions, malformed reports, or any function above the configured score (default 8; stricter values are allowed). Scores use per-function executable line coverage, not file averages or function call counts. Native projects use platform test tools and need a language-specific complexity/coverage adapter; this CLI analyzes JavaScript and TypeScript only.

This repository follows the same rule. `bun run quality:crap` runs its Bun tests and CLI smoke checks against an isolated Istanbul-instrumented copy, enforces 90% lines/statements/functions and 80% branches, then scores every function in the installer, analyzer, and repository scripts with a maximum of 8. Source and published files stay untouched. `bun run check` includes this gate, so it also runs in CI and before publication. Reports are written to `coverage/` and `reports/crap.json`.

## Updates

For skills installed with the `skills` CLI:

```sh
bunx --bun skills@latest update
```

To refresh skills installed with the one-command npm installer, rerun `bunx @revyo/stack@latest install`. Once the project has a root `@revyo/stack` dependency, update the dependency and use its matching installer:

```sh
bun update @revyo/stack
bunx --no-install revyo-stack install
```

Reinstallation with the npm installer is idempotent. Unedited package-owned files update; locally edited skills are preserved and cause installation to stop before any writes. Existing `AGENTS.md` text outside the marked Revyo block and unrelated skills are preserved. Put project-specific guidance outside the managed block, then use `--force` only when you intend to replace edited Revyo files. Files removed from a later package release are retained for manual review.

## Develop and publish this repository

```sh
bun install
bun run check
bun pm pack
```

Source is maintained at [Revyo/revyo-stack](https://github.com/Revyo/revyo-stack). Before publishing the npm package, set the desired version and registry. Publish from an authorized session with `bun publish --access public`.

To test a packed build in an empty directory, use the absolute path to the tarball from `bun pm pack`:

```sh
bun add --dev --trust /absolute/path/to/revyo-stack-0.1.0.tgz
```

Requires Bun 1.3.12+ and Node 20+ for the installer. The installer uses Node's standard library; the CRAP CLI runs with Bun and uses the package's TypeScript parser dependency.

## License

[MIT](LICENSE), copyright 2026 Revyo Software.
