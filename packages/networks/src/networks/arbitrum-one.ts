import { ChildNetworkConfig } from '@relay-protocol/types'

export const arbitrumOne: ChildNetworkConfig = {
  assets: {
    arb: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    udt: '0xd5d3aA404D7562d09a848F96a8a8d5D65977bF90',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        routerGateway: '0x5288c571Fd7aD117beA99bF60FE0846C4E84F933',
      },
      parent: {
        outbox: '0x0B9857ae2D4A3DBe74ffE1d7DF045bb7F96E4840',
        rollup: '0x5eF0D09d1E6204141B4d37530808eD19f60FBa35',
        routerGateway: '0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef',
      },
    },
    cctp: {
      child: {
        domain: 3n,
        messenger: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
        transmitter: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
      },
      parent: {
        domain: 0n,
        messenger: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
        transmitter: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
      },
    },
  },
  chainId: 42161,
  earliestBlock: 0,
  hyperlaneMailbox: '0x979Ca5202784112f4738403dBec5D0F3B9daabB9',
  isTestnet: false,
  name: 'Arbitrum',
  parentChainId: 1,
  rpc: process.env.RPC_42161
    ? [process.env.RPC_42161]
    : ['https://arb1.arbitrum.io/rpc'],
  slug: 'arb',
  stack: 'arbitrum',
}
