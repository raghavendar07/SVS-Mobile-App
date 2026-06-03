import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

const alias = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@app': alias('app'),
      '@core': alias('core'),
      '@shared': alias('shared'),
      '@services': alias('services'),
      '@features': alias('features'),
      '@store': alias('store'),
      '@db': alias('db'),
      '@routes': alias('routes'),
      '@hooks': alias('hooks'),
      '@components': alias('components'),
      '@utils': alias('utils'),
      '@assets': alias('assets'),
      '@test': alias('test'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
