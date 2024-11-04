export default {
  preset: 'ts-jest',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  testTimeout: 30000,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
