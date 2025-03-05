import { L2NetworkConfig } from '@relay-protocol/types'

export const mint: L2NetworkConfig = {
  stack: 'op',
  l1ChainId: 1,
  chainId: 1337,
  isTestnet: false,
  name: 'Mint',
  slug: 'mint',
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
  rpc: process.env.RPC_1337
    ? [process.env.RPC_1337]
    : ['https://rpc.mintchain.com'],
}
