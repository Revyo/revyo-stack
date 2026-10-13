import { createHash } from "node:crypto";
import { posix } from "node:path";

export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");

export function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error("Missing upstream skill frontmatter");
  return Bun.YAML.parse(match[1]);
}

export function skillName(path, source, overrides) {
  const original = posix.basename(path);
  return overrides.renames[source.id]?.[original] ?? original;
}

export function description(name, text, overrides) {
  if (overrides.descriptions[name]) return overrides.descriptions[name];
  const upstream = String(frontmatter(text).description).replace(/\s+/g, " ");
  const first = upstream.split(/(?<=[.!?])\s+/)[0];
  return first.length <= 220 ? first : first.slice(0, 217) + "...";
}

export function sourceUrl(source, revision, path) {
  return `https://github.com/${source.repository}/blob/${revision}/${path}`;
}

export function rewriteLinks(text, context) {
  return text.replace(
    /(\[[^\]]*\]\()([^\s)]+)(\))/g,
    (match, before, link, after) => {
      if (/^(?:[a-z]+:|#|\/)/i.test(link)) return match;
      const [file, anchor = ""] = link.split("#");
      const directory = posix.dirname(context.filePath ?? "SKILL.md");
      const resolved = posix.normalize(
        posix.join(context.path, directory, file),
      );
      if (resolved.startsWith(context.path + "/")) return match;
      const target = context.names.find(([path]) =>
        resolved.startsWith(path + "/"),
      );
      const hash = anchor ? `#${anchor}` : "";
      if (target) {
        const installed = posix.relative(
          posix.join(context.name ?? "current", directory),
          posix.join(target[1], resolved.slice(target[0].length + 1)),
        );
        return `${before}${installed}${hash}${after}`;
      }
      return `${before}${sourceUrl(context.source, context.revision, resolved)}${hash}${after}`;
    },
  );
}

export function renameInvocations(text, renames = {}) {
  for (const [original, name] of Object.entries(renames)) {
    text = text.replaceAll(`$${original}`, `$${name}`);
    text = text.replaceAll(`../${original}/`, `../${name}/`);
    text = text.replace(
      new RegExp(`(^|[\\s\x60(])/${original}(?=[\\s\x60.,)]|$)`, "gm"),
      `$1/${name}`,
    );
  }
  return text;
}

export function yamlFields(value, indent = "") {
  return Object.entries(value)
    .map(([key, item]) => {
      if (item && typeof item === "object" && !Array.isArray(item))
        return `${indent}${key}:\n${yamlFields(item, indent + "  ")}`;
      return `${indent}${key}: ${JSON.stringify(item)}\n`;
    })
    .join("");
}

export function metadata(name, summary, original = "{}") {
  const existing = Bun.YAML.parse(original);
  existing.interface = {
    ...existing.interface,
    display_name: name,
    short_description: summary.slice(0, 64),
    default_prompt: `Use $${name} for the relevant part of this task.`,
  };
  existing.policy = { ...existing.policy, allow_implicit_invocation: true };
  return yamlFields(existing);
}

export function wrapper(name, summary, detail) {
  return `---\nname: ${name}\ndescription: ${JSON.stringify(summary)}\n---\n\n# ${name}\n\n${summary}\n\n${detail}\n\nSelect this skill automatically when its description fits. This entry point's\nautomatic policy supersedes upstream explicit-only invocation instructions.\nUse the parts relevant to the requested outcome. Existing product requirements,\nproject conventions, and user authorization take precedence over upstream\npreferences. Scale verification and process to the change; finish authorized work\nthrough the checks needed to establish its result.\n\nTreat upstream model names, named agents, tool syntax, and platform paths as\nexamples to map onto available capabilities. Inherit configured models and use\nindependent agents only when useful and permitted. Missing optional tools do not\nblock work that can be completed directly. Do not turn workflow advice into\npermission to publish, send messages, provision resources, or change global settings.\n`;
}

export function remoteDetail(source, revision, path) {
  return `Read the [upstream skill](${sourceUrl(source, revision, path + "/SKILL.md")})\nand fetch only the recipes needed for the current interaction from that directory.\nThis adapter does not redistribute the Transitions.dev library. The free skills\nneed no paid plan; use Pro material only when the user already has access.\nKeep the project's existing motion system when adapting a recipe.`;
}

export function vendorDetail(name) {
  const routing =
    name === "design-taste-frontend"
      ? "For public-facing web design, use this as the default art-direction skill.\nKeep an existing brand or explicit design reference. For app screens and dashboards,\nuse frontend-design and emil-design-eng instead.\n\n"
      : "";
  return (
    routing +
    "Read [UPSTREAM.md](UPSTREAM.md) for the domain guidance and follow only\nits relevant reference links. Treat alternative aesthetic recipes as choices,\nnot cumulative requirements; preserve the established design and motion system."
  );
}
