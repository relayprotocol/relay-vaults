import { ChildNetworkConfig } from '@relay-protocol/types'

export const baseSepolia: ChildNetworkConfig = {
  assets: {
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    weth: '0x999B45BB215209e567FaF486515af43b8353e393',
  },
  baseChainId: 11155111,
  bridges: {
    cctp: {
      child: {
        domain: 6n,
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
        portalProxy: '0x49f53e41452C74589E85cA1677426Ba426459e85',
      },
    },
  },
  chainId: 84532,
  earliestBlock: 23000000,
  hyperlaneMailbox: '0x6966b0E55883d49BFB24539356a2f8A673E02039',
  isTestnet: true,
  name: 'Base Sepolia',
  rpc: process.env.RPC_84532
    ? [process.env.RPC_84532]
    : ['https://base-sepolia.gateway.tenderly.co'],
  slug: 'base-sepolia',
  stack: 'optimism',
}
