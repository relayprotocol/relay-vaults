export interface childNetworkConfig extends NetworkConfig {
  uniswapV3: {
    universalRouterAddress: string
  }
}

export interface ChildNetworkConfig extends NetworkConfig {
  baseChainId: number
  stack: 'optimism' | 'arbitrum' | 'zksync' | 'zkevm'
  bridges: {
    optimism?: {
      child: {
        portalProxy: string
      }
      parent: {
        messagePasser: string
      }
    }
    arbitrum?: {
      child: {
        outbox: string
        rollup: string
        routerGateway: string
      }
      parent: {
        arbSys: string
        routerGateway: string
      }
    }
    cctp?: {
      child: {
        domain: bigint
        messenger: string
        transmitter: string
      }
      parent: {
        domain: bigint
        messenger: string
        transmitter: string
      }
    }
    zksync?: {
      child: {
        sharedDefaultBridge: string
      }
      parent: {
        sharedDefaultBridge: string
      }
    }
  }
}

export interface NetworkConfig {
  chainId: number | bigint
  name: string
  slug: string
  earliestBlock: number
  isZKsync?: boolean
  hyperlaneMailbox: string
  hyperlaneHook?: string // TODO: combine with mailbox in hyperlane: {mailbox, hook}
  isTestnet: boolean
  assets: NetworkAssets
  rpc: [string, ...string[]]
}

interface NetworkAssets {
  [asset: string]: string
}

export interface NetworkConfigs {
  [networkId: string]: NetworkConfig
}
