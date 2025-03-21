import { L2NetworkConfig } from '@relay-protocol/types'

export const mint: L2NetworkConfig = {
  assets: {
    usdc: '0xb62F35B9546A908d11c5803ecBBA735AbC3E3eaE',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    op: {
      messagePasser: '0x4200000000000000000000000000000000000016',
    },
  },
  chainId: 185,
  earliestBlock: 0,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  l1ChainId: 1,
  name: 'Mint',
  rpc: process.env.RPC_1337
    ? [process.env.RPC_1337]
    : ['https://rpc.mintchain.com'],
  slug: 'mint',
  stack: 'op',
}
