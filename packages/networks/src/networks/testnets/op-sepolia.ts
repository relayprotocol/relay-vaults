import { ChildNetworkConfig } from '@relay-protocol/types'

export const opSepolia: ChildNetworkConfig = {
  assets: {
    usdc: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
  },
  bridges: {
    cctp: {
      child: {
        domain: 2n,
        messenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
        transmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
      },
      parent: {
        domain: 0n,
        messenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
        transmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
      },
    },
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x16Fc5058F25648194471939df75CF27A2fdC48BC',
      },
    },
  },
  chainId: 11155420,
  earliestBlock: 25000000,
  hyperlaneMailbox: '0x6966b0E55883d49BFB24539356a2f8A673E02039',
  isTestnet: true,
  name: 'OP Sepolia',
  parentChainId: 11155111,
  rpc: process.env.RPC_11155420
    ? [process.env.RPC_11155420]
    : ['https://optimism-sepolia.gateway.tenderly.co'],
  slug: 'op-sepolia',
  stack: 'optimism',
}
