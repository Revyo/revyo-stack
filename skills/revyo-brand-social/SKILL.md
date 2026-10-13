---
name: revyo-brand-social
description: Create or fix branded Open Graph images, favicons, and share metadata; reuse the existing identity or establish missing brand foundations.
---

# Brand and social previews

Produce a coherent share preview for the actual product and page. Apply this when
building public pages with missing assets, repairing broken previews, or changing
brand assets. Preserve unrelated UI and existing local experiments.

Inspect the current brand and the relevant page/domain before generating anything:

- Brand already exists, OG image missing/broken: reuse its approved logo, colors,
  type, imagery, and mascot. Create or repair the missing card and metadata.
- No established identity: infer the product’s audience/message, establish the
  minimum coherent identity needed for this task, then derive the social assets.
- Branding changed: update affected cards, favicons, touch/install icons, and
  metadata references together; keep intentional variants intact.

Read [brand decisions](references/brand-decisions.md) for identity selection,
[asset composition](references/assets.md) for cards/icons, and
[metadata verification](references/verification.md) when wiring or fixing previews.
Use only the references the current change needs.

Use existing vector/code-native assets directly. For new raster art, use an available
image-generation capability; compose exact lettering and logos deterministically.
A generated image is not evidence of a real product workflow or customer.

Show the actual resulting assets at share size and verify their rendered metadata
and image responses. Finish the authorized implementation and checks; respect an
explicit local-preview or review gate. Record the chosen identity and reusable
asset sources without importing private data or other projects’ brand decisions.
