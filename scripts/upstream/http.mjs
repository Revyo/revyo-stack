import { digest, frontmatter } from "./render.mjs";

export function httpSnapshot(source, content) {
  const parsed = frontmatter(content.toString());
  if (parsed.name !== source.name || typeof parsed.description !== "string")
    throw new Error(`Invalid HTTP skill metadata for ${source.id}`);
  const path = `${source.paths[0]}/SKILL.md`;
  return {
    revision: digest(content),
    files: [path],
    read: () => content,
    mode: () => "100644",
  };
}

export async function fetchHttpSources(sources, fetcher = fetch) {
  const snapshots = new Map();
  for (const source of sources.filter((entry) => entry.type === "http")) {
    const response = await fetcher(source.url, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      throw new Error(`HTTP skill ${source.id}: ${response.status}`);
    snapshots.set(
      source.id,
      httpSnapshot(source, Buffer.from(await response.arrayBuffer())),
    );
  }
  return snapshots;
}
