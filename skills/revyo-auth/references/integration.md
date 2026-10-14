# Better Auth integration

## Installation and server/client exports

For installation or API changes, check the installed release’s [installation](https://better-auth.com/docs/installation)
and [framework integration](https://better-auth.com/docs/integrations/next) docs.
Resolve compatible versions when adding/upgrading dependencies. The current
Drizzle documentation uses `@better-auth/drizzle-adapter`; follow the selected
version’s documented import path.

For a new workspace, keep server configuration in `packages/auth` with an explicit
server export and separate browser client export. Validate `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, and trusted origins before handling real requests. Use a lazy
factory/server boundary so importing the module does not require a live database
or production credentials. Missing secrets must not enable a development login path.

## Adapter and schema

Both Neon and PlanetScale use PostgreSQL: configure the Drizzle adapter with
`provider: "pg"`. Generate the schema for the chosen auth/plugins, review it, and
integrate it into checked-in PostgreSQL migrations. Auth schema generation and ORM
migration execution are separate operations. Keep generation usable with documented
local configuration. See the [adapter docs](https://better-auth.com/docs/adapters/drizzle).

## Next.js handlers and product flows

For a new App Router integration, mount the supported GET/POST handler exports at
`app/api/auth/[...all]/route.ts`. When server actions update auth cookies, use the
documented Next.js cookie integration and plugin order for that release.

Enable the providers/plugins the product needs. Verification and password recovery
need real email delivery before those flows can be called production-ready. Use
explicit development/preview origins, secure production cookies, documented CSRF
protections, and the intended session expiry/revocation policy. Do not broaden
trusted origins to arbitrary sites to make previews work.

## Authorization and verification

Constrain multi-tenant queries/mutations by verified membership and resource
ownership. An arbitrary tenant ID is insufficient. Add organization/team plugins
only when the product needs them.

Use fake principal services for isolated domain tests. Verify the real handler
and database adapter for changes to sign-in, missing/expired/revoked sessions,
logout, origin rejection, or cross-user/tenant access. Generated schema alone does
not establish that login works.
