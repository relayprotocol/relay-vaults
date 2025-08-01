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
        maxBlocksWithoutProof: 1500,
        outputOracle: '0x113cB99283AF242Da0A0C54347667edF531Aa7d6',
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
  stack: 'optimism-alt',
}

export default config
