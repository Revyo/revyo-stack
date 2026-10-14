---
name: revyo-monorepo
description: Configure Bun workspaces and Turborepo tasks when creating packages or changing workspace boundaries, tooling, or caching.
---

# Bun and Turborepo

Use Bun and Turborepo for Revyo workspace setup. Preserve existing workspace
configuration when the requested change does not require restructuring it.

For a new workspace, keep a private root package, `apps/*` and `packages/*`
workspaces, one root `bun.lock`, and a pinned Bun version shared by local tooling
and CI. Create packages for actual build/deployment or reuse boundaries; avoid
app-to-app source imports and circular dependencies.

- Creating packages, choosing exports, or adding native wrappers:
  [workspace boundaries](references/workspace.md).
- Configuring tasks, environment inputs, or caches: [task graph](references/tasks.md).
- Wiring coverage/CRAP: [revyo-testing](../revyo-testing/SKILL.md).

Expose server code separately from browser-safe contracts. Keep source-exported
and compiled package strategies coherent with their consumers.

Retain installed skills and installation metadata. Exclude `.agents/skills/`,
`.claude/skills/`, and `.agents/revyo-stack.json` from consumer formatting/lint tools:
rewriting managed files changes the hashes used to preserve local edits.

After task or package changes, inspect the relevant Turbo graph and run the tasks
that establish the affected behavior. A green root task is insufficient when a
source package was silently omitted.
