# Effect runtime boundaries

Wrap promise-based vendor APIs with a supported v4 constructor, mapping rejections
to typed infrastructure failures. Pass `AbortSignal` where supported. Orchestrate
with Effect combinators and bounded concurrency; unmanaged promises/fibers bypass
that lifecycle.

A `ManagedRuntime` or explicitly provided layer can bridge route/action/job/CLI
boundaries to promises. Keep `Effect.runPromise` out of domain services so their
dependencies remain explicit. Validate configuration when constructing live layers;
importing a module during a build should not initialize database/auth clients.

Scope pools/clients with finalizers, reuse safe runtime resources, and dispose
CLI/test runtimes. Serverless correctness cannot depend on process-exit cleanup
or in-memory state surviving invocations.

Retry transient failures with bounded schedules/timeouts and cancellation support.
Side-effecting retries need idempotency. Work that outlives a request needs a durable
hosting workflow/queue boundary; a function-process fiber is not durable delivery.

Add useful spans/log fields at use-case and adapter boundaries, redact credentials,
and map known HTTP failures to appropriate status codes and stable wire errors.

Reference: [Effect v4 runtimes](https://effect.website/docs/v4/runtime).
