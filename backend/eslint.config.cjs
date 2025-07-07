const sharedConfig = require('@relay-vaults/eslint-config')

module.exports = [
  ...sharedConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      'no-console': 'error',
    },
  },
]
