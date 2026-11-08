import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
// SOLUTIONS=1 runs the tests against the reference solutions (used by `npm run verify`).
const bases = process.env.SOLUTIONS === "1" ? ["solutions", "app"] : ["app"];

function appAlias(): Plugin {
  return {
    name: "app-alias",
    enforce: "pre",
    resolveId(source) {
      if (!source.startsWith("@app/")) return null;
      const rel = source.slice("@app/".length);
      for (const base of bases) {
        for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
          const file = path.join(root, base, rel + ext);
          if (existsSync(file) && statSync(file).isFile()) return file;
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [appAlias(), react()],
  test: {
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    environment: "node",
    restoreMocks: true,
  },
});
