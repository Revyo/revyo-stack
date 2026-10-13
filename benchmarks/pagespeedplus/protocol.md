# PageSpeedPlus project-start trial

This is an observed agent trial, not a deterministic unit test or proof that every model/client will choose the same skills. Both runs start in separate empty Git repositories with the normal `revyo-stack install` output. The agent receives no benchmark instructions, named skills, grading rubric, or catalog-maintenance history.

## Product research

PageSpeedPlus is a web-performance monitoring SaaS. It combines scheduled mobile/desktop PageSpeed Insights checks, sitemap-wide scans, lab/field history, alerts, reports, an API, real-user monitoring, and optional cache warming/WordPress optimization. Its public pages contain inconsistent API-version and older metric wording; reproduce the underlying product category, not those claims, customer quotes, logos, or identity.

Primary sources inspected on 2026-10-14:

- <https://pagespeedplus.com/>
- <https://pagespeedplus.com/docs>
- <https://pagespeedplus.com/real-user-monitoring>

## Prompts

Marketing trial (replace `<workspace>` with the prepared repository):

> Build a new product based on what https://pagespeedplus.com/ does. Make it an original product with its own brand rather than copying their identity. Don't build the actual app yet. Work in <workspace> and start by inspecting that repository.

Functional control uses the same prompt without “Don't build the actual app yet.” No prompt invokes a skill or asks the agent to plan. Answer genuine product questions as an ordinary owner: small web agencies, an original identity chosen by the agent, local development, no remote deployment/provisioning. Do not coach skill selection after dispatch. Record any additional scope answer as assisted input rather than silently treating it as part of the initial prompt.

## Acceptance criteria declared before implementation

- Discover installed `AGENTS.md` and project guidance from the supplied repository.
- Begin product planning and ask at least one consequential unresolved product question before dependent implementation. Do not ask already-settled questions.
- Use a real host Plan control if available; otherwise perform planning in the current mode. Printing `/plan` is not a mode transition. Report this distinction in the evidence.
- Select relevant workspace/web, Taste/design, branding, SEO, and verification guidance without naming them in the prompt. Do not count every available skill as necessary: programmatic SEO or a live readiness scan is not automatically appropriate for a local marketing site.
- Marketing trial: deliver runnable, original branded public pages and meaningful navigation/marketing interactions, responsive layout, OG/favicon assets, appropriate local-versus-public metadata, setup/docs, and successful production checks. Illustrative product screens must not imply a working monitor. Do not build the deferred functional app or provision unused services.
- Functional control: include working product workflows, domain logic, persistence and applicable auth/live-adapter boundaries; do not substitute a landing page or stop at a mock dashboard. Verify real local behavior. Report unavailable live boundaries explicitly rather than claiming they passed.
- Verify assets and rendered routes, inspect desktop/mobile UI, and fix observed failures. Retain installed skills.

## Evidence and repeatability

Record prompt, owner answers, run type, skill reads, checks actually run, observed failures, corrections, and remaining limits. Preserve small sanitized excerpts rather than private paths or whole transcripts. For a failed outcome, revise the narrow reusable instruction and retry in a fresh installed repository with the same uncoached prompt. Keep failed runs visible. A corrected or owner-clarified run is not a clean first-pass success.

Use `bun bin/revyo-stack.mjs install --cwd <workspace>` from this checkout to prepare each fixture. The generated app is a separate consumer project, not part of this skills package. Re-run package validation/installer checks after changing skills. The source URL and dependency versions are time-sensitive; a later replay must re-research them.
