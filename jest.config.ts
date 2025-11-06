import type { Config } from 'jest'

export default {
  preset: 'ts-jest',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/cli/bin.ts', // Exclude CLI entry point (hard to test due to immediate execution)
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
} satisfies Config
