import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
    // TODO: add USDC
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        maxBlocksWithoutProof: 1500,
        outputOracle: '0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76',
        portalProxy: '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb',
      },
    },
  },
  chainId: 81457,
  hyperlaneMailbox: '0x3a867fCfFeC2B790970eeBDC9023E75B0a172aa7',
  isTestnet: false,
  name: 'Blast',
  parentChainId: 1,
  rpc: createRpcConfig(81457, ['https://rpc.blast.io']),
  stack: 'optimism',
}

export default config
