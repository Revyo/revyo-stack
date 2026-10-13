import { spawnSync } from "node:child_process";

export const marker = "<!-- revyo-upstream-skills -->";
export const updatePaths = [
  "revyo-design",
  "revyo-engineering",
  "revyo-seo",
  "upstream-lock.json",
  "upstream-sources.json",
  "upstream-overrides.json",
];

export function command(args) {
  const result = spawnSync(args[0], args.slice(1), {
    encoding: "utf8",
    env: process.env,
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    text: result.stdout.trim(),
    error: result.stderr.trim(),
  };
}

export function run(args, execute) {
  const result = execute(args);
  if (result.status !== 0)
    throw new Error(`${args.slice(0, 2).join(" ")} failed: ${result.error}`);
  return result.text;
}

export function differs(args, execute) {
  const result = execute(["git", "diff", "--quiet", "--exit-code", ...args]);
  if (result.status > 1) throw new Error(`git diff failed: ${result.error}`);
  return result.status === 1;
}

export function managedPullRequests(execute) {
  const entries = JSON.parse(
    run(
      [
        "gh",
        "pr",
        "list",
        "--state",
        "open",
        "--limit",
        "1000",
        "--json",
        "number,headRefName,headRefOid,body,isDraft",
      ],
      execute,
    ),
  );
  return entries.filter(
    (pr) =>
      pr.headRefName.startsWith("chore/upstream-skills-") &&
      pr.body.includes(marker),
  );
}

export function closeSuperseded(prs, replacement, execute) {
  for (const pr of prs) {
    if (pr.number === replacement?.number) continue;
    const reason = replacement
      ? `Superseded by ${replacement.url}.`
      : "Upstream catalog is already current on the default branch.";
    run(["gh", "pr", "close", String(pr.number), "--comment", reason], execute);
  }
}

export function sameCatalog(pr, execute) {
  run(["git", "fetch", "origin", pr.headRefName], execute);
  return !differs(["--cached", "FETCH_HEAD", "--", ...updatePaths], execute);
}

export function createReplacement(execute, id) {
  const branch = `chore/upstream-skills-${id}`;
  run(["git", "switch", "-c", branch], execute);
  run(["git", "commit", "-m", "chore: update upstream skill catalog"], execute);
  run(["git", "push", "origin", branch], execute);
  const body = `${marker}\nRefresh the curated upstream skills from their original sources, preserving Revyo discovery overrides and source attribution.\n\nValidation: bun run check passed before this PR was opened. This draft replaces older automated catalog updates and includes all current additions.`;
  const url = run(
    [
      "gh",
      "pr",
      "create",
      "--draft",
      "--title",
      "chore: update upstream skills",
      "--body",
      body,
      "--head",
      branch,
    ],
    execute,
  );
  return { url };
}

export function updatePullRequests(execute, id) {
  run(["git", "add", "--", ...updatePaths], execute);
  const prs = managedPullRequests(execute);
  if (!differs(["--cached", "--", ...updatePaths], execute)) {
    closeSuperseded(prs, undefined, execute);
    return "Catalog unchanged; no update PR needed.";
  }
  const same = prs.find((pr) => sameCatalog(pr, execute));
  if (same) {
    if (!same.isDraft)
      run(["gh", "pr", "ready", String(same.number), "--undo"], execute);
    closeSuperseded(prs, { ...same, url: `#${same.number}` }, execute);
    return `Existing draft #${same.number} already contains these updates.`;
  }
  // Only close prior updates after both push and PR creation have succeeded.
  const replacement = createReplacement(execute, id);
  closeSuperseded(prs, replacement, execute);
  return replacement.url;
}
