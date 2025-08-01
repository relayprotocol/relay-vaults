import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
  assets: {
    usdc: '0x97423A68BAe94b5De52d767a17aBCc54c157c0E5',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        maxBlocksWithoutProof: 500,
        outputOracle: '0xB09DC08428C8b4EFB4ff9C0827386CDF34277996',
        portalProxy: '0x639F2AECE398Aa76b07e59eF6abe2cFe32bacb68',
      },
    },
  },
  chainId: 888888888,
  hyperlaneMailbox: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  isTestnet: false,
  name: 'Ancient8',
  parentChainId: 1,
  rpc: createRpcConfig(888888888, ['https://rpc.ancient8.gg']),
  stack: 'optimism-alt',
}

export default config
