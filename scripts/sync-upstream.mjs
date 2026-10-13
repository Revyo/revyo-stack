import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { repositorySnapshot, syncCatalog } from "./upstream/sync.mjs";

const cache = mkdtempSync(join(tmpdir(), "revyo-upstream-"));
try {
  const skills = syncCatalog(
    resolve(process.argv[2] ?? resolve(import.meta.dir, "..")),
    (source) => repositorySnapshot(source, cache),
  );
  console.log(`Synchronized ${Object.keys(skills).length} upstream skills.`);
} finally {
  rmSync(cache, { recursive: true, force: true });
}
