---
name: revyo-effect
description: Implement Revyo backend TypeScript with Effect v4 services, typed errors, schemas, live/test layers, scoped resources, and explicit HTTP/runtime boundaries.
---

# Effect v4 backend

Use Effect major 4 for backend TypeScript. Resolve the current v4 release and matching ecosystem packages; pin exact matching versions when using prereleases or unstable integrations. Do not fall back to v3 to match a tutorial. Read the installed v4 types/docs before choosing APIs: ar-platform's release-candidate APIs can differ from stable v4.

## Domain and infrastructure

Define business use cases in domain packages. Use `Context.Service` for explicit dependency contracts; return `Effect.Effect<Success, ExpectedError, Requirements>` from service operations. Avoid placing SQL, cookies, fetch calls, or process environment access directly in business rules.

Compose live dependencies with `Layer` at the app boundary. Provide a deterministic test implementation of external services through the same contract. This follows ar-platform's composition pattern; adapt its APIs to the current v4 release.

Example service shape (check against the installed v4 types):

```ts
import { Context, Data, Effect, Layer } from "effect";

export class CustomerNotFound extends Data.TaggedError("CustomerNotFound")<{
  readonly customerId: string;
}> {}

export class CustomerRepository extends Context.Service<
  CustomerRepository,
  { readonly name: (id: string) => Effect.Effect<string, CustomerNotFound> }
>()("customer/CustomerRepository") {}

export const customerName = (id: string) =>
  Effect.gen(function* () {
    const repository = yield* CustomerRepository;
    return yield* repository.name(id);
  });

export const customerRepositoryTest = Layer.succeed(CustomerRepository, {
  name: (id) =>
    id === "known"
      ? Effect.succeed("Example customer")
      : Effect.fail(new CustomerNotFound({ customerId: id })),
});
```

Keep tagged failure names unique across the relevant domain. Distinguish validation, denied access, missing resource, conflict, and infrastructure failure where callers need different behavior. Do not catch every error and return success/empty data. Preserve defects and interruption as such; map known failures explicitly at the transport boundary.

## Boundaries and lifecycle

Use Effect Schema to decode external input/configuration where appropriate; distinguish encoded wire representations from domain types. Verify current v4 Schema APIs instead of copying v3 `Schema.TaggedError`/decode examples. Keep schemas usable for shared API contracts without bundling server adapters into the client.

Wrap promise-based vendor APIs with a v4-supported Effect constructor and map rejection to a typed infrastructure failure. Supply `AbortSignal` where the vendor supports cancellation. Use `Effect.gen`, combinators, and bounded concurrency for orchestration; do not start unmanaged promises or fibers inside a use case.

Run effects only at the outer boundary (route/action/job/CLI/test runner). A `ManagedRuntime` or explicitly provided layer can bridge to Next.js/HTTP promises. Never scatter `Effect.runPromise` inside domain services to erase dependencies. Configure resource finalizers for pools/clients, reuse only safe immutable/runtime resources, and dispose test/CLI runtimes. Serverless code must not rely on process-exit cleanup or in-memory state for correctness.

Read configuration at live-layer construction, validate required values, and keep production startup fail-closed. Do not initialize database/auth network dependencies merely by importing a module during a build.

## Retries, jobs, and observation

Retry transient failures with bounded schedules/timeouts and respect cancellation. Retry side-effecting operations only with a proven idempotency design. Use durable Vercel-supported job/workflow/queue boundaries for work that outlives a request; an Effect fiber in a function process is not durable delivery.

Add spans/log fields at use-case and adapter boundaries when they explain failures. Avoid logging credentials or unnecessary personal data. Map typed HTTP failures to appropriate status codes and expose stable wire errors rather than serialized internal causes.

## Testing

Use [revyo-testing](../revyo-testing/SKILL.md). Build fresh test layers per test/suite, test both expected failures and success, and control time/random/provider responses through services. Use a v4-compatible `@effect/vitest` when available, or the current Effect run/exit APIs with Vitest. Test live SQL/auth adapters separately; mocked layers establish domain behavior only.

Official references: [Effect v4 docs](https://effect.website/docs/v4/getting-started), [services and layers](https://effect.website/docs/v4/requirements-management/layers), [v3-to-v4 migration](https://github.com/Effect-TS/effect/blob/main/MIGRATION.md), [runtime boundaries](https://effect.website/docs/v4/runtime).
