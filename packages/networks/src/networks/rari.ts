import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6',
    weth: '0xf037540e51D71b2D2B1120e8432bA49F29EDFBD0',
  },
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        routerGateway: '0x9a2859B2a83148b8DE25d26643B5407555D219E1',
      },
      parent: {
        maxBlocksWithoutProof: 500,
        outbox: '0x91591BB66075BCfF94AA128B003134165C3Ab83a',
        rollup: '0x2e988Ea0873C9d712628F0bf38DAFdE754927C89',
        routerGateway: '0x2623C144B4d167f70893f6A8968B98c89a6C5F97',
      },
    },
  },
  chainId: 1380012617,
  hyperlaneMailbox: '0x65dCf8F6b3f6a0ECEdf3d0bdCB036AEa47A1d615',
  isTestnet: false,
  name: 'Rari',
  parentChainId: 42161,
  rpc: createRpcConfig(2187, ['https://mainnet.rpc.rarichain.org/http']),
  stack: 'arbitrum',
}

export default config
