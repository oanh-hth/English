import { defineConfig } from 'vitest/config';

// One test run for the whole course. Each package has its own small config.
export default defineConfig({
  test: { projects: ['shared', 'server', 'web'] },
});
