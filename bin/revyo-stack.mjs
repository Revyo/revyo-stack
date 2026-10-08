#!/usr/bin/env node
import { installSkills, postinstallRoot } from "../lib/install.mjs";

const usage = `Usage: revyo-stack install [--cwd PATH] [--claude] [--force]

Install Revyo skills into .agents/skills and add the entry point to AGENTS.md.
--claude also installs the skills into .claude/skills.
--force replaces edited Revyo skill files; unrelated files are preserved.`;

try {
  const args = process.argv.slice(2);
  const command = args.shift();
  if (!command || command === "--help" || command === "-h") {
    console.log(usage);
  } else if (command === "postinstall") {
    if (args.length) throw new Error("postinstall takes no arguments");
    const root = postinstallRoot();
    if (root) installSkills({ root });
  } else if (command === "install") {
    const options = { root: process.cwd() };
    while (args.length) {
      const arg = args.shift();
      if (arg === "--cwd") {
        if (!args.length || args[0].startsWith("--"))
          throw new Error("--cwd requires a path");
        options.root = args.shift();
      } else if (arg === "--force") options.force = true;
      else if (arg === "--claude") options.claude = true;
      else throw new Error(`Unknown option: ${arg}`);
    }
    installSkills(options);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(`revyo-stack: ${error.message}`);
  process.exitCode = 1;
}
