import { OriginNetworkConfig } from '@relay-vaults/types'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0x401eCb1D350407f13ba348573E5630B83638E30D',
    weth: '0xB1116517a980DA056E05Fa521d524E1AFD8D885f',
  },
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        routerGateway: '0x21903d3F8176b1a0c17E953Cd896610Be9fFDFa8',
      },
      parent: {
        maxBlocksWithoutProof: 500,
        outbox: '0xD4B80C3D7240325D18E645B49e6535A3Bf95cc58',
        rollup: '0xE7E8cCC7c381809BDC4b213CE44016300707B7Bd',
        routerGateway: '0xC840838Bc438d73C16c2f8b22D2Ce3669963cD48',
      },
    },
  },
  chainId: 2187,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  name: 'Game7',
  parentChainId: 42161,
  rpc: process.env.RPC_2187
    ? [process.env.RPC_2187]
    : ['https://mainnet-rpc.game7.io'],
  stack: 'arbitrum',
}

export default config
