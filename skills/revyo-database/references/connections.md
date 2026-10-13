# PostgreSQL connections

Choose a driver compatible with the deployed runtime. Neon supports its serverless
HTTP/WebSocket driver or supported pooled PostgreSQL connections; PlanetScale
Postgres uses a supported PostgreSQL driver and its documented pooled endpoint.

For driver or runtime changes, verify actual transaction, pooling, session, timeout,
and TLS support. HTTP query execution/batches do not imply interactive multi-statement
transactions. Do not depend on request-local database session state across
serverless requests.

Use runtime `DATABASE_URL` for application connections and document a separate
direct/migration URL when the provider/tool requires it. Keep credentials server-side.
Avoid unbounded per-request pools and coordinate resource lifetime with Effect and
[the hosting runtime](../../revyo-vercel/SKILL.md).

Effect SQL may suit domain queries, but retain one schema/migration authority and
compatible versions. Do not create separate ORM/driver pools for the same need.
Keep browser-safe contracts separate from executable database exports.

References: [Neon driver](https://neon.com/docs/serverless/serverless-driver),
[Neon pooling](https://neon.com/docs/connect/connection-pooling),
[PlanetScale Postgres](https://planetscale.com/docs/postgres/connecting).
