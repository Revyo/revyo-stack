# Native API and authentication boundaries

The hosted Revyo backend uses [Effect v4](../../revyo-effect/SKILL.md) on
[Vercel](../../revyo-vercel/SKILL.md). Native clients call versioned HTTP endpoints.
Share schemas/contract artifacts rather than the TypeScript runtime or Next.js internals.

Generate idiomatic Swift/Kotlin/C# models from OpenAPI/JSON Schema when useful,
or maintain explicit tested contracts. Keep generation reproducible with a drift
check. Use platform networking, cancellation, and secure credential storage such
as Keychain, Android Keystore-backed storage, or Windows credential protection.
Mutation retries need idempotency or an idempotency key.

For login changes, check [Better Auth’s supported native protocol](../../revyo-auth/references/native-clients.md).
Use a system authentication/browser session and verified callback/deep link. OAuth
public clients use authorization code with PKCE, state validation, and exact
callbacks. Never embed a confidential secret or invent a cookie-to-native exchange.

Use universal/app links where supported, protect callback schemes, redact logs,
and verify affected cancellation, callback rejection, expiry, and logout behavior.
Contract tests and a relevant platform UI smoke flow establish client/backend
integration; configure isolated infrastructure when those tests need live services.
