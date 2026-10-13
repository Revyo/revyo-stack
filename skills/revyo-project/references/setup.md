# Project setup decisions

Infer the product, required apps, first user workflow, persistence, and authentication
needs from the request. Ask for missing product/platform choices only when they
materially affect the result, while continuing independent work. Native target OS
choices need resolution before platform scaffolding. For an unspecified database
provider, state Neon Postgres as a reversible assumption; PlanetScale means Postgres.

Resolve compatible versions when adding dependencies: latest stable Next.js and
Effect major 4. If v4 is only available as a prerelease, pin the matching v4 release
and ecosystem rather than substituting v3. Commit `bun.lock` and record the actual
runtime/toolchain versions. Existing pins do not need an upgrade for an unrelated edit.

Merge root configuration instead of generating over a nonempty repository. Preserve
`.agents/skills`, `.agents/revyo-stack.json`, any `.claude/skills` copy, an existing
`@revyo/stack` dependency, and Bun trust settings. One-command skills installation
alone does not require that package dependency or trust setting. Put consumer-specific
agent instructions outside the installer’s managed block.

Create packages for the requested workflow. An authenticated web project may need
`apps/web`, `packages/auth`, `packages/data`, and domain packages; HTTP/native clients
consume domain contracts rather than owning persistence rules. Integrate a meaningful
flow through validated input, session/authorization when needed, the use case,
repository adapter, and visible result.

Use isolated test dependencies for unavailable infrastructure, retaining a usable
live-adapter path and identifying which behavior remains unverified. Prepare provider-ready
configuration and environment contracts locally; provisioning, migrations, deployment,
and release follow the user’s actual scope. Production migrations do not belong in
install/build hooks.
