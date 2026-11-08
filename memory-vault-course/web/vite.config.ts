import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `npm run dev:web` serves the React app on :5173 and forwards /api calls to the Node server on :3000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:3000' } },
});
