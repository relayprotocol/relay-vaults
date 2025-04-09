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
      nativeBridgeStatus: 'FINALIZED',
      opProofTxHash: event.transaction.hash,
    })
    .where(
      and(
        eq(bridgeTransaction.opWithdrawalHash, event.args.withdrawalHash),
        eq(bridgeTransaction.nativeBridgeStatus, 'PROVEN')
      )
    )
}
