export interface L1NetworkConfig extends NetworkConfig {
  uniswapV3: {
    universalRouterAddress: string
  }
}

export interface ChildNetworkConfig extends NetworkConfig {
  parentChainId: number
  stack: 'optimism' | 'optimism-alt' | 'arbitrum' | 'zksync' | 'zkevm'
  withdrawalDelay?: number // withdrawal delay in seconds

  bridges: {
    optimism?: {
      parent: {
        portalProxy: string
      }
      child: {
        messagePasser: string
      }
    }
    arbitrum?: {
      parent: {
        outbox: string
        rollup: string
        routerGateway: string
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
  name: string
  slug?: string
  earliestBlock: number
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
