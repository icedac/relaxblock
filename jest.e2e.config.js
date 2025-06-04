module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/test/e2e/**/*.test.js'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/test/e2e/setup.js']
};