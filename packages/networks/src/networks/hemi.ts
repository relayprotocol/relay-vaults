import { ChildNetworkConfig } from '@relay-protocol/types'

const config: ChildNetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
    // TODO: add USDC
  },
  bridges: {
    optimism: {
      child: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
      parent: {
        portalProxy: '0x39a0005415256B9863aFE2d55Edcf75ECc3A4D7e',
      },
    },
  },
  chainId: 43111,
  earliestBlock: 1570800,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  name: 'Hemi',
  parentChainId: 1,
  rpc: process.env.RPC_43111
    ? [process.env.RPC_43111]
    : ['https://rpc.hemi.network/rpc'],
  stack: 'optimism',
}

export default config
