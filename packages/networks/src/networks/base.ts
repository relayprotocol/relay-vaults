import { NetworkConfig } from '@relay-protocol/types'

export const base: NetworkConfig = {
  chainId: 8453,
  isTestnet: false,
  name: 'Base',
  slug: 'base',
  hyperlaneMailbox: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  bridges: {
    cctp: {
      domain: 6n,
      messenger: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
      transmitter: '0xAD09780d193884d503182aD4588450C416D6F9D4',
    },
  },
  assets: {
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
}
