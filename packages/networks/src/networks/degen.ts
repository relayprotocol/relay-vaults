import { L2NetworkConfig } from '@relay-protocol/types'

export const degen: L2NetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    arbitrum: {
      l1: {
        outbox: '',
        rollup: '',
        routerGateway: '',
      },
      l2: {
        arbSys: '',
        routerGateway: '',
      },
    },
  },
  chainId: 666666666,
  earliestBlock: 0,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  baseChainId: 1,
  name: 'Degen',
  rpc: process.env.RPC_666666666
    ? [process.env.RPC_666666666]
    : ['https://rpc.degen.tips'],
  slug: 'degen',
  stack: 'arbitrum',
}
