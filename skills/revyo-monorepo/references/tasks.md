# Turbo tasks and cache inputs

Expose applicable `dev`, `build`, `lint`, `check-types`, `test`, and `test:coverage`
tasks through `turbo run <task>`. Supply explicit formatting commands and wire
`quality:crap` through fresh coverage and the packaged analyzer. Packages without
runtime behavior can omit runtime tests; native-only packages use real native
builds instead of unrelated TypeScript checks.

Tailor this task example to the actual tools and outputs:

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "!.next/dev/**", "dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "test": { "dependsOn": ["^build"], "outputs": [] },
    "test:coverage": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "test:integration": { "cache": false },
    "db:migrate": { "cache": false }
  }
}
```

Use app overrides for native inputs/outputs. Do not cache signed binaries,
keychain state, or credentials. Inspect task coverage with
`turbo run <task> --dry=json` when changing the graph; then run relevant real tasks.

Hash output-changing variables with task `env` or `globalEnv`, including public
Next.js variables. `passThroughEnv` exposes a variable without hashing it. Keep
secret-dependent/live integration, migration, and deploy tasks uncached; deterministic
unit coverage can cache its actual reports.

Document how each tool loads `.env` and its working directory: Turbo does not load
dotenv for the application. Keep `.env.example` tracked, validate runtime configuration,
and avoid initializing network clients merely to satisfy imports during a build.

Use explicit ESLint flat configuration and Prettier commands. When changing Next.js
scripts, use the installed release’s supported lint/type-generation commands rather
than removed `next lint` behavior.

References: [tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks),
[environment handling](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables).
