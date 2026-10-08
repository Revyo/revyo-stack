---
name: revyo-database
description: Implement Revyo PostgreSQL persistence on Neon or PlanetScale Postgres with compatible Drizzle/auth adapters, serverless connection handling, and reviewed migrations.
---

# Database

Revyo uses PostgreSQL exclusively, hosted on Neon or PlanetScale Postgres. A PlanetScale choice always means its Postgres offering; the engine is fixed and requires no clarification. Use Neon Postgres as the stated starting assumption when neither provider is specified. Never scaffold MySQL or Vitess schemas, drivers, adapters, or migrations.

## Choose one coherent path

| Provider             | Driver direction                                                         |
| -------------------- | ------------------------------------------------------------------------ |
| Neon Postgres        | Neon serverless HTTP/WebSocket or a supported pooled Postgres connection |
| PlanetScale Postgres | Supported Postgres driver using PlanetScale's documented pooled endpoint |

For both providers, define Drizzle schemas with `drizzle-orm/pg-core`, configure Drizzle Kit with `dialect: "postgresql"`, and configure the Better Auth Drizzle adapter with `provider: "pg"`. Keep generated auth tables and application migrations on this same PostgreSQL path.

Drizzle is the default schema/migration tooling, informed by ar-platform. Use a different ORM if the user chooses one. Domain repository contracts return Effect values; hide Drizzle, SQL, and provider-specific behavior inside live adapters. Effect SQL drivers may be appropriate for domain queries, but keep one schema/migration authority and compatible versions. Do not make each ORM/driver own a separate pool for the same need.

## Connection and query design

Pick the deployed runtime first, using [revyo-vercel](../revyo-vercel/SKILL.md). Verify actual transaction, pooling, session, timeout, and TLS behavior for the selected driver. HTTP query execution and interactive multi-statement transactions are different capabilities. Do not require interactive transactions from a driver that supports only request/batch execution.

Use runtime `DATABASE_URL` for application connections and a separately documented direct/migration URL when the provider/tool needs it. Credentials remain server-side. Avoid unbounded per-request pools; scope resources with Effect and the hosting lifecycle. Never depend on request-local database session state across serverless requests.

Keep `packages/data` responsible for schema, generated SQL migrations, provider config, repository adapters, and migration commands. Separate browser-safe schemas/types from executable database exports. Initialize connections lazily at the runtime boundary.

Use parameterized queries, explicit uniqueness/check constraints, product-appropriate indexes, and transactional invariants. For multi-tenant products, enforce ownership/membership in queries and verify denial paths. Validate pagination and ordering; avoid copying reference-project table names or tenancy hierarchy without product need.

## Migrations

Generate and review SQL, commit the migration history, and provide explicit `db:generate`, `db:migrate`, and seed commands. Mark mutations as uncached Turbo tasks. Do not run migrations or seeds in `postinstall`, a Next.js build, or each serverless invocation.

Use PostgreSQL SQL migrations for both providers, following their current Postgres connection and branching workflows. Use backward-compatible changes for rolling deployments and record data backfills separately. Validate a migration on an isolated non-production Postgres database before production use.

## Testing

Give domain tests isolated in-memory/test repository layers. Add real adapter integration tests using the selected provider or a representative compatible PostgreSQL database, including constraints, rollback/atomicity, and auth tables. A generic mock does not verify SQL or adapter support. Use an isolated test database/branch and prevent production credentials from being used in the test suite. If credentials are unavailable, keep integration setup executable and report the skipped verification accurately.

Official references: [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver), [Neon pooling](https://neon.com/docs/connect/connection-pooling), [PlanetScale Postgres connections](https://planetscale.com/docs/postgres/connecting), [Drizzle Kit configuration](https://orm.drizzle.team/docs/drizzle-config-file), [Better Auth adapters](https://better-auth.com/docs/adapters/drizzle).
