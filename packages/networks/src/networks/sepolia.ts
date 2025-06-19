import { VaultNetworkConfig } from '@relay-vaults/types'

const config: VaultNetworkConfig = {
  assets: {
    udt: '0x4C38B5Dcc47c4990363F22bFeb2add741123914F',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    weth: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  },
  chainId: 11155111,
  earliestBlock: 7900000,
  hyperlaneMailbox: '0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766',
  isTestnet: true,

  name: 'Ethereum Sepolia',

  rpc: process.env.RPC_11155111
    ? [process.env.RPC_11155111]
    : ['https://ethereum-sepolia-rpc.publicnode.com'],
  uniswapV3: {
    universalRouterAddress: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  },
}

export default config
