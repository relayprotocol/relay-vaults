import { ChildNetworkConfig } from '@relay-protocol/types'

// L3
export const rari: ChildNetworkConfig = {
  assets: {
    // TODO: add USDC
  },
  baseChainId: 42161,
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        // TODO
        routerGateway: '',
      },
      parent: {
        outbox: '',
        rollup: '',
        routerGateway: '',
      },
    },
  },
  chainId: 1380012617,
  earliestBlock: 0, // Update with actual earliest block
  hyperlaneMailbox: '0x65dCf8F6b3f6a0ECEdf3d0bdCB036AEa47A1d615',
  isTestnet: false,
  name: 'Rari',
  rpc: process.env.RPC_1380012617
    ? [process.env.RPC_1380012617]
    : ['https://mainnet.rpc.rarichain.org/http'],
  slug: 'rari',
  stack: 'arbitrum',
}
