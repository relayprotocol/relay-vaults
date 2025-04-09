import { L2NetworkConfig } from '@relay-protocol/types'

export const lisk: L2NetworkConfig = {
  assets: {
    usdc: '0xF242275d3a6527d877f2c927a82D9b057609cc71',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      l1: {
        portalProxy: '0x26dB93F8b8b4f7016240af62F7730979d353f9A7',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 1135,
  earliestBlock: 14049767,
  hyperlaneHook: '0x9844aFFaBE17c37F791ff99ABa58B0FbB75e22AF',
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  l1ChainId: 1,
  name: 'Lisk',
  rpc: process.env.RPC_1135
    ? [process.env.RPC_1135]
    : ['https://rpc.api.lisk.com'],
  slug: 'lisk',
  stack: 'optimism',
}
