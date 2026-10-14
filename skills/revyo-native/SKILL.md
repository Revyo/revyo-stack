---
name: revyo-native
description: Build or change native mobile and desktop app targets, platform integrations, or API clients.
---

# Native apps

Native Revyo targets use their platform UI and toolchains. A cross-platform runtime
or WebView shell does not substitute for a requested native app; a system browser
for authentication is an appropriate native integration. Do not migrate an existing
app merely because this skill is selected.

Resolve missing operating-system choices before scaffolding targets; continue
independent work where possible. Share backend contracts and design concepts,
with platform-specific UI implementations.

- Target/toolchain selection, workspace integration, signing, or distribution:
  [platform setup](references/platforms.md).
- API contracts, networking, or login: [client boundaries](references/clients.md).
- Native complexity/coverage measurement:
  [native quality gate](../revyo-testing/references/native.md).

Implement the requested workflow’s loading, error/offline, cancellation, and
credential-expiry behavior using platform facilities. Keep server secrets and
database drivers out of binaries.

Use real SDK builds and relevant platform tests to establish changed behavior.
An unavailable host/SDK does not prevent independent source work, but source
generation or a successful backend check is not a native build. Report the precise
remaining platform check and leave its commands executable.
