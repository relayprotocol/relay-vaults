import { L2NetworkConfig } from '@relay-protocol/types'

export const echos: L2NetworkConfig = {
  stack: 'op',
  l1ChainId: 1,
  chainId: 4321,
  isTestnet: false,
  name: 'Echos',
  slug: 'echos',
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
  rpc: process.env.RPC_17777
    ? [process.env.RPC_17777]
    : ['https://api.echos.exchange'],
}
