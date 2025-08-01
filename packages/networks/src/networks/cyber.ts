import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0x81759AdbF5520aD94da10991DfA29Ff147d3337b',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        maxBlocksWithoutProof: 300,
        outputOracle: '0xa669A743b065828682eE16109273F5CFeF5e676d',
        portalProxy: '0x1d59bc9fcE6B8E2B1bf86D4777289FFd83D24C99',
      },
    },
  },
  chainId: 7560,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  name: 'Cyber',
  parentChainId: 1,
  rpc: createRpcConfig(7560, ['https://cyber.rpc.thirdweb.com']),
  stack: 'optimism-alt',
}

export default config
