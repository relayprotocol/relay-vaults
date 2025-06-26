import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0x750ba8b76187092B0D1E87E28daaf484d1b5273b',
    weth: '0x765277EebeCA2e31912C9946eAe1021199B39C61',
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
  chainId: 42170,
  hyperlaneMailbox: '0x3a867fCfFeC2B790970eeBDC9023E75B0a172aa7',
  isTestnet: false,
  name: 'Arbitrum Nova',
  parentChainId: 1,
  rpc: createRpcConfig(42170, ['https://nova.arbitrum.io/rpc']),
  stack: 'arbitrum',
}

export default config
