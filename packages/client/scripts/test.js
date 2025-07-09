// This is what would cause the error in a real CommonJS environment
const { RelayClient } = require('../dist/index.js')

console.log('Successfully required RelayClient:', typeof RelayClient)

// Try to instantiate the client
const client = new RelayClient('http://localhost:42069/graphql')
console.log('Successfully created client instance')
