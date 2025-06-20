import { eq, and } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { relayPool } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:YieldPoolChanged'>
  context: Context<'RelayPool:YieldPoolChanged'>
}) {
  await context.db.sql
    .update(relayPool)
    .set({
      yieldPool: event.args.newPool as `0x${string}`,
    })
    .where(
      and(
        eq(relayPool.chainId, context.chain.id),
        eq(relayPool.contractAddress, event.log.address as `0x${string}`)
      )
    )
}
