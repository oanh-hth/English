import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run dev` (this, port 5173) forwards /api to `npm run server` (port 3001).
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3001' } },
});
