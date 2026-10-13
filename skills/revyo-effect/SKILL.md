---
name: revyo-effect
description: Design or change Effect v4 backend services, typed errors, layers, or runtime integration.
---

# Effect v4 backend

Use Effect major 4 for Revyo backend TypeScript. When adding/upgrading dependencies,
resolve compatible v4 packages and pin matching prerelease/unstable integrations.
Use installed v4 types/docs for API choices; an older tutorial or ar-platform pin
is not a reason to fall back to v3.

Domain packages own business use cases and explicit service contracts. Compose
live dependencies with Layers at the application boundary and supply test services
through the same contracts. SQL, cookies, vendor calls, and environment loading
belong in adapters, not business rules.

- Defining services, failures, or test layers: [service design](references/services.md).
- Integrating routes, promises, resources, retries, or jobs:
  [runtime boundaries](references/runtime.md).

Run effects at outer boundaries. Keep expected failures typed, preserve defects
and interruption, and map known failures to stable transport errors. Use schemas
for external data/configuration where appropriate, with browser-safe contracts
separate from server adapters.

Verify the affected use case with controlled dependencies and the relevant success
or failure outcomes. Test changed live adapters at their real boundary; fake layers
establish domain behavior. Use [revyo-testing](../revyo-testing/SKILL.md) when
configuring measurement or changing test strategy.
