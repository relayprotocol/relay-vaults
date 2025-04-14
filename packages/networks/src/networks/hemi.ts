import { L2NetworkConfig } from '@relay-protocol/types'

export const hemi: L2NetworkConfig = {
  assets: {
    // Add asset addresses once available
  },
  bridges: {
    // Add bridge configurations once available
  },
  chainId: 43111,
  earliestBlock: 0, // Update with actual earliest block
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  l1ChainId: 1, // Assuming Ethereum mainnet as L1
  name: 'Hemi',
  rpc: process.env.RPC_43111
    ? [process.env.RPC_43111]
    : ['https://rpc.hemi.network/rpc'],
  slug: 'hemi',
  stack: 'arbitrum',
}
