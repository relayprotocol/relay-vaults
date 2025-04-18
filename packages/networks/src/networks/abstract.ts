import { ChildNetworkConfig } from '@relay-protocol/types'

export const abstract: ChildNetworkConfig = {
  assets: {
    usdc: '0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1',
    weth: '0x3439153EB7AF838Ad19d56E1571FBD09333C2809',
  },
  bridges: {
    zksync: {
      child: {
        l1Messenger: '0x0000000000000000000000000000000000008008',
        sharedDefaultBridge: '0x954ba8223a6BFEC1Cc3867139243A02BA0Bc66e4',
      },
      parent: {
        nativeTokenVault: '0xbeD1EB542f9a5aA6419Ff3deb921A372681111f6',
        sharedDefaultBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
      },
    },
  },
  chainId: 2741,
  earliestBlock: 0,
  hyperlaneMailbox: '0x9BbDf86b272d224323136E15594fdCe487F40ce7',
  isTestnet: false,
  name: 'Abstract',
  parentChainId: 1,
  rpc: process.env.RPC_2741
    ? [process.env.RPC_2741]
    : ['https://api.mainnet.abs.xyz'],
  slug: 'abstract',
  stack: 'zksync',
  withdrawalDelay: 10800,
}
