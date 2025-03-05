import { L2NetworkConfig } from '@relay-protocol/types'

export const abstract: L2NetworkConfig = {
  stack: 'op',
  l1ChainId: 1,
  chainId: 18231,
  isTestnet: false,
  name: 'Abstract',
  slug: 'abstract',
  hyperlaneMailbox: '', // TODO: Add Hyperlane mailbox address
  bridges: {
    op: {
      messagePasser: '0x4200000000000000000000000000000000000016',
    },
  },
  assets: {
    usdc: '', // TODO: Add USDC address
    weth: '0x4200000000000000000000000000000000000006',
  },
  rpc: process.env.RPC_18231
    ? [process.env.RPC_18231]
    : ['https://mainnet.abstract.xyz'],
}
