import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  esbuild: { jsx: 'automatic' },
  test: {
    include: ['exercises/**/*.test.{ts,tsx}'],
    environment: 'node', // React exercises switch to jsdom with a "@vitest-environment jsdom" comment
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 8000,
  },
});
