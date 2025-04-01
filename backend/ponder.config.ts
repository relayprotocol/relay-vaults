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
import { L2NetworkConfig } from '@relay-protocol/types'

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
    return !(networks[chainId] as L2NetworkConfig).l1ChainId
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
    return (networks[chainId] as L2NetworkConfig).l1ChainId
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
    return (networks[chainId] as L2NetworkConfig).l1ChainId
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
    return !(networks[chainId] as L2NetworkConfig).l1ChainId
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
    return !(networks[chainId] as L2NetworkConfig).l1ChainId
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

const oPPortalNetworks = Object.keys(networks)
  .filter((chainId) => {
    // on the L1 chain
    return !(networks[chainId] as L2NetworkConfig).l1ChainId
  })
  .reduce((oPPortalNetworks, chainId) => {
    const network = networks[chainId]
    // Addresses of all the portalProxy?
    const addresses = Object.values(network.bridges)
      .map((bridge) => {
        return bridge.portalProxy
      })
      .filter((address) => !!address)

    return {
      ...oPPortalNetworks,
      [network.slug]: {
        address: addresses, //
        startBlock: network.earliestBlock,
      },
    }
  }, {})

const orbitOutboxNetworks = Object.keys(networks)
  .filter((chainId) => {
    // on the L1 chain
    return !(networks[chainId] as L2NetworkConfig).l1ChainId
  })
  .reduce((orbitOutboxNetworks, chainId) => {
    const network = networks[chainId]
    // Addresses of all the portalProxy?
    const addresses = Object.values(network.bridges)
      .map((bridge) => {
        return bridge.outbox
      })
      .filter((address) => !!address)

    return {
      ...orbitOutboxNetworks,
      [network.slug]: {
        address: addresses, //
        startBlock: network.earliestBlock,
      },
    }
  }, {})

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
