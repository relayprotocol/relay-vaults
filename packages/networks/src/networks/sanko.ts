import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0x13D675BC5e659b11CFA331594cF35A20815dCF02',
    weth: '0xB1116517a980DA056E05Fa521d524E1AFD8D885f',
  },
  bridges: {
    arbitrum: {
      child: {
        arbSys: '0x0000000000000000000000000000000000000064',
        routerGateway: '',
      },
      parent: {
        maxBlocksWithoutProof: 500,
        outbox: '0x575d32f7ff0C72921645e302cb14d2757E300786',
        rollup: '0x9A59EdF7080fdA05396373a85DdBf2cEBDB81Cd4',
        routerGateway: '',
      },
    },
  },
  chainId: 1996,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  name: 'Sanko',
  parentChainId: 42161,
  rpc: createRpcConfig(1996, ['https://mainnet.sanko.xyz']),
  stack: 'arbitrum',
}

export default config
