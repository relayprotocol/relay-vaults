import { OriginNetworkConfig, VaultNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig & VaultNetworkConfig = {
  assets: {
    udt: '0xD7eA82D19f1f59FF1aE95F1945Ee6E6d86A25B96',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    cctp: {
      child: {
        domain: 6n,
        messenger: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
        transmitter: '0xAD09780d193884d503182aD4588450C416D6F9D4',
      },
      parent: {
        domain: 0n,
        messenger: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
        transmitter: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
      },
    },
    everclear: {
      domainId: 8453,
      feeAdapter: '0x15a7cA97D1ed168fB34a4055CEFa2E2f9Bdb6C75',
      spoke: '0xa05A3380889115bf313f1Db9d5f335157Be4D816',
    },
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        gameFactory: '0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e',
        maxTimeWithoutProof: 3600,
        portalProxy: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
      },
    },
  },
  chainId: 8453,
  hyperlaneMailbox: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  isTestnet: false,
  name: 'Base',
  parentChainId: 1,
  rpc: createRpcConfig(8453, ['https://gateway.tenderly.co/public/base']),
  stack: 'optimism',
  uniswapV3: {
    universalRouterAddress: '0x6fF5693b99212Da76ad316178A184AB56D299b43',
  },
}

export default config
