import { L2NetworkConfig } from '@relay-protocol/types'

export const swellchain: L2NetworkConfig = {
  assets: {
    // Add asset addresses once available
  },
  bridges: {
    // Add bridge configurations once available
  },
  chainId: 1923,
  earliestBlock: 0, // Update with actual earliest block
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  l1ChainId: 1, // Assuming Ethereum mainnet as L1
  name: 'Swellchain',
  rpc: process.env.RPC_1923
    ? [process.env.RPC_1923]
    : ['https://swell-mainnet.alt.technology'],
  slug: 'swellchain',
  stack: 'optimism', // Assuming Optimism stack, update if different
}
