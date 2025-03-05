import { L2NetworkConfig } from '@relay-protocol/types'

export const lisk: L2NetworkConfig = {
  stack: 'op',
  l1ChainId: 1,
  chainId: 1135,
  isTestnet: false,
  name: 'Lisk',
  slug: 'lisk',
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  bridges: {
    op: {
      messagePasser: '0x4200000000000000000000000000000000000016',
    },
  },
  assets: {
    usdc: '', // TODO: Add USDC address
    weth: '0x4200000000000000000000000000000000000006',
  },
  rpc: process.env.RPC_1135 ? [process.env.RPC_1135] : ['https://rpc.lisk.com'],
}
