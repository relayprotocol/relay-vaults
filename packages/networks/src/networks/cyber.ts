import { L2NetworkConfig } from '@relay-protocol/types'

export const cyber: L2NetworkConfig = {
  stack: 'op',
  l1ChainId: 1,
  chainId: 7560,
  isTestnet: false,
  name: 'Cyber',
  slug: 'cyber',
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
  rpc: process.env.RPC_7560
    ? [process.env.RPC_7560]
    : ['https://cyber.rpc.thirdweb.com'],
}
