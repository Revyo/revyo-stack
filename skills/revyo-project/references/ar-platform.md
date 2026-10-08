# Architectural reference: ar-platform

Inspected the sibling `ar-platform` checkout on 2026-10-08. These paths explain the reusable patterns without requiring future projects to have access to that checkout.

| Source path                                                | Pattern to carry forward                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `package.json`, `turbo.json`                               | Bun workspaces in `apps/*` and `packages/*`; root commands delegate to Turbo  |
| `packages/typescript-config/*`, `packages/eslint-config/*` | Shared strict compiler and lint settings                                      |
| `packages/collections/src/Collections.ts`                  | Domain use cases depend on explicit Effect services and return typed failures |
| `packages/receivables/src/Ledger.ts`                       | Live and in-memory implementations share a service contract                   |
| `packages/collections/src/test.ts`                         | Compose test layers from domain services and fake provider implementations    |
| `apps/server/src/runtime.ts`                               | Compose production dependencies at the application boundary                   |
| `docs/agents/domain.md`                                    | Read relevant context/glossary and ADRs before changing domain behavior       |

Apply the separation of domain, infrastructure, and transport. Reuse the vocabulary of the new product; do not create collections, receivables, communications, billing, or tenant hierarchies just because they exist in the reference.

## Deliberate differences

- ar-platform uses WorkOS; new projects usually use Better Auth.
- ar-platform uses Nile; new projects use PostgreSQL on Neon or PlanetScale Postgres. PostgreSQL is required for either provider.
- ar-platform's desktop folder includes TypeScript and Tauri configuration; new mobile and desktop UI must use native platform frameworks.
- ar-platform pins an Effect v4 release candidate and Next.js 16.3.0. Resolve current compatible releases for new projects instead of copying these pins.
- ar-platform uses Bun tests, including database-connected fixtures and a custom per-file runner. New projects need isolated fast tests and a coverage format capable of per-function CRAP calculation. The testing skill recommends Vitest for that measurement pipeline.
- ar-platform includes a separately runnable server and workers. A new project's default hosted API can live in Next.js route handlers on Vercel. Create a separate API deployable only when the product boundary requires one, and design jobs for Vercel's supported execution model.
- ar-platform passes many environment variables through Turbo. New projects must hash output-changing variables and explicitly distinguish them from pass-through secrets.
