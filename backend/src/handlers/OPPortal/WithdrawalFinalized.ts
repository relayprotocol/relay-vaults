import { eq } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { computeNativeBridgeStatus } from '../../utils/nativeBridgeStatus.js'

export default async function ({
  event,
  context,
}: {
  event: Event<'OPPortal:WithdrawalFinalized'>
  context: Context<'OPPortal:WithdrawalFinalized'>
}) {
  const finalizationTimestamp = event.block.timestamp
  const nativeBridgeFinalizedTxHash = event.transaction.hash

  // Finalize is terminal so the helper always returns FINALIZED here, but routing every
  // handler through computeNativeBridgeStatus keeps the write rule uniform across the codebase.
  const [existing] = await context.db.sql
    .select()
    .from(bridgeTransaction)
    .where(eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash))
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
    .where(eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash))
}
