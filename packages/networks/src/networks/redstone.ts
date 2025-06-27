import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0xD5d59fC063e7548b6015A36fEb10B875924A19be',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        maxBlocksWithoutProof: 3000,
        outputOracle: '0xa426A052f657AEEefc298b3B5c35a470e4739d69',
        portalProxy: '0xC7bCb0e8839a28A1cFadd1CF716de9016CdA51ae',
      },
    },
  },
  chainId: 690,
  hyperlaneMailbox: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  isTestnet: false,
  name: 'Redstone',
  parentChainId: 1,
  rpc: createRpcConfig(690, ['https://rpc.redstonechain.com']),
  stack: 'optimism-alt',
}

export default config
