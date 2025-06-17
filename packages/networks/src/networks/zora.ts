import { ChildNetworkConfig } from '@relay-protocol/types'

// https://docs.zora.co/zora-network/network#zora-network-mainnet
const config: ChildNetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x1a0ad011913A150f69f6A19DF447A0CfD9551054',
        gameFactory: '0xB0F15106fa1e473Ddb39790f197275BC979Aa37e',
      },
    },
  },
  chainId: 7777777,
  earliestBlock: 29402000,
  hyperlaneHook: '0x18B0688990720103dB63559a3563f7E8d0f63EDb',
  hyperlaneMailbox: '0xF5da68b2577EF5C0A0D98aA2a58483a68C2f232a',
  isTestnet: false,
  name: 'Zora',
  parentChainId: 1,
  rpc: process.env.RPC_7777777
    ? [process.env.RPC_7777777]
    : ['https://rpc.zora.energy'],
  stack: 'optimism',
}

export default config
