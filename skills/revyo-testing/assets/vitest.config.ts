import { defineConfig } from "vitest/config";

// Copy into a workspace and tailor include/environment to its actual source.
// Launch Vitest with Node, even though Bun manages dependencies and scripts.
export default defineConfig({
  test: {
    environment: "node",
    include: ["{src,app,lib,components,api}/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: [
        "{src,app,lib,components,api}/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}",
      ],
      exclude: [
        "**/*.{test,spec}.{ts,tsx,js,jsx,mts,cts,mjs,cjs}",
        "**/*.d.{ts,mts,cts}",
        "**/{__tests__,__fixtures__,generated}/**",
        "**/src/test.{ts,js}",
      ],
      reporter: ["json", "html", "text-summary"],
      reportsDirectory: "coverage",
      clean: true,
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 80 },
    },
  },
});
