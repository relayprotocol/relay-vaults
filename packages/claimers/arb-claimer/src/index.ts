import { ethers } from 'ethers'
import {
  ChildTransactionReceipt,
  ChildToParentMessageStatus,
} from '@arbitrum/sdk'
import { networks } from '@relay-protocol/networks'

export const getProvider = (chainId: bigint | string | number) => {
  const { rpc } = networks[chainId.toString()]
  return new ethers.providers.JsonRpcProvider(rpc[0]) // pick the first rpc endpoint
}

export async function constructArbProof({
  childTransactionHash,
  childChainId,
  claimerPk = process.env.CLAIMER_PK,
}: {
  childTransactionHash: string
  childChainId: bigint | string
  claimerPk: string | undefined
}) {
  // get child provider
  if (!claimerPk) {
    throw new Error('Missing claimer private key')
  }

  // get tx receipt on child chain
  const childSigner = new ethers.Wallet(claimerPk)
  const childProvider = await getProvider(childChainId)
  const childRawReceipt =
    await childProvider.getTransactionReceipt(childTransactionHash)

  const childReceipt = new ChildTransactionReceipt(childRawReceipt)

  // read message from child chain tx
  const [childToParentMessage] =
    await childReceipt.getChildToParentMessages(childSigner)

  // Check /validate the message status
  const status = await childToParentMessage.status(childProvider)
  console.log(status)
  if (status === ChildToParentMessageStatus.UNCONFIRMED) {
    throw new Error('Message not confirmed yet')
  } else if (status === ChildToParentMessageStatus.EXECUTED) {
    throw new Error('Message already executed / claimed')
  } else if (status === ChildToParentMessageStatus.CONFIRMED) {
    // Get the proof data
    const proofData = await childToParentMessage.getOutboxProof(childProvider)
    console.log(proofData)
    return proofData
  }
  throw new Error(`Unexpected message status: ${status}`)
}
