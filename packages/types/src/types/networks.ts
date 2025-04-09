export interface L1NetworkConfig extends NetworkConfig {
  uniswapV3: {
    universalRouterAddress: string
  }
}

export interface L2NetworkConfig extends NetworkConfig {
  l1ChainId: number | bigint
  stack: 'optimism' | 'arbitrum' | 'zksync' | 'zkevm'
  bridges: {
    optimism?: {
      l1: {
        portalProxy: string
      }
      l2: {
        messagePasser: string
      }
    }
    arbitrum?: {
      l1: {
        outbox: string
        rollup: string
        routerGateway: string
      }
      l2: {
        arbSys: string
        routerGateway: string
      }
    }
    cctp?: {
      l1: {
        domain: bigint
        messenger: string
        transmitter: string
      }
      l2: {
        domain: bigint
        messenger: string
        transmitter: string
      }
    }
    zksync?: {
      l1: {
        sharedDefaultBridge: string
      }
      l2: {
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
