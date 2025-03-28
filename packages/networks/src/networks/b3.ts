import { L2NetworkConfig } from '@relay-protocol/types'

export const b3: L2NetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    op: {
      messagePasser: '0x4200000000000000000000000000000000000016',
    },
  },
  chainId: 8333,
  earliestBlock: 0,
  hyperlaneMailbox: '0x3a867fCfFeC2B790970eeBDC9023E75B0a172aa7',
  isTestnet: false,
  l1ChainId: 1,
  name: 'B3',
  rpc: process.env.RPC_84531
    ? [process.env.RPC_84531]
    : ['https://mainnet-rpc.b3.fun'],
  slug: 'b3',
  stack: 'op',
}
