import { ChildNetworkConfig } from '@relay-protocol/types'

export const zkSyncSepolia: ChildNetworkConfig = {
  assets: {
    usdc: '0xAe045DE5638162fa134807Cb558E15A3F5A7F853',
    weth: '0x2D6Db36B3117802E996f13073A08A685D3FeF7eD',
  },
  bridges: {
    zksync: {
      child: {
        l1Messenger: '0x681A1AFdC2e06776816386500D2D461a6C96cB45',
        sharedDefaultBridge: '0x681A1AFdC2e06776816386500D2D461a6C96cB45',
      },
      parent: {
        nativeTokenVault: '0x746DBBa1edfBe1b547c87189eFE91B77d53d9E39',
        sharedDefaultBridge: '0x3E8b2fe58675126ed30d0d12dea2A9bda72D18Ae',
      },
    },
  },
  chainId: 300,
  earliestBlock: 0,
  hyperlaneMailbox: '0x1E45f767d51FA1Ec326d35e3BD4904fF0f30fCDa',
  isTestnet: true,
  name: 'ZKsync Sepolia Testnet',
  parentChainId: 11155111,
  rpc: process.env.RPC_300
    ? [process.env.RPC_300]
    : ['https://sepolia.era.zksync.dev'],
  slug: 'zksync-sepolia',
  stack: 'zksync',
}
