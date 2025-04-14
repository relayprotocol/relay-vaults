import { L2NetworkConfig } from '@relay-protocol/types'

export const cyber: L2NetworkConfig = {
  assets: {
    usdc: '0x81759AdbF5520aD94da10991DfA29Ff147d3337b',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      l1: {
        portalProxy: '0xACfD93B4887cef4F05cF3440d150D2cE97339142',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 7560,
  earliestBlock: 15439700,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  baseChainId: 1,
  name: 'Cyber',
  rpc: process.env.RPC_7560
    ? [process.env.RPC_7560]
    : ['https://cyber.rpc.thirdweb.com'],
  slug: 'cyber',
  stack: 'optimism',
}
