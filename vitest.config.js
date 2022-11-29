import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: []
  },
  test: {
    include: ['src/**/*.spec.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/'],
      exclude: []
    },
    deps: {
      inline: ['sinon']
    }
  }
});
