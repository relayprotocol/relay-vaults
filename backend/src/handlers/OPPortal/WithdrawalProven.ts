import networks from '@relay-vaults/networks'
import { OriginNetworkConfig } from '@relay-vaults/types'
import { SEVEN_DAYS } from '../../constants'
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
  const networkConfig = networks[context.chain.id] as OriginNetworkConfig
  const delay = BigInt(networkConfig.withdrawalDelay || SEVEN_DAYS)

  await context.db.sql
    .update(bridgeTransaction)
    .set({
      expectedFinalizationTimestamp: event.block.timestamp + delay,
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
