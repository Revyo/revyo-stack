# Vercel runtime and environments

For runtime changes, confirm supported selectors/framework commands and align
local builds/tests with production. Lazy Effect initialization and pool/client
cleanup must fit function execution. No correctness-critical state may depend on
memory surviving invocations.

Jobs either fit the function’s supported duration or use supported durable
workflow/queue/cron facilities. Persist progress and idempotency; authorize scheduled
or webhook endpoints and validate signatures/secrets. A local infinite loop is not
a deployed Vercel worker.

Declare required configuration in `.env.example` and the README. Configure development,
preview, and production independently, with explicit public URLs and intended
Better Auth trusted origins. Preview/integration mutations use isolated databases
or provider branches, not production fallbacks.

Keep migrations out of builds/install scripts. For incompatible schema changes,
coordinate expansion, app rollout, and later cleanup. Hash output-changing
variables in Turbo, keep live/secret-dependent tasks uncached, and avoid sharing
sensitive logs/artifacts through remote caching. Remote cache credentials belong
in CI/account settings.

References: [environment variables](https://vercel.com/docs/environment-variables),
[function limits](https://vercel.com/docs/functions/limitations).
