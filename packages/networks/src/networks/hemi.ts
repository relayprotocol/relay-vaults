import { ChildNetworkConfig } from '@relay-protocol/types'

export const hemi: ChildNetworkConfig = {
  assets: {
    weth: '0x4200000000000000000000000000000000000006',
    // TODO: add USDC
  },
  bridges: {
    optimism: {
      l1: {
        portalProxy: '0x39a0005415256B9863aFE2d55Edcf75ECc3A4D7e',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 43111,
  earliestBlock: 0, // Update with actual earliest block
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  l1ChainId: 1,
  name: 'Hemi',
  rpc: process.env.RPC_43111
    ? [process.env.RPC_43111]
    : ['https://rpc.hemi.network/rpc'],
  slug: 'hemi',
  stack: 'optimism',
}
