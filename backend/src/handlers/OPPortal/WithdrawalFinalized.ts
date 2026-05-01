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

  // FINALIZED is terminal: the helper resolves it from the finalization evidence alone,
  // so we can skip a SELECT of the existing row. Going through the helper keeps the
  // mapping from evidence to status in one place.
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
    .where(eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash))
}
