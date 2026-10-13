---
name: revyo-vercel
description: Configure, deploy, or troubleshoot Revyo web and API deployments on Vercel.
---

# Vercel deployment

Vercel hosts Revyo web apps and APIs. Native binaries use platform distribution;
Vercel can serve their backend and release metadata.

Configure the actual app boundary and supported runtime. Bun installation does not
imply Bun function execution. Next.js/database/auth code defaults to supported
Node.js execution; use Bun APIs only in a deliberately configured compatible runtime.

- Project roots, framework adapters, build commands, or deployment setup:
  [deployment configuration](references/deployment.md).
- Function lifecycle, durable work, or environment/data isolation:
  [runtime and environments](references/runtime.md).

Keep credentials server-side and preview/test mutations isolated from production.
Migrations belong to an explicit release step, not installation or builds.

Carry authorized linking, provisioning, and deployment through the checks that
establish the requested result. A deployment change needs a target build and a
preview check of the affected workflow/boundary; an unrelated edit does not need
a fresh deployment. Production promotion follows the requested release scope.
If account access is unavailable, finish local configuration and verification,
and report the specific external step that remains.
