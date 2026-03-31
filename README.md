# Relay Protocol

A cross-chain liquidity protocol that enables fast bridging of assets across multiple blockchain networks. This monorepo includes smart contracts, backend indexer, claimer service, and shared packages.

Created by the Unlock Labs team, creators of the [Unlock Protocol](https://unlock-protocol.com/) for the Reservoir team, creators of [Relay.link](https://relay.link/).

## Repository Structure

```
relay-vaults/
├── smart-contracts/     # Solidity contracts (ERC4626 vaults, bridges, proxies)
├── backend/             # Ponder blockchain indexer and GraphQL API
├── claimer/             # Off-chain service for processing bridge claims
├── packages/
│   ├── abis/            # Contract ABIs (@relay-vaults/abis)
│   ├── addresses/       # Deployed contract addresses (@relay-vaults/addresses)
│   ├── networks/        # Network configurations (@relay-vaults/networks)
│   ├── client/          # TypeScript client library (@relay-vaults/client)
│   ├── helpers/         # Utility functions (@relay-vaults/helpers)
│   ├── types/           # Shared TypeScript types (@relay-vaults/types)
│   ├── tsconfig/        # Shared TypeScript config
│   └── eslint-config/   # Shared ESLint config
└── docs/                # Audit reports
```

Each component has its own detailed README:
- [Smart Contracts](./smart-contracts/README.md) - Deployment guide, tasks, and contract details
- [Backend](./backend/README.md) - Indexer setup and API documentation
- [Claimer](./claimer/README.md) - Claim processing service

## Supported Networks

- **Pool Network (L1)**: Ethereum
- **Origin Networks (L2s)**: Arbitrum, Optimism, Base, Blast, ZkSync Era

## Prerequisites

- Node.js 22+
- Yarn 4.9.2+ (via Corepack)
- Docker (for backend/claimer deployment)
- PostgreSQL (for backend)

## Quick Start

```bash
# Enable Corepack for Yarn
corepack enable

# Install dependencies
yarn install

# Build all packages
yarn build

# Run tests
yarn test

# Run linting
yarn lint
```

## Development

```bash
# Build shared packages only
yarn packages:build

# Backend development (requires DATABASE_URL)
yarn backend:dev

# Claimer development
yarn claimer:dev
```

## Depositing and Withdrawing from the Pool

As an LP, you can deposit in the pool using the UI at [https://relay.link/vaults](https://relay.link/vaults). You can also do it programmatically using the ERC4626 functions of the Vault contract (you will need to wrap ETH and/or use the Gateway contract to deposit ETH) since the Vault itself only supports ERC20 currencies.

We also provide hardhat tasks in the `smart-contracts` folder:
```bash
yarn run hardhat pool:deposit
yarn run hardhat pool:withdraw
```

## Using the Bridge

The Bridge is meant to be used by solvers and does not have a UI at this point. On each supported L2, there is a "Relay Bridge" contract. The contract is specific by asset and it is possible to query the contract to get the asset's address (`ASSET()`). When using the native asset, it uses the zero address: `0x0000000000000000000000000000000000000000`.

This contract has a `bridge` method which needs to be called with the following parameters:

- `amount (uint256)`: amount of tokens to transfer
- `recipient (address)`: address that will receive the tokens on the L1
- `l1Asset (address)`: address of the corresponding asset on the L1 (use the zero address for native tokens)

Prior to calling this, your code needs to compute the Hyperlane fee that needs to be passed as `value`. For this you can call `getFee` with the `amount` (uint256) and `recipient` (address) values.

Additionally, if the asset is an ERC20, you need to use the ERC20 contract's `approve` method to allow the `RelayBridge` contract to spend some of your tokens (allowance needs to be _at least_ the `amount`). If using the native asset you need to add the `amount` and the `fee` returned by `getFee`.

### NPM Packages

Contract ABIs and addresses are available as npm packages:
- `@relay-vaults/abis` - Contract ABIs
- `@relay-vaults/addresses` - Deployed contract addresses
- `@relay-vaults/networks` - Network configurations
- `@relay-vaults/client` - TypeScript client library

## Testing

```bash
# Run all tests
yarn test

# Smart contract tests (see smart-contracts/README.md for more options)
cd smart-contracts
yarn test:hardhat      # Local Hardhat network
yarn test:ethereum     # Ethereum mainnet fork
yarn test:optimism     # Optimism mainnet fork
yarn test:base         # Base mainnet fork
yarn test:zksync       # ZkSync Era fork
```

## Docker Deployment

The repository includes a Dockerfile for deploying the backend and claimer services:

```bash
# Build the image
docker build -t relay-vaults .

# Run backend
docker run -e DATABASE_URL=<postgres-url> relay-vaults backend start

# Run claimer
docker run relay-vaults claimer start
```

See the [backend](./backend/README.md) and [claimer](./claimer/README.md) READMEs for detailed deployment instructions.

## Security

The protocol has been audited by Spearbit (via Cantina). Audit reports are available in the [docs](./docs/) folder.

## License

MIT
