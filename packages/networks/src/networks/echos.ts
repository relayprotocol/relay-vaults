import { L2NetworkConfig } from '@relay-protocol/types'

export const echos: L2NetworkConfig = {
  assets: {
    usdc: '0x9c5e286e1eB95e8BEeE3058bc0CE642B9f798a41',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    op: {
      messagePasser: '0x4200000000000000000000000000000000000016',
    },
  },
  chainId: 4321,
  earliestBlock: 0,
  hyperlaneMailbox: '0x2cA13C25A48B5A98c5AD47808Efa983D29543a9a',
  isTestnet: false,
  l1ChainId: 1,
  name: 'Echos',
  rpc: process.env.RPC_17777
    ? [process.env.RPC_17777]
    : ['https://api.echos.exchange'],
  slug: 'echos',
  stack: 'op',
}
