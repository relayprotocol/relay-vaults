# Relay Protocol

This repo includes the [smart contracts](./smart-contracts) and [backend](./backend) which should both include detailed README on their own.
It also includes various [packages](./packages) with shared code and libraries.

This was created by the Unlock Labs team, creators of the [Unlock Protocol](https://unlock-protocol.com/) for the Reservoir team, creators of [Relay.link](https://relay.link/).

# Depositing and withdrawing from the pool

As an LP, you can deposit in the pool using the UI at [https://relay.link/vaults](https://relay.link/vaults). You can also do it programmatically using the ERC4626 functions of the Vault contract (you will need to wrap ETH and/or use the Gateway contract to deposit ETH) since the Vault itself only supports ERC20 currencies.
We also provide a few hardhat tasks in the `smart-contracts` folder such as `yarn run hardhat pool:deposit`.

# Using the bridge

The Bridge is meant to be used by solvers and does not have a UI at this point.
On each supported L2, there is a "Relay Bridge" contract. The contract is specific by asset and it is possible to query the contract to get the asset's address (`ASSET()`). When using the native asset, it uses the zero address: `0x0000000000000000000000000000000000000000`.

This contract has a `bridge` method which needs to be called with the following parameters:

- `amount (uint256)`: amount of tokens to transfer
- `recipient (address)`: address that will receive the tokens on the L1
- `l1Asset (address)`: address of the corresponding asset on the L1 (use the zero address for native tokens).

Prior to calling this, your code needs to compute the hyperlane fee that needs to be passed as `value`. For this you can call `getFee` with the `amount` (uint256) and `recipient` (address) values.
Additionally, if the asset is an ERC20, you need to use the ERC20 contract's `approve` method to allow the `RelayBridge` contract to spend some of your tokens (allowance needs to be _at least_ the `amount`). If using the native asset you need to add the `amount` and the `fee` returned by `getFee`.

You can find the ABI for the `Relay Bridge` contract in the `@relay-protocol/abis` npm package, and the addresses in `@relay-protocol/addresses`.
