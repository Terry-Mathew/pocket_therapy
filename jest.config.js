/**
 * Jest Configuration for PocketTherapy
 * 
 * Configured for React Native testing with proper mocks
 * and test utilities for mental health app testing
 */

module.exports = {
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.expo/',
    '<rootDir>/dist/'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/index.{js,ts}',
    '!src/constants/**/*',
    '!src/data/**/*'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  testEnvironment: 'node',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  globals: {
    __DEV__: true
  },
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
