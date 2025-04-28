import { eq } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'OrbitOutbox:OutBoxTransactionExecuted'>
  context: Context<'OrbitOutbox:OutBoxTransactionExecuted'>
}) {
  await context.db.sql
    .update(bridgeTransaction)
    .set({
      finalizationTimestamp: event.block.timestamp,
      nativeBridgeFinalizedTxHash: event.transaction.hash,
      nativeBridgeStatus: 'FINALIZED',
    })
    .where(
      eq(bridgeTransaction.arbTransactionIndex, event.args.transactionIndex)
    )
}
