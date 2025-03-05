import { L2NetworkConfig } from '@relay-protocol/types'

export const arbitrumNova: L2NetworkConfig = {
  stack: 'arb',
  l1ChainId: 1,
  chainId: 42170,
  isTestnet: false,
  name: 'Arbitrum Nova',
  slug: 'arb-nova',
  hyperlaneMailbox: '0x3a867fCfFeC2B790970eeBDC9023E75B0a172aa7',
  bridges: {
    arb: {
      arbSys: '0x0000000000000000000000000000000000000064',
      routerGateway: '', // TODO: Add router gateway address
    },
  },
  assets: {
    usdc: '', // TODO: Add USDC address
    weth: '0x722E8BdD2ce80A4422E880164f2079488e115365',
  },
  rpc: process.env.RPC_42170
    ? [process.env.RPC_42170]
    : ['https://nova.arbitrum.io/rpc'],
}
