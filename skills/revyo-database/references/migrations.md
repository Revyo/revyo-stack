# PostgreSQL migrations

For schema changes, generate and review PostgreSQL SQL, then commit migration
history. Provide explicit `db:generate`, `db:migrate`, and seed commands when
setting up this tooling. Mutation tasks are uncached in Turbo; builds, postinstall,
and request handlers do not run migrations or seeds.

Follow the selected provider’s current PostgreSQL connection/branching workflow.
Validate migrations on an isolated non-production PostgreSQL database. For rolling
deployments, use compatible schema expansion, deploy updated callers, then remove
obsolete schema when safe. Record data backfills separately.

Configure tests to use an explicitly isolated database/branch and prevent production
credentials from being used. Real adapter checks cover the constraints, rollback
or atomicity, and auth tables affected by the change. If credentials are unavailable,
report the unverified migration/adapter boundary without substituting a mock result.

References: [Drizzle Kit configuration](https://orm.drizzle.team/docs/drizzle-config-file),
[Better Auth adapter](https://better-auth.com/docs/adapters/drizzle).
