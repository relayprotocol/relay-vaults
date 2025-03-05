import { L2NetworkConfig } from '@relay-protocol/types'

export const zero: L2NetworkConfig = {
  stack: 'op',
  l1ChainId: 1,
  chainId: 1337,
  isTestnet: false,
  name: 'Zero',
  slug: 'zero',
  hyperlaneMailbox: '0xd7b351D2dE3495eA259DD10ab4b9300A378Afbf3',
  bridges: {
    op: {
      messagePasser: '0x4200000000000000000000000000000000000016',
    },
  },
  assets: {
    usdc: '', // TODO: Add USDC address
    weth: '0x4200000000000000000000000000000000000006',
  },
  rpc: process.env.RPC_1337 ? [process.env.RPC_1337] : ['https://rpc.zero.com'],
}
