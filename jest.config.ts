// jest.config.ts (resumen)
import type { Config } from 'jest';
const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  testMatch: ['**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },

  transform: { '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.test.json' }] },

  // Cobertura
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/test/**',
  ],
  // coverageDirectory: 'coverage',
  // coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: { global: { lines: 80, statements: 80, functions: 80, branches: 70 } },
};
export default config;
