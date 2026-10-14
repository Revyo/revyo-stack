# Native authentication

Check the selected Better Auth release’s supported native or [OAuth integration](https://better-auth.com/docs/plugins/oauth-provider)
before choosing a protocol; use [revyo-native](../../revyo-native/SKILL.md) for the
platform boundary.

A native app is a public client and cannot protect an embedded secret. Where OAuth
is supported, use authorization code with PKCE, state validation, and an exact
verified callback. A browser cookie flow needs a supported handoff; do not invent
custom token minting or exchange protocols.

Use platform secure storage for credentials/tokens. Implement expiry, refresh
where supported, revocation, and logout for the selected flow. Verify changed
callback handling, cancellation, rejected callbacks, and expired credentials on
the actual client boundary.
