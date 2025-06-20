import { OriginNetworkConfig } from '@relay-vaults/types'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0x6a6394F47DD0BAF794808F2749C09bd4Ee874E70',
    weth: '0xAc98B49576B1C892ba6BFae08fE1BB0d80Cf599c',
  },
  bridges: {
    zksync: {
      child: {
        l1Messenger: '0x0000000000000000000000000000000000008008',
        sharedDefaultBridge: '0x954ba8223a6BFEC1Cc3867139243A02BA0Bc66e4',
      },
      parent: {
        diamondProxy: '0xdbD849acC6bA61F461CB8A41BBaeE2D673CA02d9',
        maxBlocksWithoutProof: 1500,
        nativeTokenVault: '0xbeD1EB542f9a5aA6419Ff3deb921A372681111f6',
        sharedDefaultBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
      },
    },
  },
  chainId: 543210,
  hyperlaneMailbox: '0xd7b351D2dE3495eA259DD10ab4b9300A378Afbf3',
  isTestnet: false,
  name: 'Zero',
  parentChainId: 1,
  rpc: ['https://rpc.zerion.io/v1/zero'],
  stack: 'zksync',
  withdrawalDelay: 10800, // 3 hrs
}

export default config
