import { OriginNetworkConfig } from '@relay-vaults/types'
import { createRpcConfig } from '../utils'

const config: OriginNetworkConfig = {
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
        maxBlocksWithoutProof: 200,
        outputOracle: '0x6daF3a3497D8abdFE12915aDD9829f83A79C0d51',
        portalProxy: '0x39a0005415256B9863aFE2d55Edcf75ECc3A4D7e',
      },
    },
  },
  chainId: 43111,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  isTestnet: false,
  name: 'Hemi',
  parentChainId: 1,
  rpc: createRpcConfig(43111, ['https://rpc.hemi.network/rpc']),
  stack: 'optimism-alt',
}

export default config
