import { createConfig, factory, mergeAbis } from 'ponder'
import { ABIs } from '@relay-vaults/helpers'
import { http } from 'viem'

import {
  RelayPool,
  RelayBridge,
  RelayPoolFactory,
  RelayBridgeFactory,
  TimelockControllerUpgradeable,
} from '@relay-vaults/abis'
import { Abi, AbiEvent } from 'viem'
import { getAddresses } from '@relay-vaults/addresses'
import networks from '@relay-vaults/networks'
import { VaultNetworkConfig, OriginNetworkConfig } from '@relay-vaults/types'
import { getIamToken } from './src/utils/aws.js'

const deployedAddresses = getAddresses()

const getConnectionString = async () => {
  const databaseUrl = new URL(process.env.DATABASE_URL!)
  if (!databaseUrl.password) {
    databaseUrl.password = await getIamToken({
      hostname: databaseUrl.hostname,
      port: Number(databaseUrl.port),
      region: process.env.AWS_REGION,
      username: databaseUrl.username,
    })
  }
  return databaseUrl.toString()
}

// Importing the RelayBridgeFactory ABI to use in the config
// RPC configurations with fallback transport
const chains = Object.keys(networks).reduce((chains, chainId: string) => {
  const network = networks[chainId]

  return {
    ...chains,
    [network.slug!]: {
      id: Number(chainId),
      maxRequestsPerSecond: 500,
      pollingInterval: 100,
      rpc: http(network.rpc[0]),
    },
  }
}, {})

// RelayBridge chains
const relayBridgeChains = Object.keys(networks).reduce(
  (relayBridgeChains, chainId: string) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]
    if (!addresses?.RelayBridgeFactory) {
      return relayBridgeChains
    }
    return {
      [network.slug!]: {
        address: factory({
          address: addresses.RelayBridgeFactory,
          event: RelayBridgeFactory.find(
            (e) => e.name === 'BridgeDeployed'
          ) as AbiEvent,
          parameter: 'bridge',
        }),
        startBlock: network.earliestBlock || 'latest',
      },
      ...relayBridgeChains,
    }
  },
  {}
)

// RelayBridgeFactory
const relayBridgeFactoryChains = Object.keys(networks).reduce(
  (relayBridgeFactoryChains, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]

    if (!addresses?.RelayBridgeFactory) {
      return relayBridgeFactoryChains
    }
    return {
      [network.slug!]: {
        address: addresses.RelayBridgeFactory,
        startBlock: network.earliestBlock || 'latest',
      },
      ...relayBridgeFactoryChains,
    }
  },
  {}
)

// RelayPoolFactory
const relayPoolFactoryChains = Object.keys(networks).reduce(
  (relayPoolFactoryChains, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]

    if (!addresses?.RelayPoolFactory) {
      return relayPoolFactoryChains
    }

    return {
      ...relayPoolFactoryChains,
      [network.slug!]: {
        address: addresses.RelayPoolFactory,
        startBlock: network.earliestBlock || 'latest',
      },
    }
  },
  {}
)

const relayPoolChains = Object.keys(networks).reduce(
  (relayPoolChains, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]
    if (!addresses?.RelayPoolFactory) {
      return relayPoolChains
    }
    return {
      ...relayPoolChains,
      [network.slug!]: {
        address: factory({
          address: addresses.RelayPoolFactory,
          event: RelayPoolFactory.find(
            (e) => e.name === 'PoolDeployed'
          ) as AbiEvent,
          parameter: 'pool',
        }),
        startBlock: network.earliestBlock || 'latest',
      },
    }
  },
  {}
)

const relayPoolTimelockChains = Object.keys(networks)
  .filter((chainId) => {
    return !(networks[chainId] as OriginNetworkConfig).parentChainId
  })
  .reduce((relayPoolTimelockChains, chainId) => {
    const network = networks[chainId]
    const addresses = deployedAddresses[chainId]
    if (!addresses?.RelayPoolFactory) {
      return relayPoolTimelockChains
    }
    return {
      ...relayPoolTimelockChains,
      [network.slug!]: {
        address: factory({
          address: addresses.RelayPoolFactory,
          event: RelayPoolFactory.find(
            (e) => e.name === 'PoolDeployed'
          ) as AbiEvent,
          parameter: 'timelock',
        }),
        startBlock: network.earliestBlock || 'latest',
      },
    }
  }, {})

interface OPPortalChains {
  [key: string]: {
    address: `0x${string}`[]
    startBlock: number
  }
}

const oPPortalChains: OPPortalChains = Object.keys(networks)
  .filter((chainId) => {
    // Get the chains that have an optimism bridge to the l1
    const originNetwork = networks[chainId] as OriginNetworkConfig
    return originNetwork.bridges?.optimism?.parent.portalProxy
  })
  .reduce((oPPortalChains, chainId) => {
    const l2Network = networks[chainId] as OriginNetworkConfig
    const l1Network = networks[l2Network.parentChainId] as VaultNetworkConfig

    const parent = l2Network.bridges.optimism?.parent
    if (!oPPortalChains[l1Network.slug!]) {
      oPPortalChains[l1Network.slug!] = {
        address: [],
        startBlock: l1Network.earliestBlock || 0,
      }
    }
    if (
      !oPPortalChains[l1Network.slug!].address.includes(
        parent!.portalProxy as `0x${string}`
      )
    ) {
      oPPortalChains[l1Network.slug!].address.push(
        parent!.portalProxy as `0x${string}`
      )
    }
    return oPPortalChains
  }, {} as OPPortalChains)

interface OrbitOutboxChains {
  [key: string]: {
    address: `0x${string}`[]
    startBlock: number
  }
}

const orbitOutboxChains: OrbitOutboxChains = Object.keys(networks)
  .filter((chainId) => {
    // on the L1 chain
    return (networks[chainId] as OriginNetworkConfig).bridges?.arbitrum?.parent
      .outbox
  })
  .reduce((orbitOutboxChains, chainId) => {
    const l2Network = networks[chainId] as OriginNetworkConfig
    const l1Network = networks[l2Network.parentChainId] as VaultNetworkConfig
    if (!orbitOutboxChains[l1Network.slug!]) {
      orbitOutboxChains[l1Network.slug!] = {
        address: [],
        startBlock: l1Network.earliestBlock || 0,
      }
    }
    if (
      !orbitOutboxChains[l1Network.slug!].address.includes(
        l2Network.bridges.arbitrum!.parent.outbox as `0x${string}`
      )
    ) {
      orbitOutboxChains[l1Network.slug!].address.push(
        l2Network.bridges.arbitrum!.parent.outbox as `0x${string}`
      )
    }
    return orbitOutboxChains
  }, {} as OrbitOutboxChains)

interface zkSyncChains {
  [key: string]: {
    address: `0x${string}`[]
    startBlock: number
  }
}

const zkSyncChains: zkSyncChains = Object.keys(networks)
  .filter((chainId) => {
    // on the L1 chain
    return (networks[chainId] as OriginNetworkConfig).bridges?.zksync?.parent
      .nativeTokenVault
  })
  .reduce((zkSyncChains, chainId) => {
    // No sepolia while debugging!
    if (chainId === '300') {
      return zkSyncChains
    }
    const l2Network = networks[chainId] as OriginNetworkConfig
    const l1Network = networks[l2Network.parentChainId] as VaultNetworkConfig
    if (!zkSyncChains[l1Network.slug!]) {
      zkSyncChains[l1Network.slug!] = {
        address: [],
        startBlock: l1Network.earliestBlock || 0,
      }
    }
    if (
      !zkSyncChains[l1Network.slug!].address.includes(
        l2Network.bridges.zksync!.parent.nativeTokenVault as `0x${string}`
      )
    ) {
      zkSyncChains[l1Network.slug!].address.push(
        l2Network.bridges.zksync!.parent.nativeTokenVault as `0x${string}`
      )
    }
    return zkSyncChains
  }, {} as zkSyncChains)

export default createConfig({
  blocks: {
    PoolSnapshot: {
      chain: relayPoolChains,
      interval: process.env.ENV === 'development' ? 10000 : 100,
    },
  },
  chains,
  contracts: {
    L1NativeTokenVault: {
      abi: ABIs.L1NativeTokenVault as Abi,
      chain: zkSyncChains,
    },

    OPPortal: {
      abi: mergeAbis([ABIs.Portal2, ABIs.BlastPortal]) as Abi,
      chain: oPPortalChains,
    },

    OrbitOutbox: {
      abi: ABIs.Outbox as Abi,
      chain: orbitOutboxChains,
    },

    RelayBridge: {
      abi: RelayBridge as Abi,
      chain: relayBridgeChains,
    },

    RelayBridgeFactory: {
      abi: RelayBridgeFactory as Abi,
      chain: relayBridgeFactoryChains,
    },

    RelayPool: {
      abi: RelayPool as Abi,
      chain: relayPoolChains,
    },

    RelayPoolFactory: {
      abi: RelayPoolFactory as Abi,
      chain: relayPoolFactoryChains,
    },

    RelayPoolTimelock: {
      abi: TimelockControllerUpgradeable as Abi,
      chain: relayPoolTimelockChains,
    },
  },
  database: {
    connectionString: await getConnectionString(),
    kind: 'postgres',
  },
  ordering: 'multichain', // or "omnichain" — see below
})
