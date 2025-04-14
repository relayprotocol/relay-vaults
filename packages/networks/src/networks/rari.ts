import { L2NetworkConfig } from '@relay-protocol/types'

export const rari: L2NetworkConfig = {
  assets: {
    // TODO: add USDC
  },
  bridges: {
    arbitrum: {
      l1: {
        outbox: '',
        rollup: '',
        routerGateway: '',
      },
      l2: {
        arbSys: '0x0000000000000000000000000000000000000064',
        // TODO
        routerGateway: '',
      },
    },
  },
  chainId: 1380012617,
  earliestBlock: 0, // Update with actual earliest block
  hyperlaneMailbox: '0x65dCf8F6b3f6a0ECEdf3d0bdCB036AEa47A1d615',
  isTestnet: false,
  l1ChainId: 1,
  name: 'Rari',
  rpc: process.env.RPC_1380012617
    ? [process.env.RPC_1380012617]
    : ['https://mainnet.rpc.rarichain.org/http'],
  slug: 'rari',
  stack: 'arbitrum',
}
