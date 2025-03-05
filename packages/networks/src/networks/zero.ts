import { L2NetworkConfig } from '@relay-protocol/types'

export const zero: L2NetworkConfig = {
  stack: 'zksync',
  l1ChainId: 1,
  chainId: 543210,
  isTestnet: false,
  name: 'Zero',
  slug: 'zero',
  isZKsync: true,
  hyperlaneMailbox: '0xd7b351D2dE3495eA259DD10ab4b9300A378Afbf3',
  assets: {
    usdc: '', // TODO: Add USDC address
    weth: '', // TODO: Add WETH address
  },
  rpc: ['https://zero.drpc.org'],
}
