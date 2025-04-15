import { ChildNetworkConfig } from '@relay-protocol/types'

// Base L3
// https://echos.fun
export const echos: ChildNetworkConfig = {
  assets: {
    usdc: '0x37234506262FF64d97694eA1F0461414c9e8A39e',
    weth: '0x4200000000000000000000000000000000000006',
  },
  baseChainId: 1,
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
      },
    },
  },
  chainId: 4321,
  earliestBlock: 0,
  hyperlaneMailbox: '0x2cA13C25A48B5A98c5AD47808Efa983D29543a9a',
  isTestnet: false,
  name: 'Echos',
  rpc: process.env.RPC_4321
    ? [process.env.RPC_4321]
    : ['https://rpc-echos-mainnet-0.t.conduit.xyz'],
  slug: 'echos',
  stack: 'optimism',
}
