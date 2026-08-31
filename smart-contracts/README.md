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

For all deployments you need a private key and block explorer API keys for contract verification:

```bash
# export your private key and required explorer API keys to the shell
export DEPLOYER_PRIVATE_KEY=...
export EXPLORER_API_KEY_ARBITRUM_SEPOLIA=...
export EXPLORER_API_KEY_POLYGON_ZK_EVM=...
