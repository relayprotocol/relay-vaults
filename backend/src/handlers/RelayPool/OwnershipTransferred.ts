import { and, eq } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { relayPool, timelock } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:OwnershipTransferred'>
  context: Context<'RelayPool:OwnershipTransferred'>
}) {
  const { previousOwner, newOwner } = event.args

  // Update the curator of the pool
  await context.db.sql
    .update(relayPool)
    .set({
      curator: newOwner as `0x${string}`,
    })
    .where(
      and(
        eq(relayPool.chainId, context.network.chainId),
        eq(relayPool.contractAddress, event.log.address)
      )
    )

  // Let's add the timelock.
  await context.db
    .insert(timelock)
    .values({
      chainId: context.network.chainId,
      contractAddress: newOwner as `0x${string}`,
    })
    .onConflictDoNothing()

  // Remove the previous curator...
}
