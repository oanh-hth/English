import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `npm run dev:web` serves the React app on :5173 and forwards /api calls to the Node server on :3000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // changeOrigin must stay false: the server compares the browser's Origin header with the Host header (CSRF check, 2.4).
    // If the proxy rewrote Host to 127.0.0.1:3000 they would never match and every change would be refused.
    proxy: { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: false } },
  },
});
