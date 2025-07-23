import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
    // TODO: add USDC
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        gameFactory: '0x96123dbFC3253185B594c6a7472EE5A21E9B1079',
        maxTimeWithoutProof: 3600 * 12, // 12 h in seconds
        portalProxy: '0x8AdeE124447435fE03e3CD24dF3f4cAE32E65a3E',
      },
    },
  },
  chainId: 60808,
  hyperlaneMailbox: '0x8358D8291e3bEDb04804975eEa0fe9fe0fAfB147',
  isTestnet: false,
  name: 'BOB',
  parentChainId: 1,
  rpc: createRpcConfig(60808, ['https://rpc.gobob.xyz']),
  stack: 'optimism',
}

export default config
