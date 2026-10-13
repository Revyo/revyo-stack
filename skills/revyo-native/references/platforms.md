# Native platform setup and distribution

Use these starting stacks for requested targets:

| Target       | Stack                                                      | App directory  |
| ------------ | ---------------------------------------------------------- | -------------- |
| iOS / iPadOS | Swift, SwiftUI, Xcode; XCTest/Swift Testing and XCUITest   | `apps/ios`     |
| Android      | Kotlin, Compose, Gradle wrapper; JVM/instrumentation tests | `apps/android` |
| macOS        | Swift, SwiftUI/AppKit, Xcode; native unit/UI tests         | `apps/macos`   |
| Windows      | C#/.NET, WinUI 3, Windows App SDK; native unit/UI tests    | `apps/windows` |
| Linux        | Distro-compatible native toolkit such as GTK or Qt         | `apps/linux`   |

Resolve supported SDK versions when setting up/upgrading a target. Configure
actual deployment targets, app identifiers, and permissions for implemented features.
Keep signing team IDs, keystores, signing credentials, and service secrets out of source.

Use [workspace wrappers](../../revyo-monorepo/references/workspace.md) around
platform commands. Pin Gradle, SDK/.NET constraints, and Swift package resolution
where applicable. Bun/Turbo orchestrates native commands; TypeScript does not
replace native compilation.

Build/test on compatible hosts: Apple targets need macOS/Xcode, and Windows UI
builds need the Windows SDK/host. Commands identify the target device/simulator
and configuration. Configure matching CI runners when adding platform verification.

Vercel serves APIs and optional release metadata. Signed binaries use platform
distribution: App Store/TestFlight, Google Play, notarized macOS releases, Windows
packaging, or Linux packages. Setup can produce unsigned/local artifacts; carry
out signing/publishing only within the requested release scope.

References: [SwiftUI](https://developer.apple.com/xcode/swiftui/),
[Compose](https://developer.android.com/compose),
[WinUI](https://learn.microsoft.com/windows/apps/winui/),
[GTK](https://www.gtk.org/), [Qt](https://doc.qt.io/).
