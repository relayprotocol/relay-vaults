import { eq } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { computeNativeBridgeStatus } from '../../utils/nativeBridgeStatus.js'

export default async function ({
  event,
  context,
}: {
  event: Event<'OrbitOutbox:OutBoxTransactionExecuted'>
  context: Context<'OrbitOutbox:OutBoxTransactionExecuted'>
}) {
  const finalizationTimestamp = event.block.timestamp
  const nativeBridgeFinalizedTxHash = event.transaction.hash

  const [existing] = await context.db.sql
    .select()
    .from(bridgeTransaction)
    .where(
      eq(bridgeTransaction.arbTransactionIndex, event.args.transactionIndex)
    )
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
    .where(
      eq(bridgeTransaction.arbTransactionIndex, event.args.transactionIndex)
    )
}
