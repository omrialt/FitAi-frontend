import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

/**
 * Test config is kept separate from vite.config.ts and merged in, so the dev
 * and build pipelines stay exactly as they were — the app config is the source
 * of truth for plugins and path aliases, and this file only adds the runner.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      // Only unit tests. `dist/` and `node_modules/` are excluded by default;
      // this keeps a stray .spec inside a build artifact from being picked up.
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      restoreMocks: true,
    },
  }),
);
