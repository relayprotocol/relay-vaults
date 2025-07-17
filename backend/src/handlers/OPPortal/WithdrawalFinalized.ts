import { eq, and } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'OPPortal:WithdrawalFinalized'>
  context: Context<'OPPortal:WithdrawalFinalized'>
}) {
  await context.db.sql
    .update(bridgeTransaction)
    .set({
      finalizationTimestamp: event.block.timestamp,
      nativeBridgeFinalizedTxHash: event.transaction.hash,
      nativeBridgeStatus: 'FINALIZED',
      updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    })
    .where(eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash))
}
