import { defineConfig } from 'vitest/config'

// Unit tests cover server actions and utilities only — no component tests,
// so we run in a plain Node environment without React/jsdom.
export default defineConfig({
  // Resolve the "@/*" path alias from tsconfig natively (Vite/Vitest 4+).
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/actions/**/*.test.ts', 'src/lib/**/*.test.ts'],
  },
})
