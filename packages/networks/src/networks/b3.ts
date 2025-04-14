import { L2NetworkConfig } from '@relay-protocol/types'

export const b3: L2NetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      l1: {
        portalProxy: '0x3a314A6a3c1470Bf2854960D3Ce9D2435c7Ba794',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 8333,
  earliestBlock: 0,
  hyperlaneMailbox: '0x3a867fCfFeC2B790970eeBDC9023E75B0a172aa7',
  isTestnet: false,
  baseChainId: 1,
  name: 'B3',
  rpc: process.env.RPC_84531
    ? [process.env.RPC_84531]
    : ['https://mainnet-rpc.b3.fun'],
  slug: 'b3',
  stack: 'optimism',
}
