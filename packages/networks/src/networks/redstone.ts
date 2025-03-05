import { L2NetworkConfig } from '@relay-protocol/types'

export const redstone: L2NetworkConfig = {
  stack: 'op',
  l1ChainId: 1,
  chainId: 690,
  isTestnet: false,
  name: 'Redstone',
  slug: 'redstone',
  hyperlaneMailbox: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  bridges: {
    op: {
      messagePasser: '0x4200000000000000000000000000000000000016',
    },
  },
  assets: {
    usdc: '', // TODO: Add USDC address
    weth: '0x4200000000000000000000000000000000000006',
  },
  rpc: process.env.RPC_690
    ? [process.env.RPC_690]
    : ['https://rpc.redstonechain.com'],
}
