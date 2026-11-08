import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Tests always import from "@/...". By default "@" is your own code (src/).
// `npm run verify` sets LEARN_TARGET=solutions so the same tests run against the reference solutions.
// LEARN_TARGET=solutions runs the tests against the reference solutions (maintainers). LEARN_SRC points at any other folder.
const target = process.env.LEARN_SRC ?? (process.env.LEARN_TARGET === 'solutions' ? 'solutions/src' : 'src');

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL(`./${target}`, import.meta.url)) } },
  test: {
    globals: true,
    environment: 'node', // React tests switch to jsdom with a `// @vitest-environment jsdom` comment
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 8000,
  },
});
