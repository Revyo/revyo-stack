# Revyo SEO

Focused upstream skills for public-site discovery:

- `seo-audit`: diagnose existing technical and on-page SEO issues.
- `programmatic-seo`: design useful page families from templates and real data.
- `ai-seo`: improve content discovery and citation in AI search.
- `is-agentic`: check technical readiness of public sites and MCP endpoints.

Audit and programmatic SEO remain separate because their triggers and outcomes
are different. The [Revyo SEO router](../skills/revyo-seo/SKILL.md) loads the relevant
workflow; it also selects [brand/social previews](../skills/revyo-brand-social/SKILL.md)
when a public page needs a brand-consistent OG image, favicon, or metadata repair.

The marketing skills retain licensed upstream guidance/resources, concise Revyo
entry points, and automatic invocation. Is Agentic uses the exact official HTTP
skill URL through a discoverable adapter because its advertised GitHub repository
was unavailable when added. The weekly updater checks its content digest and
includes changed instructions in the next draft update. No remote skill content
is redistributed, and the updater does not run audits against third-party sites.

Selections, reviewed descriptions, and domain guidance are maintained in
`upstream-sources.json` and `upstream-overrides.json`. Local brand guidance belongs
in `skills/revyo-brand-social`; upstream refreshes do not overwrite it.
