import { ChildNetworkConfig } from '@relay-protocol/types'

export const ancient8: ChildNetworkConfig = {
  assets: {
    usdc: '0x97423A68BAe94b5De52d767a17aBCc54c157c0E5',
    weth: '0x4200000000000000000000000000000000000006',
  },
  baseChainId: 1,
  bridges: {
    optimism: {
      l1: {
        portalProxy: '0x639F2AECE398Aa76b07e59eF6abe2cFe32bacb68',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 888888888,
  earliestBlock: 19096500,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  name: 'Ancient8',
  rpc: ['https://rpc.ancient8.gg'],
  slug: 'ancient8',
  stack: 'optimism',
}
