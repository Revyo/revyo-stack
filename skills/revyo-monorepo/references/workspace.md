# Workspace boundaries

Create only the app/package boundaries the product needs. A typical layout is:

```text
apps/
  web/                  Next.js web/API host
  api/                  Separate Vercel API only when needed
  ios/ android/         Requested native mobile targets
  macos/ windows/ linux/ Requested native desktop targets
packages/
  auth/                 Server configuration and separate client exports
  data/                 Schema, migrations, repository adapters
  <domain>/             Effect services and domain contracts
  ui/                   Shared web components when reuse exists
  typescript-config/
  eslint-config/
```

Use `@repo/<name>` for private TypeScript packages and `workspace:*` for internal
dependencies. Give runnable packages unambiguous names for Turbo filters.

Native apps keep actual platform manifests beneath their app directory. A private
`package.json` wraps real platform build/test commands for Turbo. Swift, Gradle,
and .NET retain their own dependency resolution and lockfiles.

Expose supported entry points through `exports`. Source-exported TypeScript uses
bundler-compatible configuration and needs consumer transpilation; compiled
libraries own their emitted `dist` exports. Do not combine emitted-library settings
with a no-emit Next.js config. Share strict compiler settings such as `strict` and
`noUncheckedIndexedAccess`, extending framework/platform configs as needed.

Merge existing root manifests and keep an existing `@revyo/stack` dependency when
present. CLI-only CRAP usage needs no package dependency; importing the shared
scoring API or selecting a local executable does. See the
[measurement contract](../../revyo-testing/references/crap.md).

Reference: [Bun workspaces](https://bun.sh/docs/pm/workspaces).
