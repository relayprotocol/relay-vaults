import { ChildNetworkConfig } from '@relay-protocol/types'

const config: ChildNetworkConfig = {
  assets: {
    usdc: '0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x88e529A6ccd302c948689Cd5156C83D4614FAE92',
        gameFactory: '0x512a3d2c7a43bd9261d2b8e8c9c70d4bd4d503c0',
        maxTimeWithoutProof: 7200,
      },
    },
  },
  chainId: 1868,
  earliestBlock: 5241889,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  name: 'Soneium',
  parentChainId: 1,
  rpc: ['https://rpc.soneium.org'],
  stack: 'optimism',
}

export default config
