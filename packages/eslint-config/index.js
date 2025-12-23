const globals = require('globals')
const prettierConfig = require('eslint-config-prettier')
const eslint = require('@eslint/js')
const prettierPlugin = require('eslint-plugin-prettier')
const mochaPlugin = require('eslint-plugin-mocha')
const typescriptEslint = require('typescript-eslint')
const evmAddressPlugin = require('eslint-plugin-evm-address-to-checksummed')
const jsonPlugin = require('eslint-plugin-json')
const jsonc = require("eslint-plugin-jsonc");
const sortKeysFix = require('eslint-plugin-sort-keys-fix')
const jsonParser = require("jsonc-eslint-parser");


/**
 * @type {ESLintConfig}
 */
module.exports = [
  eslint.configs.recommended,
  prettierConfig,
  ...typescriptEslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptEslint.parser,
      parserOptions: {
        // project: true,
      },
      globals: {
        ...globals.es2020,
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
        ...globals.mocha,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      prettier: prettierPlugin,
      mocha: mochaPlugin,
      'evm-address-to-checksummed': evmAddressPlugin,
      json: jsonPlugin,
      'sort-keys-fix': sortKeysFix,
    },
    rules: {
      'prettier/prettier': 'error',
      'linebreak-style': ['error', 'unix'],
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: false },
      ],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'brace-style': 'off',
      'no-constant-condition': 'off',
      'no-promise-executor-return': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'evm-address-to-checksummed/evm-address-to-checksummed': 'error',
      '@typescript-eslint/no-require-imports': 'warn',
      'sort-keys-fix/sort-keys-fix': 'error',
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    files: ["**/*.json"],
    languageOptions: {
      parser: jsonParser,
    },
    plugins: { jsonc },
    rules: {
      ...jsonc.configs["recommended-with-json"].rules,
      "jsonc/no-comments": "off",
    },
  },
  {
    ignores: [
      'node_modules',
      'build',
      'coverage',
      'dist',
      'out',
      'src/@generated/',
      'eslint.config.js',
      'artifacts',
      'dist',
      'cache',
      'typechain-types',
    ],
  },
  {
    files: ["**/package.json"],
    languageOptions: { parser: jsonParser },
    plugins: {
      "unevenlabs-policy": {
        rules: {
          "pinned-deps": require("./rules/pinned-deps.cjs"),
        },
      },
    },
    rules: {
      "unevenlabs-policy/pinned-deps": ["error", {
        internalScopes: ["@relay-vaults/"],
        allowProtocols: ["workspace:", "^workspace:"],
        allowProtocolsOnlyForInternal: true,
        allowExactPrerelease: true,
      }],
    },
  },
]
