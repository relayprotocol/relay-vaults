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

  // FINALIZED is terminal: the helper resolves it from the finalization evidence alone,
  // so the SELECT of the existing row is unnecessary here.
  const nativeBridgeStatus = computeNativeBridgeStatus({
    finalizationTimestamp,
    nativeBridgeFinalizedTxHash,
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
