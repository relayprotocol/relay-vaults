import { L2NetworkConfig } from '@relay-protocol/types'

export const rari: L2NetworkConfig = {
  assets: {
    // Add asset addresses once available
  },
  bridges: {
    // Add bridge configurations once available
  },
  chainId: 1380012617,
  earliestBlock: 0, // Update with actual earliest block
  hyperlaneMailbox: '', // No mailbox address available for deprecated chain
  isTestnet: false,
  l1ChainId: 1, // Assuming Ethereum mainnet as L1
  name: 'Rari',
  rpc: process.env.RPC_1380012617
    ? [process.env.RPC_1380012617]
    : ['https://mainnet.rpc.rarichain.org/http'],
  slug: 'rari',
  stack: 'arbitrum',
}
