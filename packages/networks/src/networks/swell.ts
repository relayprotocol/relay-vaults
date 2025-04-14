import { L2NetworkConfig } from '@relay-protocol/types'

export const swell: L2NetworkConfig = {
  assets: {
    // Add asset addresses once available
  },
  bridges: {
    optimism: {
      l1: {
        portalProxy: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
      },
      l2: {
        // TODO
        messagePasser: '',
      },
    },
  },
  chainId: 1923,
  earliestBlock: 0, // Update with actual earliest block
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  l1ChainId: 1,
  name: 'Swellchain',
  rpc: process.env.RPC_1923
    ? [process.env.RPC_1923]
    : ['https://swell-mainnet.alt.technology'],
  slug: 'swell',
  stack: 'optimism',
}
