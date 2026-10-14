# Effect services and failures

Use `Context.Service` for explicit dependency contracts and
`Effect.Effect<Success, ExpectedError, Requirements>` for service operations.
Compose production dependencies with `Layer` and provide deterministic test
implementations through the same contract. Check this illustrative shape against
the installed v4 types before adopting it:

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

Keep tagged failures distinct where callers need different handling: validation,
denied access, missing resources, conflicts, and infrastructure errors. Catching
every failure and returning empty/success data erases that contract.

Use current v4 Schema APIs to decode external values; encoded wire values and
domain types may differ. Keep shared schemas usable without server adapters.

For use-case tests, construct fresh test layers at the appropriate test/suite
boundary and control time, randomness, and provider responses through services.
Use a v4-compatible `@effect/vitest` or current run/exit APIs with Vitest. Test live
SQL/auth adapters separately from fake-layer behavior.

References: [v4 documentation](https://effect.website/docs/v4/getting-started),
[layers](https://effect.website/docs/v4/requirements-management/layers),
[migration guidance](https://github.com/Effect-TS/effect/blob/main/MIGRATION.md).
