# Relay Protocol

## Contracts used for Relay Vaults & Bridges:

### RelayPool

- RelayPool let Liquidity Providers (LP) deposit and withdraw a specific asset and receive yield for their deposit. The RelayPool contracts do _not_ hold the liquidity themselves and just "forward" the funds to a "base yield" contract (Aave, Morpho... etc). They also implement a `handle` function and a `claim` function which are respectively used to "loan" funds to another user who has initiated a "fast" withdrawal from an L2 contract, as well as claim the funds once they have effectively crossed the bridge.
- RelayPool aimed at being deployed on L1 (ethereum mainnet) for a specific asset (wrapped ETH, or other ERC20s) and can handle funds coming from multiple sources, as long as it is the same asset. Each origin has its own `BridgeProxy` contract that implements the specific claim for a given L2/Bridge.
- The `handle` function is called by Hyperlane to indicate that a user has initiated an L2->L1 withdrawal and that the user can receive funds (minus fees), since the RelayPool has insurance that the funds will eventually be transfered.
- RelayPools are deployed thru a `RelayPoolFactory` for convenience. When a pool uses wrapped ETH, we offer a `RelayPoolNativeGateway` which lets users deposit ETH directly without the need to wrap.
- RelayPools have a curator which is an address that can perform configuration changes (adding new origins, updating the bridge fee, or even chamging the "base yield" contract). It is possible for an attacker to steal funds from LP, which is why it is critical that this address points to a timelock contract (LPs could withdraw their funds before a malicious transaction is submitted). This timelock should itself receive its operations from a multi-sig, or even a governor contract that uses the RelayVault shares to let LP collectively govern the pool if needed.

### RelayBridge

RelayBridge contracts let solvers (or other users) initiate a withdrwal from an L2 to the L1. They are asset-specific. They also call a L2/Bridge specific `BridgeProxy` in order to initiate the withdrwal. When called, the issue both an Hyperlane message and a bridge withdrwal.

### ProxyBridge contracts

The actual bridging logic is abstracted away and implemented in various ProxyBridge contracts for the OPStack, Arbitrum Orbit and others. It is in theory possible to create these bridges for any bridge (native or not).

## Deployment Guide

This guide outlines the step-by-step process to deploy the entire Relay Protocol across both L1 (Ethereum mainnet) and L2 networks (Arbitrum, ZKSync, or Optimism compatible chains).

### Prerequisites

For all deployments you need a private key:

```
# export your private key to the shell
export DEPLOYER_PRIVATE_KEY=...
```

Make sure you have the network details added in the `../packages/network` package and run `yarn build` before deployment.

### Deployment Sequence

#### 1. Deploy L1 PoolFactory

First, deploy the RelayPoolFactory on the L1 network (e.g., Ethereum mainnet or testnet):

```bash
yarn run hardhat deploy:pool-factory --network <l1-network>
```

This will deploy the RelayPoolFactory contract and a timelock template, which will be used for creating pools.

#### 2. Create an L1 Pool using the Factory

Next, create a pool for a specific ERC20 token:

```bash
yarn run hardhat deploy:pool --network <l1-network>
```

The CLI will prompt you for:

- Asset selection (e.g., WETH)
- Yield pool selection (Aave or dummy yield pool)
- Pool name and symbol
- Timelock delay
- Initial deposit amount

For local/test deployments, you can use a dummy yield pool which will be automatically deployed if selected.

#### 3. Deploy L1 BridgeProxy

Deploy the bridge proxy on L1 for each L2 network you want to support:

```bash
yarn run hardhat deploy:bridge-proxy --network <l1-network> --type <bridge-type> --poolAddress <relay-pool-address>
```

Where `<bridge-type>` can be:

- `arb` for Arbitrum
- `op` for Optimism
- `zksync` for ZKSync
- `cctp` for Circle's Cross-Chain Transfer Protocol

If you don't specify the pool address, the CLI will prompt you to select from available pools.

#### 4. Deploy L2 BridgeProxy

For each L2 network, deploy the corresponding bridge proxy:

```bash
yarn run hardhat deploy:bridge-proxy --network <l2-network> --type <bridge-type>
```

The L2 bridge proxy will be configured to communicate with the L1 bridge proxy deployed in the previous step.

#### 5. Deploy L2 BridgeFactory

Deploy the RelayBridgeFactory on each L2 network:

```bash
yarn run hardhat deploy:bridge-factory --network <l2-network>
```

This factory will be used to create bridges for specific tokens on the L2.

#### 6. Deploy L2 Bridges

For each token you want to support on the L2, deploy a bridge:

```bash
yarn run hardhat deploy:bridge --network <l2-network> --proxyBridge <proxy-bridge-address> --asset <token-address>
```

If the asset is the native token of the L2 (e.g., ETH), use `--asset 0x0000000000000000000000000000000000000000`.

If you don't specify the proxy bridge address or asset, the CLI will prompt you to select from available options.

#### 7. Add Origin to L1 Pool

Finally, connect the L2 bridge to the L1 pool by adding it as an origin:

```bash
yarn run hardhat pool:add-origin --network <l1-network> --l2ChainId <l2-chain-id> --pool <pool-address> --proxyBridge <l1-proxy-bridge> --bridge <l2-bridge-address>
```

You'll be prompted to configure:

- Maximum debt for this origin
- Bridge fee (in basis points)
- Curator address for this origin (should be a multisig or timelock)
- Cool-down period (minimum delay between bridge initiation and transfer)

### Example Deployment Flow

Here's an example deployment flow for Ethereum mainnet (L1) and Arbitrum (L2) with WETH:

```bash
# 1. Deploy L1 PoolFactory on Ethereum
yarn run hardhat deploy:pool-factory --network mainnet
# add deployed factory  address to addresses package
# then rebuild with `yarn workspace @relay-protocol/addresses build`

# 2. Create L1 Pool for WETH
yarn run hardhat deploy:pool --network mainnet
# Select WETH as asset and Aave as yield pool

# 3. Deploy L1 BridgeProxy for Arbitrum
yarn run hardhat deploy:bridge-proxy --network mainnet --type arb --pool-address <pool-address>
# add deployed bridge address to addresses package
# then rebuild with `yarn workspace @relay-protocol/addresses build`

# 4. Deploy L2 BridgeProxy on Arbitrum
yarn run hardhat deploy:bridge-proxy --network arbitrum --type arb --pool-address <pool-address>

# 5. Deploy L2 BridgeFactory on Arbitrum
yarn run hardhat deploy:bridge-factory --network arbitrum
# add deployed factory  address to addresses package
# then rebuild with `yarn workspace @relay-protocol/addresses build`

# 6. Deploy L2 Bridge for ETH on Arbitrum
yarn run hardhat deploy:bridge --network arbitrum --proxy-bridge <l2-proxy-bridge-address> --asset 0x0000000000000000000000000000000000000000

# 7. Add Arbitrum relay bridge origin to L1 Pool
yarn run hardhat pool:add-origin --network mainnet --pool <pool-address> --bridge <l2-relay-bridge-address>
```

### Verifying Deployments

All deployment tasks include contract verification. If you need to verify contracts manually, you can use:

```bash
yarn run hardhat ignition verify <name of deployment from ignition/deployments/>
```

### Notes for ZKSync Deployments

For ZKSync deployments, you need to compile contracts specifically for ZKSync:

```bash
yarn hardhat compile --network zksync
```

The deployment process will automatically use the appropriate deployment method for ZKSync.
