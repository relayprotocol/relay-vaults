import { eq, and } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'OPPortal:WithdrawalProven'>
  context: Context<'OPPortal:WithdrawalProven'>
}) {
  await context.db.sql
    .update(bridgeTransaction)
    .set({
      nativeBridgeStatus: 'PROVEN',
      opProofTxHash: event.transaction.hash,
    })
    .where(
      and(
        eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash),
        eq(bridgeTransaction.nativeBridgeStatus, 'INITIATED')
      )
    )
}
