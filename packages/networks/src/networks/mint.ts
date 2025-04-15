import { ChildNetworkConfig } from '@relay-protocol/types'

export const mint: ChildNetworkConfig = {
  assets: {
    usdc: '0xb62F35B9546A908d11c5803ecBBA735AbC3E3eaE',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x59625d1FE0Eeb8114a4d13c863978F39b3471781',
      },
    },
  },
  chainId: 185,
  earliestBlock: 14354000,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  name: 'Mint',
  parentChainId: 1,
  rpc: process.env.RPC_1337
    ? [process.env.RPC_1337]
    : ['https://rpc.mintchain.io'],
  slug: 'mint',
  stack: 'optimism',
}
