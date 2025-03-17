import { ethers, type JsonRpcResult } from 'ethers'
import { networks } from '@relay-protocol/networks'

export const getProvider = (chainId: bigint | string | number) => {
  const { rpc } = networks[chainId.toString()]
  const provider = new ethers.JsonRpcProvider(rpc[0]) // pick the first rpc endpoint
  return provider
}

// use for OP stack networks
export const fetchRawProof = async (
  slot: string,
  blockHash: string,
  chainId: bigint | string = 10n
) => {
  console.log({ blockHash, slot })
  const { rpc } = networks[chainId.toString()]
  const resp = await fetch(rpc[0], {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_getProof',
      params: [
        '0x4200000000000000000000000000000000000016', // MessagePasser
        [slot],
        blockHash,
      ],
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const res = await resp.json()
  console.log(res)
  const { result } = res as JsonRpcResult
  return result
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
      params: [blockHash, false],
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const { result } = (await resp.json()) as JsonRpcResult
  return result
}
