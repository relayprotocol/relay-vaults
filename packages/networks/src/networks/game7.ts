import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0x401eCb1D350407f13ba348573E5630B83638E30D',
    weth: '0xB1116517a980DA056E05Fa521d524E1AFD8D885f',
  },
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        routerGateway: '0x7Ca9c81d2AdD8bff46CEE9813d52bD84d94901DD',
      },
      parent: {
        maxBlocksWithoutProof: 500,
        outbox: '',
        rollup: '',
        routerGateway: '',
      },
    },
  },
  chainId: 2187,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  name: 'Game7',
  parentChainId: 42161,
  rpc: createRpcConfig(2187, ['https://mainnet-rpc.game7.io']),
  stack: 'arbitrum',
}

export default config
