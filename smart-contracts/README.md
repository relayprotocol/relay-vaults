# Relay Protocol

## Contracts used for Relay Vaults & Bridges:

### RelayPool

- RelayPools let Liquidity Providers (LP) deposit and withdraw a specific asset and receive yield for their deposit. The RelayPool contracts do _not_ hold the liquidity themselves and just "forward" the funds to a "base yield" contract (Aave, Morpho... etc). They also implement a `handle` function and a `claim` function which are respectively used to "loan" funds to a user who has initiated a "fast" withdrawal from an origin contract, and to claim the funds once they have effectively crossed the bridge.
- RelayPool aimed at being deployed on specific chains for a specific asset (wrapped ETH, or other ERC20 like USDC) and can handle funds coming from multiple origins, as long as it is the same asset. Each origin has its own `BridgeProxy` contract that implements the specific claiming logic for a bridge.
- The `handle` function is called by Hyperlane to indicate that a user has initiated a withdrawal and that the user can receive funds (minus fees), since the RelayPool has insurance that the funds will eventually be transfered.
- RelayPools are deployed thru a `RelayPoolFactory` for convenience. When a pool uses wrapped ETH, we offer a `RelayPoolNativeGateway` which lets users deposit ETH directly without the need to wrap.
- RelayPools have a curator which is an address that can perform configuration changes (adding new origins, updating the bridge fee, or even changing the base yield contract). It is possible for an attacker to steal funds from LP, which is why it is critical that this address points to a timelock contract (LPs could withdraw their funds before a malicious transaction is submitted). This timelock should itself receive its operations from a multi-sig, or even a governor contract that uses the RelayVault shares to let LP collectively govern the pool if needed.

### RelayBridge

RelayBridge contracts let solvers (or other users) initiate a withdrawal from an origin to a vault. They are asset-specific. They also call a bridge specific `BridgeProxy` in order to initiate the withdrawal. When called, they issue both an Hyperlane message and a bridge withdrawal.

### ProxyBridge contracts

The actual bridging logic is abstracted away and implemented in various ProxyBridge contracts for the OPStack, Arbitrum Orbit and others. It is in theory possible to create these bridges for any bridge (native or not).

## Deployment Guide

This guide outlines the step-by-step process to deploy the entire Relay Protocol, including Vaults and origins (Arbitrum, ZKSync, or Optimism compatible chains). You can list all supported networks with `yarn run hardhat networks:list`.

### Prerequisites

For all deployments you need a private key:

```
# export your private key to the shell
export DEPLOYER_PRIVATE_KEY=...
```

Make sure you have the network details added in the `../packages/network` package and run `yarn build` before deployment.

### Deployment Sequence

#### 1. Deploy L1 PoolFactory

First, deploy the RelayPoolFactory on the pool network (e.g., Ethereum mainnet or testnet):

```bash
yarn run hardhat deploy:pool-factory --network <pool-network>
```

This will deploy the RelayPoolFactory contract and a timelock template, which will be used for creating pools.

#### 2. Create an Pool using the Factory

Next, deploy a pool for a specific network, using the factory contract from above:

```bash
yarn run hardhat deploy:pool --network <pool-network> --factory <factory-address>
```

The CLI will prompt you for:

- Asset selection (e.g. WETH)
- Yield pool selection (Aave or dummy yield pool)
- Pool name and symbol
- Timelock delay
- Initial deposit amount

For local/test deployments, you can use a dummy yield pool which will be automatically deployed if selected.

#### 3. Deploy a BridgeProxy pair

The bridge proxies contract function in pairs: one on the pool's chain and one on the origin chain.

You first need to deploy one on the pool chain, as the one on the origin will point to the one one of the pool chain.

```bash
yarn run hardhat deploy:bridge-proxy --network <pool-network>
```

Once you have deployed the pool chain Bridge Proxy, you need to deploy its counterpart on the origin network.

```bash
yarn run hardhat deploy:bridge-proxy --network <origin-network>
```

#### 4. Deploy the origin BridgeFactory

Deploy the RelayBridgeFactory on each L2 network:

```bash
yarn run hardhat deploy:bridge-factory --network <origin-network>
```

This factory will be used to create bridges for specific tokens on the origin.

#### 5. Deploy Origin Bridges

For each token you want to support on the origin, deploy a bridge:

```bash
yarn run hardhat deploy:bridge --network <origin-network>
```

#### 7. Add Origin to the Pool

Finally, connect the origin bridge to the pool by adding it as an origin:

```bash
yarn run hardhat pool:add-origin --network <pool-network>
```

You'll be prompted to configure:

- Maximum debt for this origin
- Bridge fee (in fractional basis points, where 1 = 0.0000001 bps, denominator = 100000000000)
- Curator address for this origin (should be a multisig or timelock)
- Cool-down period (minimum delay between bridge initiation and transfer)

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

## Usage guide

We provide several hardhat tasks to facilitate deployment (see above), but also usage of the pool and bridges. You can list all available tasks with `yarn run hardhat` and list all supported networks with `yarn run hardhat networks:list`.

### Adding liquidity

You can add liquidity through the [UI directly](https://relay.link/vaults) or by using the cli `yarn run hardhat pool:deposit --network <name>`. Similarly it is possible to withdraw with `yarn run hardhat pool:withdraw --network <name>`.

### Curator actions

Each pool contract has an owner who has special rights on the pool contracts. This owner is meant to be a Timelock contract in order to leave time (7 days at least) for each liquidity provider to pull their funds if they disagree with an upcoming change on a pool. Some of these actions include the `pool:update-yield-pool`, `pool:remove-origin`, `pool:collect-morpho` to collect the morpho rewards if applicable... etc.

### Bridging

The cli offers the ability to easily bridge tokens using `yarn run hardhat bridge:send --network <name>`. If you are planning to trigger bridges on your end, you should look at what [the script does](https://github.com/relayprotocol/relay-vaults/blob/main/smart-contracts/tasks/bridge.ts#L9): importantly, before bridging you should check that the pool contract has enough liquidity, and you should query the bridge contract to get the Hyperlane fee (this is all handled by the script).

If for any reason the Hyperlane message takes too much time to be processed or it needs to be triggered manually after failures, you can use [their cli](https://docs.hyperlane.xyz/docs/reference/cli): `hyperlane status --id <hyperlane message id> --relay`. You can get the `hyperlane message id` by looking at the event triggered on the bridging transaction.
NB: [Hyperlane performs retries](https://docs.hyperlane.xyz/docs/protocol/agents/relayer#retry-strategy) but they may take a while.
