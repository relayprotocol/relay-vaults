import { createConfig, factory } from 'ponder'
import { Portal2, Outbox } from '@relay-protocol/helpers/abis'
import { http } from 'viem'

import {
  RelayPool,
  RelayBridge,
  RelayPoolFactory,
  RelayBridgeFactory,
} from '@relay-protocol/abis'
import { Abi, AbiEvent } from 'viem'
import { getAddresses } from '@relay-protocol/addresses'
import networks from '@relay-protocol/networks'

const deployedAddresses = getAddresses()

const earliestBlocks = {
  'arbitrum-sepolia': 115000000,
  'base-sepolia': 21000000,
  ethereum: 22000000,
  'op-sepolia': 22000000,
  sepolia: 7500000,
}

const usedNetworks = Object.keys(networks).reduce((usedNetworks, chainId) => {
  return {
    ...usedNetworks,
    [networks[chainId].slug]: {
      chainId,
      transport: http(networks[chainId].rpc[0]),
    },
  }
}, {})

// RelayPoolFactory

export default createConfig({
  blocks: {
    VaultSnapshot: {
      interval: 25,
      network: {
        ethereum: {
          startBlock: earliestBlocks.ethereum,
        },
        sepolia: {
          startBlock: earliestBlocks.sepolia,
        },
      },
    },
  },
  contracts: {
    // Third-party contracts
    OPPortal: {
      abi: Portal2,
      network: {
        sepolia: {
          address: [
            networks['11155111']!.bridges!.op!.portalProxy! as `0x${string}`,
            networks['11155111']!.bridges!.base!.portalProxy! as `0x${string}`,
          ],
          startBlock: earliestBlocks.sepolia,
        },
      },
    },

    OrbitOutbox: {
      abi: Outbox,
      network: {
        sepolia: {
          address: networks['11155111']!.bridges!.arb!.outbox! as `0x${string}`,
          startBlock: earliestBlocks.sepolia,
        },
      },
    },

    RelayBridge: {
      abi: RelayBridge as Abi,
      network: {
        'arbitrum-sepolia': {
          address: factory({
            address: deployedAddresses['421614'].RelayBridgeFactory,
            event: RelayBridgeFactory.find(
              (e) => e.name === 'BridgeDeployed'
            ) as AbiEvent,
            parameter: 'bridge',
          }),
          startBlock: earliestBlocks['arbitrum-sepolia'],
        },
        'base-sepolia': {
          address: factory({
            address: deployedAddresses['84532'].RelayBridgeFactory,
            event: RelayBridgeFactory.find(
              (e) => e.name === 'BridgeDeployed'
            ) as AbiEvent,
            parameter: 'bridge',
          }),
          startBlock: earliestBlocks['base-sepolia'],
        },
        'op-sepolia': {
          address: factory({
            address: deployedAddresses['11155420'].RelayBridgeFactory,
            event: RelayBridgeFactory.find(
              (e) => e.name === 'BridgeDeployed'
            ) as AbiEvent,
            parameter: 'bridge',
          }),
          startBlock: earliestBlocks['op-sepolia'],
        },
      },
    },

    RelayBridgeFactory: {
      abi: RelayBridgeFactory as Abi,
      network: {
        'arbitrum-sepolia': {
          address: deployedAddresses['421614'].RelayBridgeFactory,
          startBlock: earliestBlocks['arbitrum-sepolia'],
        },
        'base-sepolia': {
          address: deployedAddresses['84532'].RelayBridgeFactory,
          startBlock: earliestBlocks['base-sepolia'],
        },
        'op-sepolia': {
          address: deployedAddresses['11155420'].RelayBridgeFactory,
          startBlock: earliestBlocks['op-sepolia'],
        },
      },
    },

    RelayPool: {
      abi: RelayPool as Abi,
      network: {
        ethereum: {
          address: factory({
            address: deployedAddresses['1'].RelayPoolFactory!,
            event: RelayPoolFactory.find(
              (e) => e.name === 'PoolDeployed'
            ) as AbiEvent,
            parameter: 'pool',
          }),
          startBlock: earliestBlocks.ethereum,
        },
        sepolia: {
          address: factory({
            address: deployedAddresses['11155111'].RelayPoolFactory!,
            event: RelayPoolFactory.find(
              (e) => e.name === 'PoolDeployed'
            ) as AbiEvent,
            parameter: 'pool',
          }),
          startBlock: earliestBlocks.sepolia,
        },
      },
    },

    RelayPoolFactory: {
      abi: RelayPoolFactory as Abi,
      network: {
        ethereum: {
          address: deployedAddresses['1'].RelayPoolFactory,
          startBlock: earliestBlocks.ethereum,
        },
        sepolia: {
          address: deployedAddresses['11155111'].RelayPoolFactory,
          startBlock: earliestBlocks.sepolia,
        },
      },
    },
  },
  database: {
    connectionString: process.env.DATABASE_URL,
    kind: 'postgres',
  },
  networks: usedNetworks,
})
