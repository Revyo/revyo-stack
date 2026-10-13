# Revyo Design

Handpicked design skills from Jakub Krehel, Taste, Emil Kowalski, Vercel,
Anthropic, Designed by AI, Fluid Functionalism, and Transitions.dev.

The reusable additions found in `projects/individu` are `building-components`,
`swiftui-expert-skill`, and `swiftui-liquid-glass`. They are refreshed from their
licensed upstream sources rather than copied from a private application.
Individu's squircle guidance stays there because it hardcodes that app's package
paths, icon imports, and design choices.

Each subfolder is one discoverable skill. `SKILL.md` is a short Revyo entry point;
`UPSTREAM.md` and the supporting resources preserve the domain guidance. Source
links, revisions, and licenses are recorded beside them. Transitions.dev adapters
load the original skill and only relevant recipes on demand because its terms
restrict redistribution of the library. No paid recipes are bundled.

The installer places these beside the core skills in `.agents/skills/` and, when
requested, `.claude/skills/`. All skills permit automatic invocation. Taste
(`design-taste-frontend`) leads public-facing pages; alternative visual styles
are selected by brief, not loaded together. The [design router](../skills/revyo-design/SKILL.md)
handles app UI, motion, components, mobile, and reviews.

Add or change upstream selections in [upstream-sources.json](../upstream-sources.json).
Tune discovery in [upstream-overrides.json](../upstream-overrides.json), then run
`bun run upstream:sync`. A weekly workflow refreshes the source snapshots and
keeps at most one current draft update PR.
