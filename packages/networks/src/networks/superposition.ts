import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '',
    weth: '',
  },
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        routerGateway: '',
      },
      parent: {
        maxBlocksWithoutProof: 500,
        outbox: '0xa4b3B4D5f7976a8D283864ea83f1Bb3D815b1798',
        rollup: '0x325Dd0279Ba31bC346BA80F3D00628deFa2EacD4',
        routerGateway: '',
      },
    },
  },
  chainId: 55244,
  hyperlaneMailbox: '0x5e8a0fCc0D1DF583322943e01F02cB243e5300f6',
  isTestnet: false,
  name: 'Superposition',
  parentChainId: 42161,
  rpc: createRpcConfig(55244, ['https://rpc.superposition.so']),
  stack: 'arbitrum',
}

export default config
