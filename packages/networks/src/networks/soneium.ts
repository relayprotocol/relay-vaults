import { L2NetworkConfig } from '@relay-protocol/types'

export const soneium: L2NetworkConfig = {
  assets: {
    usdc: '0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      l1: {
        portalProxy: '0x88e529A6ccd302c948689Cd5156C83D4614FAE92',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 1868,
  earliestBlock: 5241889,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  baseChainId: 1,
  name: 'Soneium',
  rpc: ['https://rpc.soneium.org'],
  slug: 'soneium',
  stack: 'optimism',
}
