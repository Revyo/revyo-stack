import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { readJson, repositorySnapshot, syncCatalog } from "./upstream/sync.mjs";
import { fetchHttpSources } from "./upstream/http.mjs";

const cache = mkdtempSync(join(tmpdir(), "revyo-upstream-"));
try {
  const root = resolve(process.argv[2] ?? resolve(import.meta.dir, ".."));
  const http = await fetchHttpSources(
    readJson(root, "upstream-sources.json").sources,
  );
  const skills = syncCatalog(
    root,
    (source) => http.get(source.id) ?? repositorySnapshot(source, cache),
  );
  console.log(`Synchronized ${Object.keys(skills).length} upstream skills.`);
} finally {
  rmSync(cache, { recursive: true, force: true });
}
