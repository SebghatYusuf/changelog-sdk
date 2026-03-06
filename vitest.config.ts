import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    globals: true,
    testTimeout: 120000,
    hookTimeout: 600000,
  },
})
