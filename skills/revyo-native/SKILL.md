---
name: revyo-native
description: Set up Revyo mobile and desktop applications using native platform languages, UI frameworks, build/test tools, and authenticated APIs hosted on Vercel.
---

# Native apps

Mobile and desktop apps use native UI and platform toolchains. Do not substitute React Native, Expo, Flutter, Electron, Tauri, Capacitor, or a website in a WebView. A system browser for authentication is an appropriate native integration.

Resolve the requested operating systems before creating targets. Share backend contracts and design concepts across platforms; do not promise one native UI implementation for every OS.

| Target       | Starting stack                                                                                         | App directory  |
| ------------ | ------------------------------------------------------------------------------------------------------ | -------------- |
| iOS / iPadOS | Swift, SwiftUI, Xcode; XCTest/Swift Testing and XCUITest                                               | `apps/ios`     |
| Android      | Kotlin, Jetpack Compose, Gradle wrapper; JVM and instrumentation tests                                 | `apps/android` |
| macOS        | Swift, SwiftUI/AppKit, Xcode; native unit/UI tests                                                     | `apps/macos`   |
| Windows      | C#/.NET, WinUI 3, Windows App SDK; native unit/UI tests                                                | `apps/windows` |
| Linux        | Choose a distro-compatible native toolkit (for example GTK or Qt) and its supported language/toolchain | `apps/linux`   |

Choose supported SDK versions at setup time. Set deployment targets, app identifiers, and permission declarations for the actual feature. Keep Apple signing team IDs, Android keystores, Windows signing credentials, and service secrets out of source.

## Workspace and API contract

Use [revyo-monorepo](../revyo-monorepo/SKILL.md) for private package wrappers around real platform commands. Pin the Gradle wrapper, SDK/.NET constraints, and Swift package resolution where applicable. An npm `build` script should invoke the platform build, not replace it with a TypeScript program.

The hosted backend uses [Effect v4](../revyo-effect/SKILL.md) and [Vercel](../revyo-vercel/SKILL.md). Native clients call versioned HTTP endpoints. Generate idiomatic Swift/Kotlin/C# models or clients from OpenAPI/JSON Schema when useful; otherwise maintain explicit tested contracts. Keep schema generation reproducible and run a drift check. Do not put the TS runtime, database drivers, or server auth secret inside an app binary.

Implement loading, offline/error, retry, cancellation, and authenticated-expiry behavior for the first workflow. Use platform networking and secure credential storage (Keychain, Android Keystore-backed storage, Windows credential protection). Restrict retry of mutations to idempotent operations or those with an idempotency key.

## Login

Use a system authentication/browser session and a verified callback/deep link. Read [revyo-auth](../revyo-auth/SKILL.md) and verify Better Auth's currently supported native/OAuth integration for the chosen client. Where an OAuth public-client flow is used, require authorization code with PKCE, state validation, and exact callback validation; never embed a confidential client secret. Do not invent a token exchange or assume web cookies become native credentials.

Use universal/app links when supported, protect callback schemes, redact logs, and test login cancellation, callback rejection, expired credentials, and logout. Request platform permissions only for an implemented feature.

## Verification and distribution

Build and test on a compatible host with the real SDK: Apple targets need macOS/Xcode; Windows UI builds need the appropriate Windows SDK/host. Keep commands explicit about target device/simulator and configuration. Document unavailable tooling and set up matching CI runners; source generation alone is not a successful native build.

Use [revyo-testing](../revyo-testing/SKILL.md) for behavior and CRAP requirements. Keep native complexity/coverage reporting separate from the TS analyzer; a Bun measurement adapter reuses the formula exported by `@revyo/stack/crap` and enforces the same per-function maximum of 8. Include contract tests against the backend and one platform UI smoke workflow when possible.

Vercel hosts web/backend endpoints and may serve release metadata. Signed native binaries go through platform distribution (App Store/TestFlight, Google Play, notarized macOS releases, Windows packaging, Linux packages). Vercel hosting does not replace native signing or store submission. Build unsigned/local artifacts during setup; signing and publishing follow the user's requested release scope.

Official references: [SwiftUI](https://developer.apple.com/xcode/swiftui/), [Android Compose](https://developer.android.com/compose), [WinUI](https://learn.microsoft.com/windows/apps/winui/), [GTK](https://www.gtk.org/), [Qt](https://doc.qt.io/).
