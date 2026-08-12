import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0xF242275d3a6527d877f2c927a82D9b057609cc71',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        // Lisk migrated to fault proofs (OptimismPortal2 v3.10.0): the legacy
        // L2OutputOracle no longer receives proposals.
        gameFactory: '0x0CF7D3706a27CCE2017aEB11E8a9c8b5388c282C',
        maxTimeWithoutProof: 7200,
        portalProxy: '0x26dB93F8b8b4f7016240af62F7730979d353f9A7',
      },
    },
  },
  chainId: 1135,
  hyperlaneHook: '0x9844aFFaBE17c37F791ff99ABa58B0FbB75e22AF',
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  name: 'Lisk',
  parentChainId: 1,
  rpc: createRpcConfig(1135, ['https://rpc.api.lisk.com']),
  stack: 'optimism',
}

export default config
