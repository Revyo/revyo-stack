---
name: revyo-project
description: Set up a new Revyo project and coordinate its required apps, stack, and first working workflow.
---

# Revyo project setup

Deliver the requested runnable project in the current repository. A working
vertical slice establishes that the chosen boundaries integrate; it does not
limit a broader requested scope. Preserve existing files and installed skills.

Start a new product with [project planning](references/planning.md), even when the
user did not invoke `/plan`. Resolve consequential product choices before coding;
do not repeat settled questions or turn a clear implementation request into an
approval loop.

## New-project defaults

- Bun/Turborepo workspaces and TypeScript for web/backend.
- Latest stable Next.js App Router with compatible React.
- Native platform UI/toolchains for requested mobile/desktop targets.
- Better Auth when authentication is needed.
- PostgreSQL on Neon or PlanetScale Postgres; Drizzle schema/migration tooling.
- Effect v4 backend services and Vercel web/API hosting.
- Behavioral tests, reproducible coverage, and per-function CRAP ≤ 8.

Missing hosted credentials do not change these architecture defaults: durable
product data still needs the PostgreSQL live-adapter path. Isolated test services
establish local behavior, not a replacement production persistence architecture.

Existing project instructions and explicit user requirements take precedence.
Do not add apps, authentication, infrastructure, or migrations beyond the product’s
needs. For setup/version/provider decisions, use [setup details](references/setup.md).

## Load guidance as the work needs it

- Workspace/package/task setup: [revyo-monorepo](../revyo-monorepo/SKILL.md).
- Web/API implementation: [revyo-web](../revyo-web/SKILL.md).
- Native targets: [revyo-native](../revyo-native/SKILL.md).
- Authentication/authorization: [revyo-auth](../revyo-auth/SKILL.md).
- Persistence: [revyo-database](../revyo-database/SKILL.md).
- Backend services: [revyo-effect](../revyo-effect/SKILL.md).
- Deployment: [revyo-vercel](../revyo-vercel/SKILL.md).
- Test/coverage/gate configuration: [revyo-testing](../revyo-testing/SKILL.md).
- UI: [revyo-design](../revyo-design/SKILL.md).
- Public-site search, discovery, and share assets: [revyo-seo](../revyo-seo/SKILL.md).
- Debugging, architecture, or review: [revyo-engineering](../revyo-engineering/SKILL.md).

Use relevant repository instructions/manifests to understand the current setup;
consult context maps or ADRs when they bear on the changed domain or decision.
The [ar-platform provenance](references/ar-platform.md) is optional architectural
background, not a prerequisite or a project to clone.

## Completion

Continue through implementation, relevant checks, and change-related fixes until
the requested local result works. Keep commands, required environment, migration
steps, and deployment setup documented for the actual targets. Record consequential
architecture choices when they need a durable explanation.

Carry out external actions within the user’s authorized scope. Missing credentials
or SDKs do not prevent independent source work and isolated verification. Identify
any unverified live boundary precisely, and report the implemented workflow and
checks that establish it.
