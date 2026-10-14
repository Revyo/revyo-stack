# Vercel project and build configuration

For a new monorepo deployment, configure one Vercel project per deployable web/API
app with its actual Root Directory. Enable workspace source access outside that
directory when needed. Use the selected Next.js framework preset, root Bun lockfile,
and currently supported installation behavior.

Check build/install commands, output handling, runtime, and package graph when
changing deployment configuration. A root `bun run build` can recurse into the
wrong workspace if cwd/filtering is wrong. Use an app-specific command or verified
Turbo filter. Next.js owns its framework output; a generic `dist` override is inappropriate.

Prefer Next.js route handlers for the default API. A separate API app needs a
supported Vercel entry point/framework adapter; a local listening server does not
establish deployability. Verify current framework/runtime docs for API/configuration
changes.

For an authorized deployment, run relevant local gates and the target build, deploy
a preview, and verify affected behavior. Check auth callback/origin handling,
protected denial, database connectivity, or job endpoints when the change involves
those boundaries. Confirm environment isolation and report the resulting URL.

References: [monorepos](https://vercel.com/docs/monorepos),
[Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs),
[Bun runtime](https://vercel.com/docs/functions/runtimes/bun).
