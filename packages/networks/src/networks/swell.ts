import { ChildNetworkConfig } from '@relay-protocol/types'

export const swell: ChildNetworkConfig = {
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
        portalProxy: '0x758E0EE66102816F5C3Ec9ECc1188860fbb87812',
      },
    },
  },
  chainId: 1923,
  earliestBlock: 6009900,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  name: 'Swellchain',
  parentChainId: 1,
  rpc: process.env.RPC_1923
    ? [process.env.RPC_1923]
    : ['https://swell-mainnet.alt.technology'],
  slug: 'swell',
  stack: 'optimism',
}
