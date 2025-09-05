import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['./scripts/unit/**/*.test.js'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/_site/**'],
    coverage: {
      provider: 'v8',
      exclude: [
        '**/node_modules/**',
        'scripts/unit/**',
        '**/*.min.js',
        '**/vendor/**',
        '**/plugins/**',
        '**/_site/**',
        '**/gulp/**',
        '**/*.config.js',
        '**/*.config.ts'
      ],
      include: [
        'assets/js/modules/*.js'
      ],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage'
    }
  },
  resolve: {
    alias: {
      '@': './assets/js/modules'
    }
  }
}); 