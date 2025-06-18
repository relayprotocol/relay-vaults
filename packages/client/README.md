# `@relay-vaults/client`

TypeScript client for the Relay Protocol API with type-safe queries and responses.

## Installation

```bash
yarn add @relay-vaults/client
```

## Features

- Type-safe API client with automatic types generation
- High-level methods for common operations
- Support for custom queries

## Usage

### Basic Usage

```typescript
import { RelayVaultService } from '@relay-vaults/client'

const vaultService = new RelayVaultService('https://api.example.com/graphql')

// Use the high-level methods
const pools = await vaultService.getAllPools()
const poolDetails = await vaultService.getRelayPool('0x123...', 1)
const userBalances = await vaultService.getUserBalances('0xabc...')
```

### SDK Access

```typescript
import { RelayClient } from '@relay-vaults/client'

const client = new RelayClient('https://api.example.com/graphql')

// Use the SDK methods
const { data } = await client.sdk.GetAllPools({
  limit: 20,
  targetTimestamp: Math.floor(Date.now() / 1000).toString(),
  orderDirection: 'desc',
})
```

### Custom Queries

```typescript
import { RelayVaultService, gql } from '@relay-vaults/client'

const vaultService = new RelayVaultService('https://api.example.com/graphql')

interface CustomResponse {
  relayPools: {
    items: Array<{
      contractAddress: string
      totalApproved: string
    }>
  }
}

const result = await vaultService.query<CustomResponse>(gql`
  query CustomPoolQuery {
    relayPools(limit: 5) {
      items {
        contractAddress
        totalApproved
      }
    }
  }
`)
```

## Development

```bash
# Install dependencies
yarn install

# Update schema and regenerate types
yarn update-schema

# Build package
yarn build
```
