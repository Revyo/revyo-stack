---
name: revyo-web
description: Build Revyo web applications and HTTP boundaries with the latest stable Next.js App Router, compatible React, explicit server/client exports, and Vercel-ready behavior.
---

# Next.js web apps

Resolve the latest stable Next.js release and its React/runtime requirements when scaffolding. Use App Router, TypeScript, and the supported current generator options. Generate in a temporary directory or merge `apps/web` deliberately; the repository already contains the installed skills and package manifest. Keep one root lockfile and remove any generator-created nested install/lockfile.

## Boundaries

- Prefer Server Components for data reads and static composition. Add `"use client"` only to interactive component boundaries. Never transitively import database, auth-server, or Effect live-layer modules into the browser.
- Keep backend use cases in domain packages using [revyo-effect](../revyo-effect/SKILL.md). Route handlers and server actions validate input, resolve the caller, invoke a use case, and map typed outcomes to transport results.
- Use route handlers for APIs consumed by native clients and external systems. Server actions are web transport, not the shared native API. Share schemas/contract artifacts, not Next.js internals.
- Mark server-only app/package entry points with `server-only` where the bundler supports it. Keep browser-safe contract exports in separate files. Use `transpilePackages` when consuming source-exported internal packages and verify a production build.
- Treat URL params, request headers/cookies, form input, and webhook bodies as untrusted. Follow the installed Next.js version's async request APIs, type generation, and route/proxy conventions.

Default to the Next.js deployment's supported Node.js runtime for backend routes using database/auth dependencies. Use a Bun runtime only after verifying the current Vercel integration and matching local commands; Bun as a package manager does not choose the hosted runtime. Edge execution requires every dependency and connection strategy to support it.

## Sessions and data

Read [revyo-auth](../revyo-auth/SKILL.md) for Better Auth integration and [revyo-database](../revyo-database/SKILL.md) for persistence. Validate session and resource authorization at every protected read/write boundary. Redirects or hidden UI are not authorization.

Make cache policy deliberate. Do not share personalized/tenant data through static generation, public caches, or cross-user cache keys. Apply the current Next.js cache APIs to public data with explicit invalidation after writes. Keep secrets out of `NEXT_PUBLIC_*`, browser bundles, and render payloads.

Keep layout, loading, error, empty, and form validation states usable for the actual product. Use semantic HTML, accessible control names, keyboard behavior, and responsive layouts. Do not add dashboards, marketing pages, or placeholder features beyond the requested workflow.

## Project commands and verification

Provide `dev`, `build`, `start`, `lint`, `check-types`, `test`, and `test:coverage` as appropriate. Use the release's supported type-generation command before `tsc --noEmit` when route types are generated. Keep the Turbo output glob aligned with the build.

Verify a meaningful workflow in the browser, a denied protected request, and a production build. Cover browser interaction with Playwright when it is part of the deliverable; cover pure helpers and transport/use-case behavior with the [testing skill](../revyo-testing/SKILL.md). Test async Server Components through their data contracts or browser behavior rather than assuming a client DOM unit runner can render them.

Prepare the deployment with [revyo-vercel](../revyo-vercel/SKILL.md). Builds should not apply migrations or require production data. If build-time env is necessary, document safe fixture values and exactly why it is needed.

Official references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [server/client components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [authentication guide](https://nextjs.org/docs/app/guides/authentication), [testing](https://nextjs.org/docs/app/guides/testing).
