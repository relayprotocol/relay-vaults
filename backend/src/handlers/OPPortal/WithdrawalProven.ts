import networks from '@relay-vaults/networks'
import { OriginNetworkConfig } from '@relay-vaults/types'
import { SEVEN_DAYS } from '../../constants'
import { eq } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { computeNativeBridgeStatus } from '../../utils/nativeBridgeStatus.js'

export default async function ({
  event,
  context,
}: {
  event: Event<'OPPortal:WithdrawalProven'>
  context: Context<'OPPortal:WithdrawalProven'>
}) {
  const networkConfig = networks[context.chain.id] as OriginNetworkConfig
  const delay = BigInt(networkConfig.withdrawalDelay || SEVEN_DAYS)
  const opProofTxHash = event.transaction.hash

  // Read the existing row so the recomputed status reflects the union of every hash field,
  // not just the proof we are about to write. Prevents a later LoanEmitted from clobbering this back to HANDLED.
  const [existing] = await context.db.sql
    .select()
    .from(bridgeTransaction)
    .where(eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash))
    .limit(1)

  if (!existing) {
    return
  }

  const nativeBridgeStatus = computeNativeBridgeStatus({
    finalizationTimestamp: existing.finalizationTimestamp,
    loanEmittedTxHash: existing.loanEmittedTxHash,
    nativeBridgeFinalizedTxHash: existing.nativeBridgeFinalizedTxHash,
    opProofTxHash,
  })

  await context.db.sql
    .update(bridgeTransaction)
    .set({
      expectedFinalizationTimestamp: event.block.timestamp + delay,
      nativeBridgeStatus,
      opProofTxHash,
      updatedAt: new Date(),
    })
    .where(eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash))
}
