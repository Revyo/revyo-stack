---
name: revyo-project
description: Set up a new Revyo Software project using the installed stack skills, choosing the requested apps and wiring architecture, testing, and deployment together.
---

# Revyo project

Use this as the entry point for a new Revyo Software project. Deliver a runnable project in the current repository, with a working vertical slice and its checks. The skills are installed guidance, not a starter app to replace the repository with.

## Stack decisions

| Area                   | Revyo default                                                  |
| ---------------------- | -------------------------------------------------------------- |
| Workspace              | Bun and Turborepo; TypeScript for web and backend              |
| Web                    | Latest stable Next.js and compatible React; App Router         |
| Mobile and desktop     | Native language, UI, and platform toolchain                    |
| Authentication         | Better Auth unless the product explicitly needs another choice |
| Hosted web and backend | Vercel                                                         |
| Database               | PostgreSQL on Neon or PlanetScale Postgres                     |
| Backend TypeScript     | Effect v4                                                      |
| Quality                | Behavioral tests, reproducible coverage, per-function CRAP ≤ 8 |

Use these defaults for new work. Explicit user requirements and existing project instructions take precedence. Do not migrate an existing stack just because this skill is loaded. Do not create mobile, desktop, or a separate server app unless the product calls for it.

## Begin in the current repo

1. Read existing `AGENTS.md`, `CONTEXT.md`/`CONTEXT-MAP.md`, relevant ADRs, and package manifests if present. Preserve installed skills and their installation metadata, including `.agents/skills`, any `.agents/revyo-stack.json`, and any `.claude/skills` copy. Keep an existing `@revyo/stack` dependency and Bun trust setting if present; one-command skill installation does not require them. Merge root configuration rather than running a generator over nonempty files.
2. Resolve product name, first user workflow, app targets, database provider, and authentication needs from the request. Ask only for missing decisions that materially change the result. The database engine is always PostgreSQL. For an unspecified provider, use Neon Postgres as an explicit, reversible starting assumption; a PlanetScale request means PlanetScale Postgres. Native target operating systems need a concrete choice before platform scaffolding.
3. Resolve current compatible versions from the registry and official docs at execution time. Use latest stable Next.js, never an old version copied from a reference repo. Require Effect major 4; if only a prerelease is available, pin that v4 release and matching ecosystem versions rather than falling back to v3. Commit `bun.lock` and record toolchain/runtime versions.
4. State the chosen apps and provider assumptions, then continue with all independent setup. Credentials or unavailable platform SDKs should not prevent local source work and isolated tests.

## Read only the skills needed

| When                            | Read                                         |
| ------------------------------- | -------------------------------------------- |
| Every project                   | [revyo-monorepo](../revyo-monorepo/SKILL.md) |
| Web app or Next.js API host     | [revyo-web](../revyo-web/SKILL.md)           |
| Mobile or desktop client        | [revyo-native](../revyo-native/SKILL.md)     |
| Accounts or protected resources | [revyo-auth](../revyo-auth/SKILL.md)         |
| Persistent data                 | [revyo-database](../revyo-database/SKILL.md) |
| Backend TypeScript              | [revyo-effect](../revyo-effect/SKILL.md)     |
| Hosted web/backend              | [revyo-vercel](../revyo-vercel/SKILL.md)     |
| Every project                   | [revyo-testing](../revyo-testing/SKILL.md)   |

For the architectural rationale derived from ar-platform, read [references/ar-platform.md](references/ar-platform.md). It is a design reference, not a dependency or an instruction to clone that project.

## Build a vertical slice

Create only the workspace packages the first workflow needs. A typical authenticated web project has `apps/web`, `packages/auth`, `packages/data`, one or more domain packages, and shared configuration. HTTP routes and native clients consume domain contracts; they do not contain the domain's persistence rules.

Implement one meaningful workflow through validated input, verified session/authorization when needed, an Effect use case, a repository adapter, and a visible result. Supply an isolated test layer and tests for success and expected failure. Stub only external infrastructure that is unavailable; label it and retain a working live-adapter path. Do not claim a mocked database, login, or deployment is live.

Keep source setup separate from cloud provisioning: generate the Vercel-ready files, migrations, and environment contract during setup. Create provider resources or deploy when the user's instruction authorizes those actions; otherwise report the exact remaining command or account requirement. Do not make a production migration part of install or build.

## Completion

Leave a README with actual local commands, required environment variables, chosen platforms and PostgreSQL provider, migration steps, and deployment setup. Update project-specific agent instructions outside the installer's managed block. Record consequential deviations in an ADR when they need a durable explanation.

Run dependency installation, lint, type checks, meaningful tests, coverage plus CRAP, and the production build for the implemented targets. Confirm the root task graph includes the packages and native apps created. If a native toolchain or cloud credential is missing, report which check could not run and why; do not substitute a successful TS check for a native build.

Report the implemented workflow, commands that passed, selected versions/providers, and any concrete blockers. Setup is complete only when required local work and checks have been handled.
