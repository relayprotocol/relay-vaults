import { createConfig, factory } from 'ponder'
import { ABIs } from '@relay-protocol/helpers'
import { http } from 'viem'

import {
  RelayPool,
  RelayBridge,
  RelayPoolFactory,
  RelayBridgeFactory,
  TimelockControllerUpgradeable,
} from '@relay-protocol/abis'
import { Abi, AbiEvent } from 'viem'
import { getAddresses } from '@relay-protocol/addresses'
import networks from '@relay-protocol/networks'
import { L1NetworkConfig, ChildNetworkConfig } from '@relay-protocol/types'

const deployedAddresses = getAddresses()

// RPC configurations
const usedNetworks = Object.keys(networks).reduce((usedNetworks, chainId) => {
  return {
    ...usedNetworks,
    [networks[chainId].slug]: {
      chainId: Number(chainId),
      transport: http(networks[chainId].rpc[0]),
    },
  }
}, {})

// VaultSnapshot networks
const vaultSnapshotNetworks = Object.keys(networks)
  .filter((chainId) => {
    return !(networks[chainId] as ChildNetworkConfig).parentChainId
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
    return (networks[chainId] as ChildNetworkConfig).parentChainId
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
    return (networks[chainId] as ChildNetworkConfig).parentChainId
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
    return !(networks[chainId] as ChildNetworkConfig).parentChainId
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
    return !(networks[chainId] as ChildNetworkConfig).parentChainId
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

const relayPoolTimelockNetworks = Object.keys(networks)
  .filter((chainId) => {
    return !(networks[chainId] as ChildNetworkConfig).parentChainId
  })
  .reduce((relayPoolTimelockNetworks, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]
    if (!addresses?.RelayPoolFactory) {
      return relayPoolTimelockNetworks
    }
    return {
      ...relayPoolTimelockNetworks,
      [network.slug]: {
        address: factory({
          address: addresses.RelayPoolFactory,
          event: RelayPoolFactory.find(
            (e) => e.name === 'PoolDeployed'
          ) as AbiEvent,
          parameter: 'timelock',
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
    return (networks[chainId] as ChildNetworkConfig).bridges?.optimism?.parent
      .portalProxy
  })
  .reduce((oPPortalNetworks, chainId) => {
    const l2Network = networks[chainId] as ChildNetworkConfig
    const l1Network = networks[l2Network.parentChainId] as L1NetworkConfig
    if (!oPPortalNetworks[l1Network.slug]) {
      oPPortalNetworks[l1Network.slug] = {
        address: [],
        startBlock: l1Network.earliestBlock,
      }
    }
    if (
      !oPPortalNetworks[l1Network.slug].address.includes(
        l2Network.bridges.optimism!.parent.portalProxy
      )
    ) {
      oPPortalNetworks[l1Network.slug].address.push(
        l2Network.bridges.optimism!.parent.portalProxy
      )
    }
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
    return (networks[chainId] as ChildNetworkConfig).bridges?.arbitrum?.parent
      .outbox
  })
  .reduce((orbitOutboxNetworks, chainId) => {
    const l2Network = networks[chainId] as ChildNetworkConfig
    const l1Network = networks[l2Network.parentChainId] as L1NetworkConfig
    if (!orbitOutboxNetworks[l1Network.slug]) {
      orbitOutboxNetworks[l1Network.slug] = {
        address: [],
        startBlock: l1Network.earliestBlock,
      }
    }
    if (
      !orbitOutboxNetworks[l1Network.slug].address.includes(
        l2Network.bridges.arbitrum!.parent.outbox
      )
    ) {
      orbitOutboxNetworks[l1Network.slug].address.push(
        l2Network.bridges.arbitrum!.parent.outbox
      )
    }
    return orbitOutboxNetworks
  }, {} as OrbitOutboxNetworks)

interface zkSyncNetworks {
  [key: string]: {
    address: string[]
    startBlock: number
  }
}

const zkSyncNetworks: zkSyncNetworks = Object.keys(networks)
  .filter((chainId) => {
    // on the L1 chain
    return (networks[chainId] as ChildNetworkConfig).bridges?.zksync?.parent
      .nativeTokenVault
  })
  .reduce((zkSyncNetworks, chainId) => {
    // No sepolia while debugging!
    if (chainId === '300') {
      return zkSyncNetworks
    }
    const l2Network = networks[chainId] as ChildNetworkConfig
    const l1Network = networks[l2Network.parentChainId] as L1NetworkConfig
    if (!zkSyncNetworks[l1Network.slug]) {
      zkSyncNetworks[l1Network.slug] = {
        address: [],
        startBlock: l1Network.earliestBlock,
      }
    }
    if (
      !zkSyncNetworks[l1Network.slug].address.includes(
        l2Network.bridges.zksync!.parent.nativeTokenVault
      )
    ) {
      zkSyncNetworks[l1Network.slug].address.push(
        l2Network.bridges.zksync!.parent.nativeTokenVault
      )
    }
    return zkSyncNetworks
  }, {} as zkSyncNetworks)

export default createConfig({
  // blocks: {
  //   VaultSnapshot: {
  //     interval: 25,
  //     network: vaultSnapshotNetworks,
  //   },
  // },
  contracts: {
    L1NativeTokenVault: {
      abi: ABIs.L1NativeTokenVault,
      network: zkSyncNetworks,
    },

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

    RelayPoolTimelock: {
      abi: TimelockControllerUpgradeable as Abi,
      network: relayPoolTimelockNetworks,
    },
  },
  database: {
    connectionString: process.env.DATABASE_URL,
    kind: 'postgres',
  },
  networks: usedNetworks,
})
