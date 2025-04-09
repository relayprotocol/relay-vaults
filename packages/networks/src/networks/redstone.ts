import { L2NetworkConfig } from '@relay-protocol/types'

export const redstone: L2NetworkConfig = {
  assets: {
    usdc: '0xD5d59fC063e7548b6015A36fEb10B875924A19be',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      l1: {
        portalProxy: '',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 690,
  earliestBlock: 0,
  hyperlaneMailbox: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  isTestnet: false,
  l1ChainId: 1,
  name: 'Redstone',
  rpc: process.env.RPC_690
    ? [process.env.RPC_690]
    : ['https://rpc.redstonechain.com'],
  slug: 'redstone',
  stack: 'optimism',
}
