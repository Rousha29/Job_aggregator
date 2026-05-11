module.exports = {
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
      testMatch: ['**/tests/**/*.test.js'],
      collectCoverageFrom: ['src/**/*.js'],
};
