import { L2NetworkConfig } from '@relay-protocol/types'

// Arbitrum L3
// https://docs.game7.io/the-g7-network

export const game7: L2NetworkConfig = {
  assets: {
    usdc: '0x401eCb1D350407f13ba348573E5630B83638E30D',
    weth: '0xB1116517a980DA056E05Fa521d524E1AFD8D885f',
  },
  // currently not in https://github.com/hyperlane-xyz/hyperlane-registry
  bridges: {
    arb: {
      arbSys: '0x0000000000000000000000000000000000000064',
      routerGateway: '0x7Ca9c81d2AdD8bff46CEE9813d52bD84d94901DD',
    },
  },

  chainId: 2187,

  earliestBlock: 0,

  hyperlaneMailbox: '',

  isTestnet: false,

  l1ChainId: 1,

  name: 'Game7',

  rpc: process.env.RPC_2187
    ? [process.env.RPC_2187]
    : ['https://mainnet-rpc.game7.io'],

  slug: 'game7',
  stack: 'arb',
}
