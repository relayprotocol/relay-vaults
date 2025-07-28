const sharedConfig = require('@relay-vaults/eslint-config')
const sortKeysFix = require('eslint-plugin-sort-keys-fix')
module.exports = [
  ...sharedConfig,
  {
    plugins: {
      'sort-keys-fix': sortKeysFix,
    },
    rules: {
      'sort-keys-fix/sort-keys-fix': 'error',
    },
  },
  {
    files: ['src/abis/**/*.json'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message: 'JSON files are not allowed in the abis directory. Please use TypeScript (.ts) files instead. Convert JSON to TS format: export const YourAbiName = [...] as const;'
        }
      ]
    }
  }
]
