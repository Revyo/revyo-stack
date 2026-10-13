---
name: revyo-database
description: Design or change PostgreSQL schemas, queries, connections, or migrations on Neon or PlanetScale Postgres.
---

# PostgreSQL persistence

Revyo uses PostgreSQL on Neon or PlanetScale Postgres. PlanetScale always means
its PostgreSQL offering. For a new project with no provider choice, state Neon as
a reversible starting assumption; the engine does not need clarification.

Drizzle is the default schema/migration authority unless the user chooses another
ORM. Use `drizzle-orm/pg-core`, Drizzle Kit’s `postgresql` dialect, and Better Auth’s
`pg` adapter. Keep auth tables and application migrations on the same path.

Domain repositories expose Effect contracts; live adapters own SQL, drivers, and
provider-specific behavior. Keep executable database exports server-only and
initialize connections at the runtime boundary. For a new workspace, `packages/data`
owns schema, migrations, configuration, and repository adapters.

- Choosing a driver or changing pooling/transactions: [connections](references/connections.md).
- Changing schema or migration/release commands: [migrations](references/migrations.md).

Use parameterized queries and database constraints for product invariants. Scope
multi-tenant reads/writes by verified ownership or membership.

Verify changed SQL/adapter behavior against an isolated compatible PostgreSQL
database; fake repositories establish domain behavior only. Include relevant
constraint, atomicity, and authorization cases. If test infrastructure is unavailable,
complete independent work and leave executable integration setup with an accurate
account of the remaining verification.
