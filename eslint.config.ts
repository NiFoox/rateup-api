import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import globals from 'globals';
import jestPlugin from 'eslint-plugin-jest';
import prettier from 'eslint-config-prettier';

export default [
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
      'tsconfig.test.json'
    ],
  },

  // JS
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    ...js.configs.recommended,
  },

  // TypeScript
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node },
    },
    ...tseslint.configs.recommended,
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warnea si hay vars no usadas, excepto si empiezan por _
      '@typescript-eslint/no-explicit-any': 'off', // Permitir any
    },
  },

  // Tests en TS con Jest
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    plugins: { jest: jestPlugin },
    rules: {
      ...(jestPlugin.configs['flat/recommended']?.rules ?? {}),
    },
    languageOptions: {
      globals: {
        ...(jestPlugin.environments?.globals ?? {}), // describe, it, expect, jest, etc.
      },
    },
  },

  // JSON / JSONC
  {
    files: ['**/*.json'],
    ...json.configs.recommended,
  },

  // Apagar reglas estilísticas que chocan con Prettier
  prettier,
];
