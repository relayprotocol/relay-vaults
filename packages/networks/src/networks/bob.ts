import { L2NetworkConfig } from '@relay-protocol/types'

export const bob: L2NetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
    // TODO: add USDC
  },
  bridges: {
    optimism: {
      l1: {
        portalProxy: '0x8AdeE124447435fE03e3CD24dF3f4cAE32E65a3E',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 60808,
  earliestBlock: 0, // Update with actual earliest block
  hyperlaneMailbox: '0x8358D8291e3bEDb04804975eEa0fe9fe0fAfB147',
  isTestnet: false,
  l1ChainId: 1,
  name: 'BOB',
  rpc: process.env.RPC_60808
    ? [process.env.RPC_60808]
    : ['https://rpc.gobob.xyz'],
  slug: 'bob',
  stack: 'optimism',
}
