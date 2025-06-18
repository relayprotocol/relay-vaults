import { ChildNetworkConfig } from '@relay-vaults/types'

const config: ChildNetworkConfig = {
  assets: {
    dai: '0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656',
    eth: '0x000000000000000000000000000000000000800A',
    usdc: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
  },

  // no CCTP on zksync https://developers.circle.com/stablecoins/evm-smart-contracts
  // see https://www.circle.com/blog/zksync-migration-guide
  bridges: {
    zksync: {
      child: {
        l1Messenger: '0x11f943b2c77b743AB90f4A0Ae7d5A4e7FCA3E102',
        sharedDefaultBridge: '0x11f943b2c77b743AB90f4A0Ae7d5A4e7FCA3E102',
      },
      parent: {
        nativeTokenVault: '0xbeD1EB542f9a5aA6419Ff3deb921A372681111f6',
        sharedDefaultBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
        diamondProxy: '0x32400084c286cf3e17e7b677ea9583e60a000324',
        maxBlocksWithoutProof: 500,
      },
    },
  },

  chainId: 324,

  earliestBlock: 0,

  hyperlaneMailbox: '0xf44AdA86a1f765A938d404699B8070Dd47bD2431',

  isTestnet: false,

  name: 'Zksync',

  parentChainId: 1,
  rpc: process.env.RPC_324
    ? [process.env.RPC_324]
    : ['https://mainnet.era.zksync.io'],
  stack: 'zksync',
}

export default config
