import { ChildNetworkConfig } from '@relay-vaults/types'

const config: ChildNetworkConfig = {
  assets: {
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
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
        gameFactory: '0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e',
        maxTimeWithoutProof: 3600,
      },
    },
  },
  chainId: 8453,
  earliestBlock: 0,
  hyperlaneMailbox: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  isTestnet: false,
  name: 'Base',
  parentChainId: 1,
  rpc: process.env.RPC_8453
    ? [process.env.RPC_8453]
    : ['https://gateway.tenderly.co/public/base'],
  stack: 'optimism',
}

export default config
