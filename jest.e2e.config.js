module.exports = {
  testMatch: ['**/test/e2e/**/*.test.js'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/test/e2e/setup.js'],
  testEnvironment: 'node'
};