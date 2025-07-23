import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0xb62F35B9546A908d11c5803ecBBA735AbC3E3eaE',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        maxBlocksWithoutProof: 3500,
        outputOracle: '0xB751A613f2Db932c6cdeF5048E6D2af05F9B98ED',
        portalProxy: '0x59625d1FE0Eeb8114a4d13c863978F39b3471781',
      },
    },
  },
  chainId: 185,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  name: 'Mint',
  parentChainId: 1,
  rpc: createRpcConfig(185, ['https://rpc.mintchain.io']),
  stack: 'optimism-alt',
}

export default config
