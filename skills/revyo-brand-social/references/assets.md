# Social cards and icons

Use a 1200 × 630 card as a practical default for general Open Graph previews, then
adapt to the actual sharing destination. Use a publicly fetchable PNG/JPEG delivery
asset with known dimensions and an appropriate file size for that platform. An
editable SVG can remain the logo source without being the share-image response.

Compose the approved wordmark/logo and concise page-specific text with enough
contrast and safe margins to survive small previews/crops. Inspect the final
raster at full size and card size. Avoid tiny UI, accidental cropping, unreadable
lettering, and decorative labels unsupported by the brief.

Use the selected brand typeface in the delivered asset. Embed a licensed font or
outline its glyphs when the renderer would otherwise substitute a fallback; check
the raster itself, since a font-family declaration does not prove that font rendered.
A `fontfile` argument alone also does not establish that its glyphs were used:
an installed font with the same family can mask a dependency on system font matching.
Use an isolated font environment or resolve glyph outlines directly from the bundled
file when matching is ambiguous.
Keep regeneration runnable from the checkout with declared dependencies and licensed
inputs; an absolute import from a maintainer's tool cache is not a portable asset pipeline.

Reuse existing illustration/mascot assets. Generate original raster backgrounds
when they add useful product-specific meaning. Keep exact brand lettering/logo
composition deterministic instead of relying on generated text. Retain reusable
source files and prompts when new art is generated. Clearly distinguish actual
product screenshots from illustrative UI or fictional scenarios.

When an icon is missing or stale, export it from the current approved mark; an OG
composition is not automatically a readable favicon. Check small browser-tab sizes,
Apple touch icons, manifest/install icons, and maskable safe areas as applicable.
Keep recognizable geometry and intentional rounding, without redesigning the mark
as a side effect. Respect each project’s existing icon sizes and theme variants.

Update references to changed assets and handle stale browser/service-worker caches
with the project’s existing versioning/cache strategy. Browser theme color should
match the approved brand where applicable, but messaging clients are not guaranteed
to display a particular embed accent color. When that color is missing, inspect
emitted media-qualified theme colors and platform behavior before changing browser
theming or removing intentional dark-mode variants.

The workflow generalizes lessons from the local “Add VIAVIA SEO and Open Graph,”
“Fix project OG images and colors,” “Create a branded landing page,” and “Create real
estate landing page” chats. Their colors, slogans, mascots, and publishing permissions
are project-specific examples, not defaults for other products.
