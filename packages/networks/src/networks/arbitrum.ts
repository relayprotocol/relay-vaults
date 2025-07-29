import { OriginNetworkConfig, VaultNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: VaultNetworkConfig & OriginNetworkConfig = {
  assets: {
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        routerGateway: '0x5288c571Fd7aD117beA99bF60FE0846C4E84F933',
      },
      parent: {
        inbox: '0xc4448b71118c9071Bcb9734A0EAc55D18A153949',
        maxBlocksWithoutProof: 500,
        outbox: '0xD4B80C3D7240325D18E645B49e6535A3Bf95cc58',
        rollup: '0xE7E8cCC7c381809BDC4b213CE44016300707B7Bd',
        routerGateway: '0xC840838Bc438d73C16c2f8b22D2Ce3669963cD48',
      },
    },
  },
  chainId: 42161,
  curator: '0x1f06b7dd281Ca4D19d3E0f74281dAfDeC3D43963',
  hyperlaneMailbox: '0x979Ca5202784112f4738403dBec5D0F3B9daabB9',
  isTestnet: false,
  name: 'Arbitrum One',
  parentChainId: 1,
  rpc: createRpcConfig(42161, ['https://arb1.arbitrum.io/rpc']),
  stack: 'arbitrum',
  uniswapV3: {
    universalRouterAddress: '0xA51afAFe0263b40EdaEf0Df8781eA9aa03E381a3',
  },
}

export default config
