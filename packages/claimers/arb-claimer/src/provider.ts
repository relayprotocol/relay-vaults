import { ethers } from 'ethers'
import { networks } from '@relay-protocol/networks'

export const getProvider = (chainId: bigint | string | number) => {
  const { rpc } = networks[chainId.toString()]
  return new ethers.providers.JsonRpcProvider(rpc[0]) // pick the first rpc endpoint
}
