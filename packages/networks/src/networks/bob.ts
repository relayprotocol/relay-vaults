import { ChildNetworkConfig } from '@relay-protocol/types'

const config: ChildNetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
    // TODO: add USDC
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x8AdeE124447435fE03e3CD24dF3f4cAE32E65a3E',
      },
    },
  },
  chainId: 60808,
  earliestBlock: 15926900,
  hyperlaneMailbox: '0x8358D8291e3bEDb04804975eEa0fe9fe0fAfB147',
  isTestnet: false,
  name: 'BOB',
  parentChainId: 1,
  rpc: process.env.RPC_60808
    ? [process.env.RPC_60808]
    : ['https://rpc.gobob.xyz'],
  stack: 'optimism-alt',
}

export default config
