import { defineConfig, mergeConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default mergeConfig(
  defaultConfig,
  defineConfig({
    test: {
      coverage: {
        enabled: true,
        provider: 'v8',
        exclude: ['**/**/*.module.ts', '*.interface.ts', 'src/core/types/**'],
        reporter: ['text', 'json-summary', 'json'],
        reportOnFailure: true,
      },
      include: ['**/*spec.ts'],
      setupFiles: ['./test/setup-e2e.ts'],
      globalSetup: ['./test/global-setup.e2e.ts'],
      maxConcurrency: 1,
      fileParallelism: false,
    },
  }),
);
