import { ChildNetworkConfig, L1NetworkConfig } from '@relay-vaults/types'

const config: ChildNetworkConfig & L1NetworkConfig = {
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
        outbox: '0xD4B80C3D7240325D18E645B49e6535A3Bf95cc58',
        rollup: '0xE7E8cCC7c381809BDC4b213CE44016300707B7Bd',
        routerGateway: '0xC840838Bc438d73C16c2f8b22D2Ce3669963cD48',
        maxBlocksWithoutProof: 500,
      },
    },
  },
  chainId: 42170,
  earliestBlock: 83282400,
  hyperlaneMailbox: '0x3a867fCfFeC2B790970eeBDC9023E75B0a172aa7',
  isTestnet: false,
  name: 'Arbitrum Nova',
  parentChainId: 1,
  rpc: process.env.RPC_42170
    ? [process.env.RPC_42170]
    : ['https://nova.arbitrum.io/rpc'],
  stack: 'arbitrum',
  uniswapV3: {
    universalRouterAddress: '0xa51afafe0263b40edaef0df8781ea9aa03e381a3',
  },
}

export default config
