# Web authentication and cache boundaries

Read [revyo-auth](../../revyo-auth/SKILL.md) when changing Better Auth integration
and [revyo-database](../../revyo-database/SKILL.md) for persistence changes.
Server-side protected reads/writes validate session and resource authorization;
redirects and hidden controls are navigation, not authorization.

Treat URL parameters, headers/cookies, form input, and webhook bodies as external
input. Backend use cases belong in [domain packages](../../revyo-effect/SKILL.md),
with transport handlers mapping their outcomes.

Keep personalized/tenant data out of static generation and public/cross-user
caches. Public data uses the installed Next.js release’s cache APIs and explicit
invalidation after writes. Secrets stay out of `NEXT_PUBLIC_*`, browser bundles,
and render payloads.

For changed authorization/cache behavior, verify the relevant denied request and
user/tenant isolation. Test async Server Components through data contracts or
browser behavior rather than assuming a client DOM unit runner renders them.

Reference: [Next.js authentication](https://nextjs.org/docs/app/guides/authentication).
