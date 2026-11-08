import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5173,
    proxy: {
      // Send API calls to the Express server. Vite also serves OUR source file src/client/api/client.ts at
      // the URL /api/client.ts, so requests for source files must not be proxied.
      '/api': { target: 'http://localhost:3001', bypass: (req) => (/\.(tsx?|css)(\?|$)/.test(req.url ?? '') ? req.url : undefined) },
    },
  },
  build: { outDir: '../../dist', emptyOutDir: true },
});
