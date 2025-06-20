import { OriginNetworkConfig } from '@relay-vaults/types'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0xF242275d3a6527d877f2c927a82D9b057609cc71',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimismLegacy: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x26dB93F8b8b4f7016240af62F7730979d353f9A7',
        outputOracle: '0x113cB99283AF242Da0A0C54347667edF531Aa7d6',
        maxBlocksWithoutProof: 1500,
      },
    },
  },
  chainId: 1135,
  earliestBlock: 14049767,
  hyperlaneHook: '0x9844aFFaBE17c37F791ff99ABa58B0FbB75e22AF',
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  name: 'Lisk',
  parentChainId: 1,
  rpc: process.env.RPC_1135
    ? [process.env.RPC_1135]
    : ['https://rpc.api.lisk.com'],
  stack: 'optimism-legacy',
}

export default config
