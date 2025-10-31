import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // <- use jsdom for DOM APIs
    globals: true,        // optional: allows describe/it without import
  },
});
