import type { Config } from 'jest'

export default {
  preset: 'ts-jest',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
} satisfies Config
