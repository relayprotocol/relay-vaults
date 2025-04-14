import { createConfig, factory } from 'ponder'
import { ABIs } from '@relay-protocol/helpers'
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
import { L1NetworkConfig, L2NetworkConfig } from '@relay-protocol/types'

const deployedAddresses = getAddresses()

// RPC configurations
const usedNetworks = Object.keys(networks).reduce((usedNetworks, chainId) => {
  return {
    ...usedNetworks,
    [networks[chainId].slug]: {
      chainId,
      transport: http(networks[chainId].rpc[0]),
    },
  }
}, {})

// VaultSnapshot networks
const vaultSnapshotNetworks = Object.keys(networks)
  .filter((chainId) => {
    return !(networks[chainId] as L2NetworkConfig).baseChainId
  })
  .reduce((vaultSnapshotNetworks, chainId) => {
    const network = networks[chainId]
    return {
      ...vaultSnapshotNetworks,
      [network.slug]: {
        startBlock: network.earliestBlock,
      },
    }
  }, {})

// RelayBridge networks
const relayBridgeNetworks = Object.keys(networks)
  .filter((chainId) => {
    return (networks[chainId] as L2NetworkConfig).baseChainId
  })
  .reduce((relayBridgeNetworks, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]
    if (!addresses?.RelayBridgeFactory) {
      return relayBridgeNetworks
    }
    return {
      [network.slug]: {
        address: factory({
          address: addresses.RelayBridgeFactory,
          event: RelayBridgeFactory.find(
            (e) => e.name === 'BridgeDeployed'
          ) as AbiEvent,
          parameter: 'bridge',
        }),
        startBlock: network.earliestBlock,
      },
      ...relayBridgeNetworks,
    }
  }, {})

// RelayBridgeFactory networks
const relayBridgeFactoryNetworks = Object.keys(networks)
  .filter((chainId) => {
    return (networks[chainId] as L2NetworkConfig).baseChainId
  })
  .reduce((relayBridgeFactoryNetworks, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]

    if (!addresses?.RelayBridgeFactory) {
      return relayBridgeFactoryNetworks
    }
    return {
      [network.slug]: {
        address: addresses.RelayBridgeFactory,
        startBlock: network.earliestBlock,
      },
      ...relayBridgeFactoryNetworks,
    }
  }, {})

// RelayPoolFactory networks
const relayPoolFactoryNetworks = Object.keys(networks)
  .filter((chainId) => {
    return !(networks[chainId] as L2NetworkConfig).baseChainId
  })
  .reduce((relayPoolFactoryNetworks, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]

    if (!addresses?.RelayPoolFactory) {
      return relayPoolFactoryNetworks
    }

    return {
      ...relayPoolFactoryNetworks,
      [network.slug]: {
        address: addresses.RelayPoolFactory,
        startBlock: network.earliestBlock,
      },
    }
  }, {})

const relayPoolNetworks = Object.keys(networks)
  .filter((chainId) => {
    return !(networks[chainId] as L2NetworkConfig).baseChainId
  })
  .reduce((relayPoolNetworks, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]
    if (!addresses?.RelayPoolFactory) {
      return relayPoolNetworks
    }
    return {
      ...relayPoolNetworks,
      [network.slug]: {
        address: factory({
          address: addresses.RelayPoolFactory,
          event: RelayPoolFactory.find(
            (e) => e.name === 'PoolDeployed'
          ) as AbiEvent,
          parameter: 'pool',
        }),
        startBlock: network.earliestBlock,
      },
    }
  }, {})

interface OPPortalNetworks {
  [key: string]: {
    address: string[]
    startBlock: number
  }
}

const oPPortalNetworks: OPPortalNetworks = Object.keys(networks)
  .filter((chainId) => {
    // Get the chains that have an optimism bridge to the l1
    return (networks[chainId] as L2NetworkConfig).bridges?.optimism?.l1
      .portalProxy
  })
  .reduce((oPPortalNetworks, chainId) => {
    const l2Network = networks[chainId] as L2NetworkConfig
    const l1Network = networks[l2Network.baseChainId] as L1NetworkConfig
    if (!oPPortalNetworks[l1Network.slug]) {
      oPPortalNetworks[l1Network.slug] = {
        address: [],
        startBlock: l1Network.earliestBlock,
      }
    }
    oPPortalNetworks[l1Network.slug].address.push(
      l2Network.bridges.optimism!.l1.portalProxy
    )
    return oPPortalNetworks
  }, {} as OPPortalNetworks)

interface OrbitOutboxNetworks {
  [key: string]: {
    address: string[]
    startBlock: number
  }
}

const orbitOutboxNetworks: OrbitOutboxNetworks = Object.keys(networks)
  .filter((chainId) => {
    // on the L1 chain
    return (networks[chainId] as L2NetworkConfig).bridges?.arbitrum?.l1.outbox
  })
  .reduce((orbitOutboxNetworks, chainId) => {
    const l2Network = networks[chainId] as L2NetworkConfig
    const l1Network = networks[l2Network.baseChainId] as L1NetworkConfig
    if (!orbitOutboxNetworks[l1Network.slug]) {
      orbitOutboxNetworks[l1Network.slug] = {
        address: [],
        startBlock: l1Network.earliestBlock,
      }
    }
    orbitOutboxNetworks[l1Network.slug].address.push(
      l2Network.bridges.arbitrum!.l1.outbox
    )
    return orbitOutboxNetworks
  }, {} as OrbitOutboxNetworks)

export default createConfig({
  blocks: {
    VaultSnapshot: {
      interval: 25,
      network: vaultSnapshotNetworks,
    },
  },
  contracts: {
    OPPortal: {
      abi: ABIs.Portal2,
      network: oPPortalNetworks,
    },

    OrbitOutbox: {
      abi: ABIs.Outbox,
      network: orbitOutboxNetworks,
    },

    RelayBridge: {
      abi: RelayBridge as Abi,
      network: relayBridgeNetworks,
    },

    RelayBridgeFactory: {
      abi: RelayBridgeFactory as Abi,
      network: relayBridgeFactoryNetworks,
    },

    RelayPool: {
      abi: RelayPool as Abi,
      network: relayPoolNetworks,
    },

    RelayPoolFactory: {
      abi: RelayPoolFactory as Abi,
      network: relayPoolFactoryNetworks,
    },
  },
  database: {
    connectionString: process.env.DATABASE_URL,
    kind: 'postgres',
  },
  networks: usedNetworks,
})
