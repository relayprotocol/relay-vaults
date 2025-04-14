import { L2NetworkConfig } from '@relay-protocol/types'

export const echos: L2NetworkConfig = {
  assets: {
    usdc: '0x37234506262FF64d97694eA1F0461414c9e8A39e',
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
  chainId: 4321,
  earliestBlock: 0,
  hyperlaneMailbox: '0x2cA13C25A48B5A98c5AD47808Efa983D29543a9a',
  isTestnet: false,
  l1ChainId: 1,
  name: 'Echos',
  rpc: process.env.RPC_4321
    ? [process.env.RPC_4321]
    : ['https://rpc-echos-mainnet-0.t.conduit.xyz'],
  slug: 'echos',
  stack: 'optimism',
}
