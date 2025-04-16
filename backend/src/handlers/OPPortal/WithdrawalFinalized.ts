import { eq, and } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayBridge:WithdrawalFinalized'>
  context: Context<'RelayBridge:WithdrawalFinalized'>
}) {
  await context.db.sql
    .update(bridgeTransaction)
    .set({
      nativeBridgeFinalizedTxHash: event.transaction.hash,
      nativeBridgeStatus: 'FINALIZED',
    })
    .where(
      and(
        eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash),
        eq(bridgeTransaction.nativeBridgeStatus, 'PROVEN')
      )
    )
}
