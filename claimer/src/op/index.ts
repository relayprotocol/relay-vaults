import { buildProveWithdrawal } from '@relay-protocol/helper-bedrock'
import { ABIs } from '@relay-protocol/helpers'

import networks from '@relay-protocol/networks'
import { ethers } from 'ethers'
import { getSignerForNetwork } from '../signer'

export const submitProof = async ({
  originChainId,
  originTxHash,
  destinationPoolChainId,
}) => {
  const destinationNetwork = networks[destinationPoolChainId.toString()]

  const signer = await getSignerForNetwork(destinationNetwork)
  const finalizeParams = await buildProveWithdrawal(
    originChainId,
    originTxHash,
    Number(destinationPoolChainId)
  )

  const portal = new ethers.Contract(
    destinationNetwork.bridges.op!.portalProxy!,
    ABIs.Portal2,
    signer
  )
  const tx = await portal.proveWithdrawalTransaction(
    finalizeParams.transaction,
    finalizeParams.disputeGameIndex,
    finalizeParams.outputRootProof,
    finalizeParams.withdrawalProof
  )
  await tx.wait()
  return tx.hash
}

export default {
  submitProof,
}
