import { VaultNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: VaultNetworkConfig = {
  assets: {
    udt: '0x90DE74265a416e1393A450752175AED98fe11517',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  chainId: 1,
  curator: '0x1f06b7dd281Ca4D19d3E0f74281dAfDeC3D43963',
  hyperlaneMailbox: '0xc005dc82818d67AF737725bD4bf75435d065D239',
  isTestnet: false,
  name: 'Ethereum',
  rpc: createRpcConfig(1, [
    'https://mainnet.gateway.tenderly.co',
    'https://ethereum-rpc.publicnode.com',
    'https://cloudflare-eth.com/v1/mainnet',
  ]),
  uniswapV3: {
    universalRouterAddress: '0x66a9893cC07D91D95644AEDD05D03f95e1dBA8Af',
  },
}

export default config
