---
name: revyo-web
description: Build or change Next.js App Router pages, route handlers, server actions, or server/client boundaries.
---

# Next.js web apps

Use the App Router for new Revyo web work. Respect an existing app’s versions and
structure unless the task requires an upgrade or migration.

Keep data reads/static composition server-side and place `"use client"` at
interactive boundaries. Separate browser-safe contracts from database, auth-server,
and Effect live-layer exports. Routes/actions validate input, resolve the caller,
invoke domain use cases, and map typed outcomes to transport results.

Use route handlers for native/external APIs; server actions are web transport.
Default backend routes to a supported Node.js runtime. Bun dependency management
does not select function execution, and Edge requires compatible dependencies.

- Scaffolding, changing package exports, or updating build/type commands:
  [setup](references/setup.md).
- Protected reads/writes, caching, or session integration:
  [data boundaries](references/data-boundaries.md).
- Building or refining UI: [revyo-design](../revyo-design/SKILL.md).
- Public-page search metadata, indexing, or share previews: [revyo-seo](../revyo-seo/SKILL.md).
- Deployment configuration: [revyo-vercel](../revyo-vercel/SKILL.md).

Keep loading/error/empty states, form feedback, and accessibility appropriate to
the requested workflow. Verify affected behavior in the browser when it depends on
rendering or interaction; use relevant contract/unit checks for pure logic. Changes
to packaging/runtime boundaries need a production build. Add durable browser tests
when their coverage justifies them; avoid a full application test sweep for an unrelated edit.
