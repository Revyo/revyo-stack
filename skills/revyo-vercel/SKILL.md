---
name: revyo-vercel
description: Prepare and deploy Revyo web apps and TypeScript APIs on Vercel with monorepo-aware roots, correct runtime/env settings, isolated previews, and serverless-compatible jobs.
---

# Vercel

All hosted Revyo web apps and backends use Vercel. Native binaries use their platform distribution; Vercel serves their APIs and optional release metadata.

## Monorepo deployment

Configure one Vercel project per deployable web/API app, using its actual Root Directory (`apps/web`, or a separate API app only when required). Enable access to workspace source outside the app directory when needed. Use the framework preset for the selected Next.js release, the root Bun lockfile, and current supported Bun installation behavior.

Verify the deployment's build command, install command, output handling, selected runtime, and package graph. Do not blindly put `bun run build` into a project whose cwd makes that command recurse into the wrong workspace. If overriding the build, use an app-specific command or a verified Turbo filter with the correct cwd. The Next.js preset owns its output; do not set a generic `dist` output directory for it.

Prefer Next.js route handlers for the default web/backend boundary. A separate API app must have a supported Vercel entry point/framework adapter; a local listening server alone does not establish deployability. Inspect current Vercel runtime docs before writing its deployment configuration.

## Runtime

Bun dependency installation does not imply Bun function execution. Default to the supported Node.js runtime for compatible Next.js/database/auth code. If the project selects Vercel's Bun runtime, confirm supported runtime selectors and framework commands from current docs, then align local builds, tests, and production. Do not ship `Bun.*` APIs into an unconfigured Node runtime.

Keep Effect runtime initialization lazy and align pool/client cleanup with function execution. No correctness-critical state may live only in memory between invocations. Jobs must fit the supported duration or use current Vercel workflow/queue/cron facilities. Persist progress and idempotency; authorize scheduled/webhook endpoints and validate their signatures/secrets. Do not treat a local infinite worker loop as a deployed Vercel worker.

## Environments and data

Declare the exact environment variables in `.env.example` and the README. Configure development, preview, and production values independently. Keep database/auth secrets server-side, public URLs explicit, and Better Auth trusted origins limited to intended domains.

Use isolated preview/test databases or branches with the selected provider's actual support. Do not route preview mutations or integration tests into production by default. Migrations run through an explicit reviewed release step, never through builds/install scripts. Coordinate schema expansion, app deployment, and later cleanup for incompatible changes.

Use Turbo `env` for output-changing variables and keep secret-dependent/live tasks uncached. Enable Vercel remote caching when useful, with credentials in CI/account configuration rather than committed files. Review cached outputs/logs before treating them as safe to share.

## Verification and release scope

Prepare configuration and local checks during project setup. Link/provision/deploy when authorized by the user's requested scope. If account access is missing, finish the source/configuration work and report the remaining linking/env steps.

For an authorized deployment, run the local quality gates, build for the deployment target, deploy a preview, and verify the first workflow, auth callback/origin handling, protected API denial, database connectivity, and job endpoints if present. Confirm environment isolation and report the resulting URL. Promote to production only within the requested release scope.

Official references: [Vercel monorepos](https://vercel.com/docs/monorepos), [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Bun runtime](https://vercel.com/docs/functions/runtimes/bun), [environment variables](https://vercel.com/docs/environment-variables), [function limits](https://vercel.com/docs/functions/limitations).
