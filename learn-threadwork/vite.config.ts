import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));

// The client app. API calls to /api go to the Node server on port 3001.
export default defineConfig({
  root: "app/client",
  plugins: [react()],
  resolve: { alias: { "@app": here + "app" } },
  server: { port: 5173, proxy: { "/api": "http://localhost:3001" } },
  build: { outDir: here + "dist", emptyOutDir: true },
});
