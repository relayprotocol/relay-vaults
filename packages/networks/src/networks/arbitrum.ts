import { VaultNetworkConfig } from '@relay-vaults/types'

const config: VaultNetworkConfig = {
  assets: {
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  chainId: 42161,
  hyperlaneMailbox: '0x979Ca5202784112f4738403dBec5D0F3B9daabB9',
  isTestnet: false,
  name: 'Arbitrum One',
  rpc: process.env.RPC_42161
    ? [process.env.RPC_42161]
    : ['https://arb1.arbitrum.io/rpc'],
  uniswapV3: {
    universalRouterAddress: '0xA51afAFe0263b40EdaEf0Df8781eA9aa03E381a3',
  },
}

export default config
