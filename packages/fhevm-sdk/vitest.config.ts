import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // browser-like environment
    setupFiles: "./tests/setup.ts", // optional: for global setup
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
