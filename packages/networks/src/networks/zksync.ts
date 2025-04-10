import { L2NetworkConfig } from '@relay-protocol/types'

export const zksync: L2NetworkConfig = {
  assets: {
    dai: '0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656',
    eth: '0x000000000000000000000000000000000000800A',
    usdc: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
  },

  // no CCTP on zksync https://developers.circle.com/stablecoins/evm-smart-contracts
  // see https://www.circle.com/blog/zksync-migration-guide
  bridges: {
    // can refresh these values by runinng `getZkSyncBridgeContracts(chainId)` from utils
    zksync: {
      l1: {
        sharedDefaultBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
      },
      l2: {
        sharedDefaultBridge: '0x11f943b2c77b743AB90f4A0Ae7d5A4e7FCA3E102',
      },
    },
  },

  chainId: 324,

  earliestBlock: 0,

  hyperlaneMailbox: '0xf44AdA86a1f765A938d404699B8070Dd47bD2431',

  isTestnet: false,

  isZKsync: true,

  l1ChainId: 1,

  name: 'Zksync',
  rpc: process.env.RPC_324
    ? [process.env.RPC_324]
    : ['https://mainnet.era.zksync.io'],
  slug: 'zksync',
  stack: 'zksync',
}
