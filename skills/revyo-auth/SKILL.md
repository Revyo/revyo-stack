---
name: revyo-auth
description: Implement Revyo authentication with Better Auth, provider-compatible persistence, verified sessions, resource authorization, and supported native-client login flows.
---

# Better Auth

Use Better Auth for projects that need authentication unless the user selects another provider or a specific product requirement demands one. Do not add authentication to public-only software without a reason. Keep the library's session and credential handling; do not build a parallel password/session system.

## Integration

1. Read the current installation, framework integration, adapter, and selected plugin docs. Resolve compatible Better Auth/adapter versions. Import paths can change: the current Drizzle docs use `@better-auth/drizzle-adapter`; use the installed version's documented path rather than copying an older snippet.
2. Put server configuration under `packages/auth`, with an explicit server export and a separate browser client export. Validate `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and trusted origins at runtime. Keep production configuration fail-closed; an absent secret must not enable a development login path.
3. Coordinate the adapter with [revyo-database](../revyo-database/SKILL.md): both Neon and PlanetScale use PostgreSQL, so configure the Drizzle adapter with `provider: "pg"` and generate PostgreSQL auth tables. Generate the actual auth/plugin schema for this configuration, review it, and integrate it into checked-in migrations. The Better Auth schema-generation command and ORM migration command have different jobs.
4. Mount the current Next.js handler at `app/api/auth/[...all]/route.ts`. Use the documented GET/POST exports and client APIs. If server actions need auth cookie updates, configure the documented Next.js cookie integration in the required plugin order.
5. Create the requested sign-in/sign-up/account flow. Enable only required providers and plugins. Configure real email delivery for verification/password recovery when those features are enabled; do not call a console-only email adapter production-ready.

Avoid import-time database connections or environment reads that break a credential-free build. A lazy factory/server boundary should load validated runtime configuration before handling a real request. Make auth schema generation possible with documented local configuration without exposing production credentials.

## Authorization

Validate sessions on the server through Better Auth. A proxy/middleware cookie-presence check can improve navigation but cannot authorize a protected resource. Apply authorization to route handlers, server actions, server-side data reads, and domain use cases. Derive the acting user from verified credentials, not a request-supplied user ID.

Model the product's actual ownership/roles. Add organization/team plugins only when required. If multi-tenant, constrain queries and mutations by the verified tenant membership and resource relationship; passing an arbitrary tenant ID is insufficient. Test cross-user/cross-tenant denial and role escalation.

Use explicit trusted origins, secure cookies in production, documented CSRF protections, and compatible session expiration/revocation. Keep preview/development origins deliberate. Never broaden trust to arbitrary origins to make previews work. Redact cookies, tokens, passwords, and auth headers from logs.

Expose authentication to domain code through an Effect service for the verified principal/session context. Adapt Better Auth's promise APIs once at the boundary into typed failures. The library's protocol handler can remain its native handler; do not rewrite its internals as Effect.

## Native clients

For [native apps](../revyo-native/SKILL.md), select a supported Better Auth integration and verify its protocol before implementing it. A native app is a public client; it cannot protect an embedded secret. OAuth flows use authorization code/PKCE when supported, with state and callback checks. Store client credentials/tokens with platform secure storage, and implement expiry, refresh where supported, revocation, and logout. A browser cookie flow needs an explicitly supported handoff, not custom token minting.

## Tests

Cover sign-in success/failure, missing/expired/revoked session, authorization denial, origin rejection, and logout through the relevant boundaries. Fake the principal service for isolated domain tests; test the actual Better Auth handler and chosen database adapter separately. Generated schema alone is not evidence that login works.

Official references: [installation](https://better-auth.com/docs/installation), [Next.js integration](https://better-auth.com/docs/integrations/next), [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle), [OAuth provider](https://better-auth.com/docs/plugins/oauth-provider).
