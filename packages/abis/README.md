# Relay Pool ABIs

Contains all ABIs for Relay Pool contracts.

## Usage

```js
import { RelayPool } from '@relay-vaults/abis'

// import all the ABIs
import * as RelayProtocolAbis from '@relay-vaults/abis'
```

## How to upgrade

To upgrade with the latest version from smart-contracts folder, use `yarn upgrade`

## Archive a specific contract

To archive a version of the abis, use the following:

```
# upgrade all abis with latest code
yarn upgrade

# archive the one you want
yarn snapshot src/abis/RelayPool.sol/RelayPool.json
```

## Publish

## Track contract updates

To archive a version of the abis, use the following:

```
yarn snapshot src/abis/RelayPool.sol/RelayPool.json
```

## Publish

Make sure you update the version in `package.json` and then publish:

```
npm login
npm publish --access public
```
