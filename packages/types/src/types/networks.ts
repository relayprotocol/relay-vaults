export interface VaultNetworkConfig extends NetworkConfig {
  uniswapV3: {
    universalRouterAddress: string
  }
}

type optimismBedrockParent = {
  portalProxy: string
  gameFactory: string
  maxTimeWithoutProof: number // duration before a OP bedrock chain is deemed halted/inactive
}

type optimismLegacyParent = {
  outputOracle: string
  portalProxy: string
  maxBlocksWithoutProof: number // number of blocks before a chain is deemed halted/inactive
}

export interface OriginNetworkConfig extends NetworkConfig {
  parentChainId: number
  stack: 'optimism' | 'optimism-alt' | 'arbitrum' | 'zksync' | 'zkevm'
  withdrawalDelay?: number // withdrawal delay in seconds
  bridges: {
    optimism?: {
      parent: optimismBedrockParent | optimismLegacyParent
      child: {
        messagePasser: string
      }
    }
    arbitrum?: {
      parent: {
        outbox: string
        rollup: string
        routerGateway: string
        maxBlocksWithoutProof: number // number of L1 blocks before a chain is deemed halted/inactive
      }
      child: {
        arbSys: string
        routerGateway: string
      }
    }
    cctp?: {
      parent: {
        domain: bigint
        messenger: string
        transmitter: string
      }
      child: {
        domain: bigint
        messenger: string
        transmitter: string
      }
    }
    zksync?: {
      parent: {
        sharedDefaultBridge: string
        nativeTokenVault: string
        diamondProxy: string
        maxBlocksWithoutProof: number // number of L1 blocks before a chain is deemed halted/inactive
      }
      child: {
        l1Messenger: string
        sharedDefaultBridge: string
      }
    }
  }
}

export interface NetworkConfig {
  chainId: number | bigint
  curator?: string
  name: string
  slug?: string
  earliestBlock?: number
  hyperlaneMailbox: string
  hyperlaneHook?: string // TODO: combine with mailbox in hyperlane: {mailbox, hook}
  isTestnet: boolean
  assets: NetworkAssets
  rpc: [string, ...string[]]
}

export interface NetworkAssets {
  [asset: string]: string
}

export interface NetworkConfigs {
  [networkId: string]: NetworkConfig
}
