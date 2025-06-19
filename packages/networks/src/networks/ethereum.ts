import { VaultNetworkConfig } from '@relay-vaults/types'

const config: VaultNetworkConfig = {
  assets: {
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  chainId: 1,
  earliestBlock: 22000000,
  hyperlaneMailbox: '0xc005dc82818d67AF737725bD4bf75435d065D239',
  isTestnet: false,
  name: 'Ethereum',
  rpc: process.env.RPC_1
    ? [process.env.RPC_1]
    : ['https://mainnet.gateway.tenderly.co'],
  uniswapV3: {
    universalRouterAddress: '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B',
  },
}

export default config
