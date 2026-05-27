// ESLint v9 flat config.
// Run with: npm run lint
//
// Rule philosophy: lean on the recommended sets from @eslint/js and
// typescript-eslint, plus eslint-config-prettier to disable
// formatting-related rules (prettier owns formatting).

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  // 1. Base JS recommended rules.
  js.configs.recommended,

  // 2. TypeScript recommended rules (no type-checking — fast).
  ...tseslint.configs.recommended,

  // 3. TypeScript strict rules (catches more, still type-aware off).
  ...tseslint.configs.strict,

  // 4. Disable any formatting rules — prettier handles those.
  eslintConfigPrettier,

  // 5. Project-specific tweaks.
  {
    rules: {
      // Allow `unknown` only in input validation (the validateInput
      // method is the one legitimate place we accept untyped input).
      // Everything else stays banned by typescript-eslint/no-explicit-any
      // and our internal convention.
      '@typescript-eslint/no-explicit-any': 'error',

      // Prefer the readonly modifier where we can — surfaces unintended
      // mutation, but doesn't fail on legitimate writes.
      '@typescript-eslint/prefer-readonly': 'off',

      // Allow `_`-prefixed unused params (standard escape hatch).
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 6. Test files: relax a few rules that don't apply to test code.
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 7. The JS smoke test is plain CJS — not type-checked.
  {
    files: ['test/**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // 8. Ignore built output + node_modules + the eslint config itself.
  {
    ignores: ['dist/', 'node_modules/', 'eslint.config.js'],
  },
);
