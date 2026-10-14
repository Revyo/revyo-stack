# Revyo Stack

Agent skills for creating Revyo Software projects. The entry point coordinates focused skills for Bun and Turborepo, Next.js, native apps, Better Auth, PostgreSQL on Neon or PlanetScale Postgres, Effect v4, Vercel, and testing with a per-function CRAP gate.

## Install the skills

Revyo Software maintains these skills and the `@revyo/stack` npm package. The repository and package are MIT licensed and available for anyone to use. From inside your repository, install the skills with the [open agent skills CLI](https://github.com/vercel-labs/skills):

```sh
bunx skills@latest add Revyo/revyo-stack --full-depth
```

The `--full-depth` flag includes the curated design, engineering, and SEO folders alongside the core skills. Without it, the CLI finds only the core folder. Select all skills needed by a router so its sibling references resolve. The npm installer below includes the full catalog automatically. Commit the installed skills and installation metadata with your project, then tell the agent what to build. The CRAP tester runs directly from our npm package as shown below.

### Install from npm

You can also use Revyo Software's npm installer directly:

```sh
bunx @revyo/stack@latest install
```

The installer copies the core, design, engineering, and SEO skills into a flat `.agents/skills/` directory, adds a small routing block to `AGENTS.md`, and records file hashes in `.agents/revyo-stack.json`. Commit all three with your project. The agent then builds the app in the same repository. The CRAP tester also runs directly from npm, without a separate dependency installation.

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

## Curated design, engineering, and SEO skills

[Revyo Design](revyo-design/README.md) includes all skills from Jakub Krehel,
Taste, Emil Kowalski, Fluid Functionalism, and the selected frontend/mobile
sources. [Revyo Engineering](revyo-engineering/README.md) includes all Matt Pocock
and Poteto pstack skills, including their supporting resources.
[Revyo SEO](revyo-seo/README.md) adds technical SEO audit, programmatic SEO, AI
search visibility, and Is Agentic. Audit and page generation remain separate
workflows behind a shared router. [Brand/social previews](skills/revyo-brand-social/SKILL.md)
reuse an existing identity or establish missing foundations, then create and verify
OG images, favicons, and metadata. This workflow generalizes lessons from local
VIAVIA, Forma, Sfina, and multi-project share-preview chats without copying their
assets or publishing permissions.

The installer enables automatic invocation for every skill. Descriptions stay
short and specific; only task-relevant guidance is loaded. Taste is the default
art-direction skill for public-facing pages. Existing brands and explicit user
references take precedence; dashboards use the product-interface guidance.

The catalog follows the [OpenAI prompting guidance](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra):
precise discovery, progressive disclosure, proportionate process, and completion
of authorized work. The nine original Revyo skill bodies follow the same guidance:
focused entry points, conditional setup/runtime references, and verification scoped
to the change. Their stack and measurement requirements are retained.
Upstream explicit-only flags are overridden by the generated entry points. Matt's `prototype`, `tdd`, and `teach` are installed as
`matt-prototype`, `matt-tdd`, and `matt-teach` to avoid collisions.

This branch has not been published to npm. To try its complete catalog from a
local clone:

```sh
bun install --frozen-lockfile
bun bin/revyo-stack.mjs install --cwd /absolute/path/to/your/project --claude
```

The weekly GitHub workflow checks upstream each Monday at 08:23 UTC. It opens a
draft PR only when selected content changes. An identical open update is kept;
otherwise a new draft is created successfully before older automated updates are
closed. Source additions on `main` also trigger a check. The schedule starts after
this workflow is merged into the default branch. Manual runs are available in
GitHub Actions. The repository already permits Actions to create pull requests;
no additional token is required. Validation runs before opening the draft because
PR checks created with `GITHUB_TOKEN` may wait for a maintainer to approve the workflow run ([GitHub documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)).

Maintain source selection in [upstream-sources.json](upstream-sources.json), local
discovery descriptions in [upstream-overrides.json](upstream-overrides.json), and
review pinned revisions and content hashes in [upstream-lock.json](upstream-lock.json).
A repository-wide commit that leaves the selected material unchanged causes no
update. The exact official Is Agentic HTTP skill is checked by content digest,
with a remote adapter instead of a redistributed snapshot. Its advertised GitHub
repository was unavailable when added. HTTP fetch/metadata failures preserve the
existing catalog and fail the update before publishing a replacement PR. Refresh locally with `bun run upstream:sync`, then `bun run check`.

## Tell the agent what to build

New products start with discovery and a plan, including questions about consequential
choices the brief leaves open. The entry point uses host Plan mode when a control is
available; otherwise it plans in the current mode without claiming to switch modes.
Once the needed choices are resolved, an implementation request continues through
the requested scope. Explicitly deferring the actual app still delivers the runnable
brand/marketing phase; it does not make marketing-only the default for other requests.
The [PageSpeedPlus trial protocol](benchmarks/pagespeedplus/protocol.md) checks both
scopes with ordinary prompts that do not name skills or request planning. Its
[observed results](benchmarks/pagespeedplus/results.md) retain first-pass failures,
assisted corrections, and the limits of the clean kickoff retest.
The [assistant-showcase protocol](benchmarks/assistant-showcase/protocol.md) and
[observed results](benchmarks/assistant-showcase/results.md) exercise the corrected
catalog on a different product category. Product showcases combine Taste's site
direction with product-interface craft and coherent local demonstrations.

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

| Skill                                                    | Responsibility                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| [revyo-project](skills/revyo-project/SKILL.md)           | Entry point, decisions, project setup, completion checks       |
| [revyo-monorepo](skills/revyo-monorepo/SKILL.md)         | Bun workspaces, Turborepo, package boundaries, shared tooling  |
| [revyo-web](skills/revyo-web/SKILL.md)                   | Latest stable Next.js, App Router, server/client boundaries    |
| [revyo-native](skills/revyo-native/SKILL.md)             | Native mobile and desktop apps, contracts, platform checks     |
| [revyo-auth](skills/revyo-auth/SKILL.md)                 | Better Auth, sessions, authorization, native login             |
| [revyo-database](skills/revyo-database/SKILL.md)         | PostgreSQL on Neon/PlanetScale, Drizzle, drivers, migrations   |
| [revyo-effect](skills/revyo-effect/SKILL.md)             | Effect v4 services, typed failures, layers, runtime boundaries |
| [revyo-vercel](skills/revyo-vercel/SKILL.md)             | Vercel projects, environments, serverless execution            |
| [revyo-testing](skills/revyo-testing/SKILL.md)           | Behavioral tests, coverage, CRAP reporting, CI gates           |
| [revyo-design](skills/revyo-design/SKILL.md)             | Route UI work to the handpicked design skills                  |
| [revyo-engineering](skills/revyo-engineering/SKILL.md)   | Route engineering work to Matt Pocock and Poteto guidance      |
| [revyo-seo](skills/revyo-seo/SKILL.md)                   | Public-page SEO, AI discovery, and agent readiness             |
| [revyo-brand-social](skills/revyo-brand-social/SKILL.md) | Brand-aware social images, favicons, and share metadata        |

The skills take architectural cues from `ar-platform` (domain packages, Effect services, composed live/test layers, shared tooling). They use the requested new-project defaults instead of carrying forward that project's WorkOS, Nile, pinned framework versions, or desktop implementation. Reference provenance is documented in [the entry point's reference](skills/revyo-project/references/ar-platform.md).

All Revyo databases use PostgreSQL. Choosing PlanetScale means PlanetScale Postgres. Both providers use PostgreSQL schemas and migrations, Drizzle Kit's `postgresql` dialect, and Better Auth's `pg` adapter provider. MySQL and Vitess are never used.

## Testing and CRAP

`@revyo/stack` ships the reusable `revyo-crap` CLI and its parser dependency. It combines TypeScript AST complexity with Istanbul JSON coverage. Configure your test runner to write `coverage-final.json`, adapt the [CRAP configuration template](skills/revyo-testing/assets/crap.config.json) to your source and coverage paths, and run:

```sh
bun run test:coverage
bunx --package @revyo/stack@latest revyo-crap --config crap.config.json
```

No prior `bun add`, `--trust`, or `--no-install` is needed. `--package` selects our npm package, and `revyo-crap` selects its testing executable.

For the root quality script and CI, pin the selected npm release instead of using `latest`. This example uses `0.1.1`:

```json
{
  "scripts": {
    "quality:crap": "bun run test:coverage && bunx --package @revyo/stack@0.1.1 revyo-crap --config crap.config.json"
  }
}
```

Run `bun run quality:crap` to generate fresh coverage and check it. Projects reuse the package's implementation rather than copying or rewriting CRAP logic. If you prefer a local dependency, add `@revyo/stack` to root dev dependencies and invoke `revyo-crap` directly in your quality script.

Bun-based native measurement adapters can import the shared `crapScore` function from `@revyo/stack/crap`. Add `@revyo/stack` as a root development dependency when importing that API; native complexity/coverage extraction still needs platform-specific tooling.

The Revyo maximum is **CRAP ≤ 8 for every function**. The skill supplies the configuration and Vitest wiring. The gate fails for missing source coverage, unmatched functions, malformed reports, or any function above the configured score (default 8; stricter values are allowed). Scores use per-function executable line coverage, not file averages or function call counts. Native projects use platform test tools and need a language-specific complexity/coverage adapter; this CLI analyzes JavaScript and TypeScript only.

This repository follows the same rule. `bun run quality:crap` runs its Bun tests and CLI smoke checks against an isolated Istanbul-instrumented copy, enforces 90% lines/statements/functions and 80% branches, then scores every function in the installer, analyzer, and repository scripts with a maximum of 8. Revyo-maintained source and published files stay untouched. Third-party snapshots retain their upstream implementations and are outside the maintained-code CRAP gate. `bun run check` includes this gate, so it also runs in CI and before publication. Reports are written to `coverage/` and `reports/crap.json`.

## Updates

For skills installed with the `skills` CLI:

```sh
bunx skills@latest update
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
bun add --dev --trust /absolute/path/to/revyo-stack-0.1.1.tgz
```

Requires Bun 1.3.12+. The skills CLI requires Node 22.20+; Revyo's npm installer supports Node 20+. The npm installer uses Node's standard library; the CRAP CLI runs with Bun and uses the package's TypeScript parser dependency.

## License

[MIT](LICENSE), copyright 2026 Revyo Software, for Revyo-maintained code and guidance. Third-party skills retain their upstream licenses and attribution in each skill’s `SOURCE.md` and `LICENSE.upstream` (or original license file). Transitions.dev is provided through source-loading adapters rather than redistributed recipes.
