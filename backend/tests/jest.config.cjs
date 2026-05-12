module.exports = {
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/jest.setup.cjs'],
      testMatch: ['**/tests/**/*.test.js'],
      collectCoverageFrom: ['src/**/*.js'],
};
