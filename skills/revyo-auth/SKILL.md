---
name: revyo-auth
description: Implement or review Better Auth sign-in flows, sessions, and resource authorization when changing authentication or access control.
---

# Better Auth

Use Better Auth for new authentication unless the user or product requires another
provider. Preserve an existing integration when the task does not call for a migration.

Keep credential/session handling in Better Auth. Domain code receives a verified
principal through an Effect service; the library’s protocol handler can remain
native. A cookie-presence check or hidden UI does not authorize a resource. Derive
the acting user and tenant from verified credentials and membership, then apply
ownership/role checks at protected read/write boundaries.

Read the reference for the boundary being changed:

- Installing Better Auth, changing plugins/schema, or wiring Next.js handlers:
  [integration](references/integration.md).
- Native login or callback/token handling: [native clients](references/native-clients.md).
- Database adapter work: [revyo-database](../revyo-database/SKILL.md).

Keep secrets and origins validated at the runtime boundary, with production
configuration fail-closed and credentials redacted from logs. Module imports
should not connect to production services during a build.

Verify the affected authentication behavior and denial paths. Changes to session,
role, tenant, or origin handling need checks at that boundary; unrelated edits do
not require rerunning every authentication scenario. Finish independent source
work and isolated checks when email/provider credentials are unavailable, and
identify which live flow remains unverified.
