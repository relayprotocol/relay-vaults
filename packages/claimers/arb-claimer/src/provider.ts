import { ethers } from 'ethers'
import { networks } from '@relay-protocol/networks'

export const getProvider = (chainId: bigint | string | number) => {
  const { rpc } = networks[chainId.toString()]
  return new ethers.JsonRpcProvider(rpc[0]) // pick the first rpc endpoint
}

export const fetchRawBlock = async (
  chainId: bigint | string,
  blockHash: string
) => {
  const { rpc } = networks[chainId.toString()]
  const resp = await fetch(rpc[0], {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_getBlockByHash',
      params: [blockHash, true],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const json = await resp.json()
  return json.result
}
