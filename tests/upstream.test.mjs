import { afterEach, describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  description,
  frontmatter,
  metadata,
  renameInvocations,
  rewriteLinks,
  skillName,
} from "../scripts/upstream/render.mjs";
import {
  material,
  readLock,
  repositorySnapshot,
  safeFile,
  selectedPaths,
  syncCatalog,
} from "../scripts/upstream/sync.mjs";
import {
  command,
  differs,
  marker,
  run,
  updatePullRequests,
} from "../scripts/upstream/pull-requests.mjs";
import { resolveSkillLink, skillDirectories } from "../lib/catalog.mjs";

import { fetchHttpSources, httpSnapshot } from "../scripts/upstream/http.mjs";

const roots = [];
const temporary = () => {
  const path = mkdtempSync(join(tmpdir(), "revyo-upstream-test-"));
  roots.push(path);
  return path;
};
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);
const markdown = (
  name = "sample",
  text = "Use when editing sample components.",
) =>
  `---\nname: ${name}\ndescription: ${JSON.stringify(text)}\ndisable-model-invocation: true\n---\n\n# Sample\n\n[Guide](references/guide.md)\n`;
const source = {
  id: "sample",
  repository: "example/skills",
  paths: ["skills"],
  destination: "revyo-design",
  license: "LICENSE",
  mode: "vendor",
};
const snapshot = (revision = "aaa", contents = {}) => {
  const files = {
    "skills/sample/SKILL.md": markdown(),
    "skills/sample/references/guide.md": "Guide text\n",
    "skills/sample/assets/icon.bin": Buffer.from([0, 255, 10]),
    LICENSE: "MIT fixture license\n",
    ...contents,
  };
  return {
    revision,
    files: Object.keys(files),
    read: (path) => Buffer.from(files[path]),
    mode: () => "100644",
  };
};
const setup = (sources = [source]) => {
  const root = temporary();
  for (const dir of [
    "skills",
    "revyo-design",
    "revyo-engineering",
    "revyo-seo",
  ])
    mkdirSync(join(root, dir));
  writeFileSync(
    join(root, "upstream-sources.json"),
    JSON.stringify({ sources }),
  );
  writeFileSync(
    join(root, "upstream-overrides.json"),
    JSON.stringify({ renames: {}, descriptions: {} }),
  );
  return root;
};

// The wrapper redirects only clone to a disposable local repo; all reads use real Git.
const gitFixture = () => {
  const repo = temporary();
  const data = snapshot();
  for (const file of data.files) {
    mkdirSync(join(repo, file, ".."), { recursive: true });
    writeFileSync(join(repo, file), data.read(file));
  }
  const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  execFileSync(realGit, ["init", "-q", repo]);
  execFileSync(realGit, ["-C", repo, "add", "."]);
  execFileSync(realGit, [
    "-C",
    repo,
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.test",
    "commit",
    "-qm",
    "fixture",
  ]);
  const bin = temporary();
  writeFileSync(
    join(bin, "git"),
    `#!/bin/sh\nif [ "$1" = clone ]; then\n  for target in "$@"; do :; done\n  exec '${realGit}' clone -q "$REVYO_TEST_REMOTE" "$target"\nfi\nexec '${realGit}' "$@"\n`,
    { mode: 0o755 },
  );
  return {
    repo,
    bin,
    env: {
      ...process.env,
      REVYO_TEST_REMOTE: repo,
      PATH: `${bin}:${process.env.PATH}`,
    },
  };
};

describe("upstream catalog", () => {
  test("sync preserves resources and attribution, enables discovery, and ignores unrelated upstream commits", () => {
    const root = setup();
    const first = syncCatalog(root, () => snapshot());
    expect(first.sample.revision).toBe("aaa");
    expect(
      readFileSync(join(root, "revyo-design/sample/assets/icon.bin")),
    ).toEqual(Buffer.from([0, 255, 10]));
    expect(
      readFileSync(join(root, "revyo-design/sample/LICENSE.upstream"), "utf8"),
    ).toContain("MIT fixture license");
    const entry = readFileSync(
      join(root, "revyo-design/sample/SKILL.md"),
      "utf8",
    );
    expect(frontmatter(entry).name).toBe("sample");
    expect(frontmatter(entry)["disable-model-invocation"]).toBeUndefined();
    expect(
      Bun.YAML.parse(
        readFileSync(
          join(root, "revyo-design/sample/agents/openai.yaml"),
          "utf8",
        ),
      ).policy.allow_implicit_invocation,
    ).toBe(true);
    expect(
      readFileSync(join(root, "revyo-design/sample/SOURCE.md"), "utf8"),
    ).toContain("/blob/aaa/");
    const lock = readFileSync(join(root, "upstream-lock.json"), "utf8");
    syncCatalog(root, () => snapshot("bbb"));
    expect(readFileSync(join(root, "upstream-lock.json"), "utf8")).toBe(lock);
    const changed = syncCatalog(root, () =>
      snapshot("ccc", { "skills/sample/references/guide.md": "New behavior" }),
    );
    expect(changed.sample.revision).toBe("ccc");
    expect(
      readFileSync(
        join(root, "revyo-design/sample/references/guide.md"),
        "utf8",
      ),
    ).toBe("New behavior");
  });
  test("new skills are included and removed or renamed upstream skills leave no obsolete snapshot", () => {
    const root = setup();
    syncCatalog(root, () => snapshot());
    const added = syncCatalog(root, () =>
      snapshot("bbb", { "skills/second/SKILL.md": markdown("second") }),
    );
    expect(Object.keys(added)).toEqual(["sample", "second"]);
    writeFileSync(
      join(root, "upstream-overrides.json"),
      JSON.stringify({
        renames: { sample: { sample: "renamed" } },
        descriptions: { renamed: "Use when comparing sample layouts." },
      }),
    );
    const latest = syncCatalog(root, () => snapshot("ccc"));
    expect(Object.keys(latest)).toEqual(["renamed"]);
    expect(existsSync(join(root, "revyo-design/sample"))).toBe(false);
    expect(existsSync(join(root, "revyo-design/second"))).toBe(false);
    expect(
      frontmatter(
        readFileSync(join(root, "revyo-design/renamed/SKILL.md"), "utf8"),
      ).description,
    ).toContain("comparing");
  });
  test("remote adapters track updates without copying restricted recipes", () => {
    const root = setup([{ ...source, mode: "remote" }]);
    syncCatalog(root, () => snapshot());
    expect(existsSync(join(root, "revyo-design/sample/UPSTREAM.md"))).toBe(
      false,
    );
    expect(existsSync(join(root, "revyo-design/sample/assets"))).toBe(false);
    expect(
      readFileSync(join(root, "revyo-design/sample/SKILL.md"), "utf8"),
    ).toContain(
      "https://github.com/example/skills/blob/aaa/skills/sample/SKILL.md",
    );
    expect(readLock(root).sample.mode).toBe("remote");
  });
  test("upstream executable modes and optional tool metadata survive adaptation", () => {
    const root = setup();
    const data = snapshot("mode", {
      "skills/sample/scripts/run.sh": "#!/bin/sh\necho ready\n",
      "skills/sample/agents/openai.yaml":
        'interface:\n  icon_small: "./assets/icon.bin"\npolicy:\n  allow_implicit_invocation: false\ndependencies:\n  tools: [{type: "mcp", value: "example"}]\n',
    });
    data.mode = (path) => (path.endsWith(".sh") ? "100755" : "100644");
    syncCatalog(root, () => data);
    expect(
      statSync(join(root, "revyo-design/sample/scripts/run.sh")).mode & 0o111,
    ).toBe(0o111);
    const meta = Bun.YAML.parse(
      readFileSync(
        join(root, "revyo-design/sample/agents/openai.yaml"),
        "utf8",
      ),
    );
    expect(meta.interface.icon_small).toBe("./assets/icon.bin");
    expect(meta.dependencies.tools[0].value).toBe("example");
    expect(meta.policy.allow_implicit_invocation).toBe(true);
  });
  test("source failures and duplicate names abort before replacing the previous catalog", () => {
    const root = setup();
    syncCatalog(root, () => snapshot());
    const before = readFileSync(join(root, "upstream-lock.json"), "utf8");
    writeFileSync(
      join(root, "upstream-sources.json"),
      JSON.stringify({ sources: [source, { ...source, id: "second" }] }),
    );
    expect(() => syncCatalog(root, () => snapshot("new"))).toThrow(
      "Duplicate skill name",
    );
    expect(readFileSync(join(root, "upstream-lock.json"), "utf8")).toBe(before);
    expect(() =>
      syncCatalog(root, () => {
        throw new Error("offline");
      }),
    ).toThrow("offline");
    expect(readFileSync(join(root, "upstream-lock.json"), "utf8")).toBe(before);
  });
  test("empty sources, malformed locks, invalid names, symlinks, and unsafe paths fail clearly", () => {
    const root = setup();
    expect(readLock(root)).toEqual({});
    expect(() =>
      syncCatalog(root, () => ({ ...snapshot(), files: ["LICENSE"] })),
    ).toThrow("No skills found");
    expect(() =>
      syncCatalog(root, () =>
        snapshot("a", { "skills/Bad Name/SKILL.md": markdown() }),
      ),
    ).toThrow("Invalid skill name");
    expect(() => safeFile("skills/../outside", "100644")).toThrow(
      "Unsafe upstream path",
    );
    expect(() => safeFile("skills/.git/config", "100644")).toThrow(
      "Unsafe upstream path",
    );
    expect(() => safeFile("skills/linked", "120000")).toThrow(
      "Unsupported upstream file mode",
    );
    safeFile("scripts/run.mjs", "100755");
    expect(() =>
      material(
        source,
        { ...snapshot(), mode: () => "120000" },
        "skills/sample",
      ),
    ).toThrow("Unsupported");
    writeFileSync(join(root, "upstream-lock.json"), "malformed");
    expect(() => readLock(root)).toThrow();
  });
  test("relative supporting links remain usable and colliding skill invocations are renamed", () => {
    const context = {
      path: "skills/group/sample",
      source,
      revision: "abc",
      names: [["skills/group/other", "renamed-other"]],
    };
    const text =
      "[local](references/a.md) [sibling](../other/SKILL.md#topic) [docs](../../../docs/guide.md) [web](https://example.test/x) [anchor](#x) [absolute](/root/x)";
    const rewritten = rewriteLinks(text, context);
    expect(rewritten).toContain("[local](references/a.md)");
    expect(rewritten).toContain("[sibling](../renamed-other/SKILL.md#topic)");
    expect(rewritten).toContain(
      "https://github.com/example/skills/blob/abc/docs/guide.md",
    );
    expect(rewritten).toContain("[web](https://example.test/x)");
    expect(
      rewriteLinks("[docs](../../../docs/guide.md#setup)", context),
    ).toContain("guide.md#setup");
    expect(
      renameInvocations("Use $tdd or /tdd. Read ../tdd/SKILL.md", {
        tdd: "matt-tdd",
      }),
    ).toBe("Use $matt-tdd or /matt-tdd. Read ../matt-tdd/SKILL.md");
    expect(renameInvocations("Unchanged")).toBe("Unchanged");
    expect(
      renameInvocations("https://github.com/leonxlnx/taste-skill/SKILL.md", {
        "taste-skill": "design-taste-frontend",
      }),
    ).toBe("https://github.com/leonxlnx/taste-skill/SKILL.md");
    const nested = { ...context, filePath: "references/topic.md" };
    expect(rewriteLinks("[local](../assets/example.png)", nested)).toBe(
      "[local](../assets/example.png)",
    );
    expect(rewriteLinks("[other](../../other/SKILL.md)", nested)).toBe(
      "[other](../../renamed-other/SKILL.md)",
    );
  });
  test("descriptions are concise and metadata is valid YAML", () => {
    expect(() => frontmatter("No YAML")).toThrow("Missing upstream");
    expect(description("sample", markdown(), { descriptions: {} })).toBe(
      "Use when editing sample components.",
    );
    expect(
      description("sample", markdown("sample", "x".repeat(400)), {
        descriptions: {},
      }),
    ).toHaveLength(220);
    expect(
      skillName("skills/sample", source, {
        renames: { sample: { sample: "renamed" } },
      }),
    ).toBe("renamed");
    expect(
      Bun.YAML.parse(metadata("sample", 'Use "quoted" text.')).interface
        .default_prompt,
    ).toContain("$sample");
    expect(selectedPaths(source, snapshot())).toEqual(["skills/sample"]);
  });
  test("the real Git adapter and sync CLI operate only on the disposable fixture", () => {
    const fixture = gitFixture();
    const actual = repositorySnapshot(source, temporary(), fixture.repo);
    expect(actual.files).toContain("skills/sample/SKILL.md");
    expect(actual.read("LICENSE").toString()).toContain("MIT");
    expect(actual.mode("LICENSE")).toBe("100644");
    const root = setup();
    const result = Bun.spawnSync(
      [
        process.execPath,
        resolve(import.meta.dir, "../scripts/sync-upstream.mjs"),
        root,
      ],
      { env: fixture.env },
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain(
      "Synchronized 1 upstream skills",
    );
    expect(readLock(root).sample.revision).toMatch(/^[a-f0-9]{40}$/);
  });
});

const managed = (number, isDraft = true) => ({
  number,
  headRefName: `chore/upstream-skills-${number}`,
  body: marker,
  isDraft,
});
const publisher = ({
  prs = [],
  changed = true,
  matching = [],
  fail = "",
} = {}) => {
  const calls = [];
  let fetched;
  const execute = (args) => {
    calls.push(args);
    if (fail && args.slice(0, fail.split(" ").length).join(" ") === fail)
      return { status: 2, text: "", error: "fixture failure" };
    if (args[0] === "gh" && args[1] === "pr" && args[2] === "list")
      return { status: 0, text: JSON.stringify(prs) };
    if (args[1] === "fetch") fetched = args[3];
    if (args[1] === "diff")
      return {
        status: args.includes("FETCH_HEAD")
          ? matching.includes(fetched)
            ? 0
            : 1
          : changed
            ? 1
            : 0,
        text: "",
      };
    return {
      status: 0,
      text:
        args[2] === "create" ? "https://github.com/example/skills/pull/20" : "",
    };
  };
  return { calls, execute };
};

describe("weekly draft PR lifecycle", () => {
  test("unchanged content creates no PR and closes only managed obsolete updates", () => {
    const fixture = publisher({
      changed: false,
      prs: [managed(1), { ...managed(2), body: "human PR" }],
    });
    expect(updatePullRequests(fixture.execute, "5-1")).toContain(
      "no update PR",
    );
    expect(
      fixture.calls
        .filter((args) => args[2] === "close")
        .map((args) => args[3]),
    ).toEqual(["1"]);
    expect(fixture.calls.some((args) => args[2] === "create")).toBe(false);
  });
  test("an identical pending update stays open, becomes draft, and replaces duplicates", () => {
    const fixture = publisher({
      prs: [managed(1, false), managed(2)],
      matching: ["chore/upstream-skills-1"],
    });
    expect(updatePullRequests(fixture.execute, "5-1")).toContain(
      "Existing draft #1",
    );
    expect(fixture.calls.find((args) => args[2] === "ready")).toContain(
      "--undo",
    );
    expect(
      fixture.calls
        .filter((args) => args[2] === "close")
        .map((args) => args[3]),
    ).toEqual(["2"]);
    const draft = publisher({
      prs: [managed(1)],
      matching: ["chore/upstream-skills-1"],
    });
    updatePullRequests(draft.execute, "5-1");
    expect(
      draft.calls.some((args) => args[2] === "ready" || args[2] === "create"),
    ).toBe(false);
  });
  test("a fresh complete draft is created before old update PRs are closed", () => {
    const fixture = publisher({
      prs: [managed(1), { ...managed(2), headRefName: "human-work" }],
    });
    expect(updatePullRequests(fixture.execute, "5-2")).toContain("/pull/20");
    const creation = fixture.calls.findIndex((args) => args[2] === "create");
    const closure = fixture.calls.findIndex((args) => args[2] === "close");
    expect(creation).toBeLessThan(closure);
    expect(fixture.calls[creation]).toContain("--draft");
    expect(fixture.calls.filter((args) => args[2] === "close")).toHaveLength(1);
    expect(fixture.calls.find((args) => args[1] === "switch")[3]).toBe(
      "chore/upstream-skills-5-2",
    );
  });
  test("push, creation, comparison, and API failures preserve the older PR", () => {
    for (const fail of [
      "git push",
      "gh pr create",
      "git fetch",
      "gh pr list",
    ]) {
      const fixture = publisher({ prs: [managed(1)], fail });
      expect(() => updatePullRequests(fixture.execute, "5-1")).toThrow(
        "failed",
      );
      expect(fixture.calls.some((args) => args[2] === "close")).toBe(false);
    }
    expect(() =>
      differs([], () => ({ status: 128, error: "bad ref" })),
    ).toThrow("git diff failed");
  });
  test("command execution reports errors and publisher CLI requires a workflow run", () => {
    expect(
      command([process.execPath, "-e", "console.log('fixture')"]).text,
    ).toBe("fixture");
    expect(command([process.execPath, "-e", "process.exit(3)"]).status).toBe(3);
    expect(() => command(["/nonexistent/revyo-fixture-command"])).toThrow();
    expect(() =>
      run(["git", "push"], () => ({ status: 1, error: "no access" })),
    ).toThrow("no access");
    const script = resolve(
      import.meta.dir,
      "../scripts/update-upstream-pr.mjs",
    );
    const invalid = Bun.spawnSync([process.execPath, script], {
      env: { ...process.env, GITHUB_RUN_ID: "", GITHUB_RUN_ATTEMPT: "" },
    });
    expect(invalid.exitCode).toBe(1);
    const bin = temporary();
    writeFileSync(join(bin, "git"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    writeFileSync(join(bin, "gh"), "#!/bin/sh\nprintf '[]'\n", { mode: 0o755 });
    const valid = Bun.spawnSync([process.execPath, script], {
      env: {
        ...process.env,
        GITHUB_RUN_ID: "1",
        GITHUB_RUN_ATTEMPT: "1",
        PATH: `${bin}:${process.env.PATH}`,
      },
    });
    expect(valid.exitCode).toBe(0);
    expect(valid.stdout.toString()).toContain("unchanged");
  });
});

test("logical sibling links resolve both in the source catalog and after installation", () => {
  const root = setup();
  syncCatalog(root, () => snapshot());
  const skills = skillDirectories(root);
  const file = join(root, "skills/revyo-design/SKILL.md");
  expect(resolveSkillLink(file, "../sample/SKILL.md", skills)).toBe(
    join(root, "revyo-design/sample/SKILL.md"),
  );
  expect(resolveSkillLink(file, "../missing/SKILL.md", skills)).toBe(
    join(root, "skills/missing/SKILL.md"),
  );
  expect(resolveSkillLink(file, "references/missing.md", skills)).toBe(
    join(root, "skills/revyo-design/references/missing.md"),
  );
  expect(
    resolveSkillLink(
      join(root, "revyo-design/sample/SKILL.md"),
      "references/guide.md",
      skills,
    ),
  ).toBe(join(root, "revyo-design/sample/references/guide.md"));
});

describe("official HTTP skill sources", () => {
  const remote = {
    id: "web-skill",
    type: "http",
    url: "https://example.test/SKILL.md",
    name: "sample",
    paths: ["skills/sample"],
    destination: "revyo-seo",
    mode: "remote",
  };
  test("fetches and tracks the exact official skill without redistributing it", async () => {
    const root = setup([remote]);
    writeFileSync(
      join(root, "upstream-overrides.json"),
      JSON.stringify({
        renames: {},
        descriptions: {
          sample:
            "Check a public site's agent readiness when preparing its launch.",
        },
        guidance: { sample: "Check the exact report timestamp." },
      }),
    );
    const calls = [];
    const sources = await fetchHttpSources(
      [source, remote],
      async (url, options) => {
        calls.push(url);
        expect(options.signal).toBeInstanceOf(AbortSignal);
        return new Response(markdown());
      },
    );
    expect(calls).toEqual([remote.url]);
    const current = syncCatalog(root, (item) => sources.get(item.id));
    expect(current.sample.revision).toMatch(/^[a-f0-9]{64}$/);
    expect(existsSync(join(root, "revyo-seo/sample/UPSTREAM.md"))).toBe(false);
    expect(existsSync(join(root, "revyo-seo/sample/LICENSE.upstream"))).toBe(
      false,
    );
    const entry = readFileSync(join(root, "revyo-seo/sample/SKILL.md"), "utf8");
    expect(entry).toContain(remote.url);
    expect(entry).toContain("Check the exact report timestamp.");
    expect(entry).not.toContain("Transitions.dev");
    expect(
      readFileSync(join(root, "revyo-seo/sample/SOURCE.md"), "utf8"),
    ).toContain("Content digest:");
    expect(
      Bun.YAML.parse(
        readFileSync(join(root, "revyo-seo/sample/agents/openai.yaml"), "utf8"),
      ).policy.allow_implicit_invocation,
    ).toBe(true);
    const lock = readFileSync(join(root, "upstream-lock.json"), "utf8");
    syncCatalog(root, (item) => sources.get(item.id));
    expect(readFileSync(join(root, "upstream-lock.json"), "utf8")).toBe(lock);
    const next = httpSnapshot(
      remote,
      Buffer.from(markdown("sample", "Updated guidance.")),
    );
    syncCatalog(root, () => next);
    expect(readFileSync(join(root, "upstream-lock.json"), "utf8")).not.toBe(
      lock,
    );
  });
  test("HTTP errors and invalid markdown fail before a tracked catalog is changed", async () => {
    await expect(
      fetchHttpSources(
        [remote],
        async () => new Response("Unavailable", { status: 503 }),
      ),
    ).rejects.toThrow("HTTP skill web-skill: 503");
    await expect(
      fetchHttpSources(
        [remote],
        async () => new Response("<html>Challenge</html>"),
      ),
    ).rejects.toThrow("Missing upstream");
    expect(() => httpSnapshot(remote, Buffer.from(markdown("wrong")))).toThrow(
      "Invalid HTTP skill metadata",
    );
    expect(() =>
      httpSnapshot(
        remote,
        Buffer.from("---\nname: sample\ndescription: 12\n---\n"),
      ),
    ).toThrow("Invalid HTTP skill metadata");
  });
  test("the sync CLI fetches a public HTTP source and creates a discoverable SEO adapter", async () => {
    const server = Bun.spawn(
      [
        process.execPath,
        "-e",
        `const server = Bun.serve({hostname: '127.0.0.1', port: 0, fetch: () => new Response(${JSON.stringify(markdown())})}); console.log(server.port);`,
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    try {
      const reader = server.stdout.getReader();
      const chunk = await reader.read();
      const port = Number(new TextDecoder().decode(chunk.value).trim());
      reader.releaseLock();
      const root = setup([
        { ...remote, url: `http://127.0.0.1:${port}/SKILL.md` },
      ]);
      const result = Bun.spawnSync([
        process.execPath,
        resolve(import.meta.dir, "../scripts/sync-upstream.mjs"),
        root,
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toContain(
        "Synchronized 1 upstream skills",
      );
      expect(skillDirectories(root).map((item) => item.name)).toContain(
        "sample",
      );
      expect(readLock(root).sample.mode).toBe("remote");
    } finally {
      server.kill();
      await server.exited;
    }
  });
  test("SEO-specific vendor guidance is separate from aesthetic recipes", () => {
    const seo = { ...source, destination: "revyo-seo" };
    const root = setup([seo]);
    writeFileSync(
      join(root, "upstream-overrides.json"),
      JSON.stringify({
        renames: {},
        descriptions: {},
        guidance: { sample: "Verify ranking claims with primary sources." },
      }),
    );
    syncCatalog(root, () => snapshot());
    const entry = readFileSync(join(root, "revyo-seo/sample/SKILL.md"), "utf8");
    expect(entry).toContain("Verify ranking claims with primary sources.");
    expect(entry).not.toContain("aesthetic recipes");
  });
});
