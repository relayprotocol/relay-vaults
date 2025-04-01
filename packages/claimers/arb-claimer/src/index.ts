import { ethers } from 'ethers'
import { L2ToL1MessageStatus, L2ToL1MessageReader } from '@arbitrum/sdk'
import { networks } from '@relay-protocol/networks'
import { getProvider } from './provider'

export async function constructArbProof(
  l2TransactionHash: string,
  l2ChainId: bigint | string,
  l1ChainId = 11155111n, //default to sepolia
  l1Provider?: ethers.providers.Provider
) {
  if (!l1Provider) {
    l1Provider = await getProvider(l1ChainId)
  }

  const l2Provider = await getProvider(l2ChainId)
  const l2Receipt = await l2Provider.getTransactionReceipt(l2TransactionHash)

  // Get the L2ToL1MessageReader instance
  const l2ToL1MessageReader = new L2ToL1MessageReader(
    l1Provider,
    l2Provider,
    l2Receipt,
    networks[l1ChainId.toString()].bridges.arb!.outbox!
  )

  // Get the message status
  const messageStatus = await l2ToL1MessageReader.getStatus()
  if (messageStatus === L2ToL1MessageStatus.REDEEMED) {
    throw new Error('Message already redeemed')
  }

  // Get the proof data
  const proofData = await l2ToL1MessageReader.getProofData()

  return {
    arbBlockNum: proofData.arbBlockNum,
    caller: proofData.caller,
    callvalue: proofData.callvalue,
    data: proofData.data,
    destination: proofData.destination,
    ethBlockNum: proofData.ethBlockNum,
    leaf: proofData.leaf,
    proof: proofData.proof,
    timestamp: proofData.timestamp,
  }
}
