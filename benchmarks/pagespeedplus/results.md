# Observed PageSpeedPlus trial — 2026-10-14

These are observed outcomes from ordinary product requests, not an automated pass-rate estimate. The build agents did not receive the rubric, maintenance conversation, or instructions to load named skills. Installed `AGENTS.md` routing was the discovery entry point. The desktop build used a separate fresh chat; the functional control and kickoff retest used agents with no inherited conversation. Normal client/global capabilities remained available, so this is not an isolated model comparison. Desktop tool reads were inspected directly; subagent skill-selection summaries are self-reported, with their implementation/configuration and gate artifacts inspected separately.

## Baseline and correction

Baseline catalog: `154ad6bf49b75d4234f74d415df7e572dff050af` (164 skills). This added project-start planning to the previously curated catalog. The marketing and initial functional runs started with those files.

The functional control correctly interpreted the absence of app deferral as a request for working product behavior. It scaffolded site/page management, a Lighthouse audit path, history, thresholds, report export, and a monitoring worker. Its first durable store was a JSON file. This **failed the existing PostgreSQL architecture requirement**. It also selected a smaller local implementation without first settling the broad referenced product's workflow scope.

Correction: `e9cd47dd6253f54fbb2a17d287eb911c2d5d81c6` clarifies that absent hosted credentials do not replace the PostgreSQL live-adapter requirement, and that “local” does not silently reduce product scope. Broad reference-product requests must clarify which workflows ship before dependent scaffolding. The change is in the core project entry point and conditional planning/setup references; no upstream snapshots were rewritten.

The original implementation agent received a corrective owner message and updated installed guidance. Its later result is an **assisted recovery**, not a clean first-pass success. The corrected consumer uses `packages/data`, Drizzle PostgreSQL schema/migrations, a `pg` live adapter for `DATABASE_URL`, and embedded PGlite for local operation/isolated checks. Its browser workflow exercised site creation, an actual Lighthouse audit, persisted results/reload, alert review, and CSV export. Thirty-two behavioral/database tests passed; the strict gate measured 231 functions with no failures and maximum CRAP 8. See [recovery evidence](functional-recovery-quality.json). This local single-workspace control does not establish hosted Neon or a complete account/tenant SaaS.

## Marketing discovery and scope

The fresh desktop chat automatically read `revyo-project` and its planning reference, `revyo-monorepo`, `revyo-web`, `revyo-design`, `design-taste-frontend` and its upstream/resources, `revyo-brand-social` and its references, and `revyo-seo` with public-page guidance. It researched the actual source before proposing an agency audience. No skill name or planning request appeared in the owner prompt. There was no existing codebase to map; preserving the installed skills and using the workspace/web routes was appropriate. It did not load the entire catalog.

It asked who the product should serve. With the owner answer it chose **Tallypace**, an original tally-mark identity with putty/black surfaces and teal actions. It delivered a real marketing interface and local setup-brief planner, with fictional client examples and explicitly proposed prices/features. It did not create a pretend functioning scanner, authentication flow, or monitoring dashboard. This passed automatic routing, audience clarification, brand creation, and the explicit app-deferral boundary.

Two review findings required assistance: the share SVG initially used Arial despite Albert Sans being the recorded brand font, and the workspace initially exposed build/type checks without the required reproducible coverage/CRAP command. The owner explicitly requested both corrections. Core guidance at `e4f0a37dce7e6711a8375a022877cd464740bfa7` now makes runnable quality commands explicit for every generated phase, including marketing-only. The font correction is implementation feedback under the existing brand-consistency guidance, not a new universal skill rule. Later marketing verification is therefore an assisted completion.

The owner subsequently expanded the single-page delivery into three routes: home, workflow, and pricing, with shared navigation and useful page-specific content. This was a scope extension rather than a first-pass routing failure. Final results: 22 tests, production build and types passing, 95.45% lines/statements, 100% functions/branches, and all 21 source functions across 14 files passing with maximum CRAP 6. Checks include all eight site-count/cadence combinations, downloaded brief contents, receipt stages, active-route navigation, route metadata, and negative gate fixtures. See [quality evidence](marketing-quality.json).

Independent HTTP checks found 200 responses on all three routes for ordinary, Googlebot, and Twitterbot user agents (nine responses), distinct page titles/descriptions, local `noindex, nofollow`, a localhost OG URL, a large-image Twitter card, no invented public canonical, and no broken internal routes/anchors. The actual OG raster and icon were fetched with the correct MIME types and dimensions; the raster decoded and was visually inspected. See [HTTP evidence](http-checks.json). The evaluator also opened the actual site in Helium and inspected its rendered brand/hero. The build agent checked all three routes at widths 1440, 768, 390, and 320 with no document overflow, exercised navigation/FAQ, and checked actual downloaded bytes. The Taste visual inspector could not find its supported browser executable; browser/DOM review was used instead. Its complete automated visual gates and a full assistive-technology audit remain unverified.

Corrected social asset:

![Tallypace social preview using the selected Albert Sans identity](tallypace-og.png)

## Clean kickoff retest

A fresh empty repository received the corrected catalog and the original functional prompt, with no named skills and no `/plan` invocation. The agent researched the reference, inspected the empty repository, and raised these consequential questions before source implementation:

- Who is the audience: agencies, product teams, or individual owners?
- Which workflows ship now: core monitoring/scans/history/alerts or the wider suite?
- Is responsive web the first target, or are native targets needed?
- Which live integrations belong in the first delivery?

Its proposed implementation included an owned account/workspace, site/URL management and sitemap import, mobile/desktop scans and scheduling, stored results and trends, thresholds/alert events, and report downloads. It selected Bun/Turbo, Next.js, Better Auth where needed, Neon PostgreSQL/Drizzle in `packages/data`, and Effect v4 service/adaptor boundaries. It reported loading project, setup/planning, design, engineering, web, monorepo, database, auth, and Effect guidance automatically through the installed routes.

This passed the **planning, question, functional-scope, and architecture-selection** checks. The evaluator initially stopped this run before scaffolding to inspect the kickoff result, then resumed with ordinary owner answers and the final core guidance. Those answers selected small web agencies, responsive web, accounts/owned workspaces, site/URL management, mobile/desktop audits, history, threshold-based in-app alerts, report download, and a local scheduling worker. Remote provisioning/deployment and outbound notifications were excluded; RUM/cache-warming/WordPress were explicitly deferred by the owner rather than silently dropped by the agent. No skill names were supplied. The resumed implementation is evaluated separately below.

## Fresh functional implementation

The resumed agent delivered **Pacekeep**, with real Better Auth accounts/sessions, owned workspaces and cross-account access checks, a local embedded PostgreSQL server, Drizzle schema/migrations and a hosted PostgreSQL adapter path, Effect service boundaries, mobile/desktop Lighthouse audits, persisted history, threshold alerts, CSV reports, and a scheduling worker. This run received no architecture correction or instruction to use a named skill. It preserved all 1,106 managed skill files, independently checked against installer hashes.

Frozen install, production build, types across five workspaces, lint/formatting, and 35 unit/integration tests across ten files passed. The production browser flow ran four actual manual/scheduled mobile/desktop Lighthouse audits, reviewed alerts, downloaded CSV, verified cross-account denial, exercised mobile settings/navigation, and verified history after logout/sign-in. The agent found and corrected mobile overflow and the desktop scan profile, then reran the flow successfully. All four verification pages were left paused/manual with no queued/running jobs. The source quality gate measured 271 functions across 39 source files, no failures, and maximum CRAP 6. See [fresh functional evidence](fresh-functional-quality.json).

Aggregate instrumented unit/integration coverage was **78.5% lines, 77.65% statements, 78.96% functions, and 78.45% branches**. The production browser flow ran separately and is not part of those percentages. The consumer has the required fresh-coverage/CRAP gate but no aggregate percentage gate; it has not reached the suggested 90% line/statement/function and 80% branch starting targets. Worker startup and local launcher coverage are notably lower. Passing the per-function CRAP contract does not establish complete coverage. The skills package's own fixed aggregate gates remain separate and pass.

This establishes working local core workflows rather than a marketing-only result when app deferral is absent. Hosted Neon connectivity, the keyed live Google PageSpeed adapter, sustained unattended operation, remote deployment, outbound notifications, and the owner-deferred wider suite remain unverified or out of scope. Skill selection for this subagent is self-reported; architecture, source coverage, managed-file integrity, and quality artifacts were inspected independently.

## Plan mode boundary

No host mode-switch tool was exposed in these runs. The clean retest explicitly reported that discovery/planning remained in the current mode. It did not claim that printing or executing `/plan` switched modes. This verifies the skill's planning fallback and question behavior, **not automatic host Plan-mode activation**. A client with an exposed mode control needs its own mode-transition test. Skills cannot override the host's collaboration-mode instructions.

## Owner inputs

The marketing agent asked about audience after inspecting the source and repository. The owner answer selected small web agencies, delegated the original name/identity, confirmed there were no existing assets, and required local work with no public domain or deployment. Later messages requested the three-route marketing extension and asked to leave the local server running for Helium. These answers did not name skills.

The first functional agent asked about deployment. The owner chose local-only development, small web agencies, and delegated the brand. The later PostgreSQL corrective message is recorded above as assistance. The clean kickoff retest was briefly stopped after questions/architecture, then received the scoped implementation answers recorded above.

See [protocol](protocol.md) for original prompts, acceptance criteria, and preparation steps. Product credentials, public deployments, real alert delivery, sustained scheduling, and search/ranking outcomes are separate verification boundaries.
