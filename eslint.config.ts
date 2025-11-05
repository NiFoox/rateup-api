// eslint.config.ts
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import globals from 'globals';
import jestPlugin from 'eslint-plugin-jest';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  // Ignorados
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      'eslint.config.ts',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'package.json',
      'tsconfig.test.json',
    ],
  },

  // JS
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node }, // <- estos ya vienen en formato "readonly"
    },
    extends: [js.configs.recommended],
  },

  // TypeScript
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.node },
    },
    extends: tseslint.configs.recommended,
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Tests TS with Jest
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    extends: [jestPlugin.configs['flat/recommended']], // preset oficial Flat
  },

  // JSON
  {
    files: ['**/*.json'],
    extends: [json.configs.recommended],
  },

  // Apaga reglas que chocan con Prettier
  prettier,
]);
