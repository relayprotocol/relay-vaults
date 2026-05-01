import networks from '@relay-vaults/networks'
import { eq } from 'ponder'
import { ABIs } from '@relay-vaults/helpers'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { decodeFunctionData, Hex, keccak256 } from 'viem'
import { computeNativeBridgeStatus } from '../../utils/nativeBridgeStatus.js'

/**
 * Extract the L2-to-L1 message from the finalization tx input.
 *
 * Supports both the legacy flat-args `finalizeWithdrawal` and the newer
 * struct-based `finalizeDeposit` (FinalizeL1DepositParams) entry points
 * on the L1Nullifier / shared bridge.
 */
function extractMessage(
  txInput: Hex
): Hex | undefined {
  const { functionName, args } = decodeFunctionData({
    abi: ABIs.L1Nullifier,
    data: txInput,
  })

  if (functionName === 'finalizeWithdrawal') {
    // Legacy flat args: (_chainId, _l2BatchNumber, _l2MessageIndex, _l2TxNumberInBatch, _message, _merkleProof)
    return args![4] as Hex
  }

  if (functionName === 'finalizeDeposit') {
    // Newer struct: FinalizeL1DepositParams { chainId, l2BatchNumber, l2MessageIndex, l2Sender, l2TxNumberInBatch, message, merkleProof }
    const params = args![0] as { message: Hex }
    return params.message
  }

  return undefined
}

export default async function ({
  event,
  context,
}: {
  event: Event<'L1NativeTokenVault:BridgeMint'>
  context: Context<'L1NativeTokenVault:BridgeMint'>
}) {
  const originNetwork = networks[event.args.chainId]
  if (originNetwork?.bridges?.zksync?.parent.sharedDefaultBridge) {
    if (
      event.transaction.to.toLowerCase() ==
      originNetwork?.bridges?.zksync?.parent.sharedDefaultBridge.toLowerCase()
    ) {
      const message = extractMessage(event.transaction.input)
      if (message) {
        const expectedKey = keccak256(message)
        const finalizationTimestamp = event.block.timestamp
        const nativeBridgeFinalizedTxHash = event.transaction.hash

        const [existing] = await context.db.sql
          .select()
          .from(bridgeTransaction)
          .where(eq(bridgeTransaction.zksyncWithdrawalHash, expectedKey))
          .limit(1)

        if (!existing) {
          return
        }

        const nativeBridgeStatus = computeNativeBridgeStatus({
          finalizationTimestamp,
          loanEmittedTxHash: existing.loanEmittedTxHash,
          nativeBridgeFinalizedTxHash,
          opProofTxHash: existing.opProofTxHash,
        })

        await context.db.sql
          .update(bridgeTransaction)
          .set({
            finalizationTimestamp,
            nativeBridgeFinalizedTxHash,
            nativeBridgeStatus,
            updatedAt: new Date(),
          })
          .where(eq(bridgeTransaction.zksyncWithdrawalHash, expectedKey))
      }
    }
  }
}
