# Metadata and preview verification

## Resolve the actual public origin

Use the deployed product domain, not a guessed `.com`, localhost, or an unrelated
preview. Inspect the configured origin and the live page when production is in
scope. Normalize it as an origin, without accidental paths/query strings, and keep
canonical and share-image URLs consistent. Do not silently hardcode a fallback
domain from another project.

## Inspect resolved metadata

For relevant pages, verify title, description, canonical, Open Graph title/type/URL,
image URL/dimensions/alt, and the intended large-image social card. Check root defaults
and representative page overrides; inherited metadata or an old file convention can
win over source edits. Use [Open Graph’s protocol](https://ogp.me/) for the fields.

For Next.js, follow the installed version’s [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
and [image file conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).
`metadataBase` resolves relative metadata URLs; file-based metadata has higher
priority than metadata exports. Use the supported [viewport API](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)
for `themeColor`. Inspect the actual response for the relevant HTML-limited crawler
as well as the rendered page when streamed metadata is involved.

## Verify delivery and appearance

Fetch every changed image URL anonymously with a real GET. Confirm success,
image content type, decodable bytes, intended dimensions, and the final response
URL. A local file, HEAD-only check, or URL returning a sign-in/challenge/HTML page
does not establish a working social image. Check ordinary and relevant crawler
responses when diagnosing a preview failure.

Open the actual delivered card and inspect the logo, copy, palette, and crop. Check
favicon/touch/manifest references and representative routes after a brand change.
For live changes, verify the production response after deployment. A platform’s
cached preview can lag behind a working origin; distinguish cache state from an
origin failure and use its official preview/debugger tool when available.

Run build/type/lint checks when changes affect metadata code or generated routes,
and focused regression checks for the affected behavior. A static-asset repair does
not require unrelated backend test runs. Report tested URLs and remaining external
limitations; retain an explicit preview-only scope.
