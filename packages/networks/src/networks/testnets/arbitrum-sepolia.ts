import { ChildNetworkConfig } from '@relay-protocol/types'

export const arbSepolia: ChildNetworkConfig = {
  assets: {
    udt: '0xeCf77F1D5bB9d40BCc79343DB16ACB86795050fC',
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  },
  baseChainId: 11155111,
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        routerGateway: '0x9fDD1C4E4AA24EEc1d913FABea925594a20d43C7',
      },
      parent: {
        outbox: '0x65f07C7D521164a4d5DaC6eB8Fac8DA067A3B78F',
        rollup: '0x042B2E6C5E99d4c521bd49beeD5E99651D9B0Cf4',
        routerGateway: '0xcE18836b233C83325Cc8848CA4487e94C6288264',
      },
    },
    cctp: {
      child: {
        domain: 3n,
        messenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
        transmitter: '0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872',
      },
      parent: {
        domain: 0n,
        messenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
        transmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
      },
    },
  },
  chainId: 421614,
  earliestBlock: 130000000,
  hyperlaneMailbox: '0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8',
  isTestnet: true,
  name: 'Arbitrum Sepolia',
  rpc: process.env.RPC_421614
    ? [process.env.RPC_421614]
    : ['https://sepolia-rollup.arbitrum.io/rpc'],
  slug: 'arbitrum-sepolia',
  stack: 'arbitrum',
}
