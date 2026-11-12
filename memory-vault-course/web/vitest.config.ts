import { defineProject } from 'vitest/config';
export default defineProject({
  esbuild: { jsx: 'automatic' },
  test: { name: 'web', environment: 'jsdom', include: ['tests/**/*.test.tsx', 'tests/**/*.test.ts'], setupFiles: ['./tests/setup.ts'] },
});
