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
        // Cyber migrated to fault proofs (OptimismPortal2 v3.10.0): the legacy
        // L2OutputOracle no longer receives proposals.
        gameFactory: '0xaCc66304d26a01A9bd60d0584dCEdbaCeC8e10e0',
        maxTimeWithoutProof: 21600,
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
  stack: 'optimism',
}

export default config
