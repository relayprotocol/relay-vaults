import { and, eq } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { relayPool, timelock } from 'ponder:schema'
import { logger } from '../../logger.js'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:OwnershipTransferred'>
  context: Context<'RelayPool:OwnershipTransferred'>
}) {
  const { newOwner } = event.args
  const poolAddress = event.log.address

  const pool = await context.db.find(relayPool, {
    chainId: context.chain.id,
    contractAddress: poolAddress,
  })

  if (!pool) {
    logger.info(
      `Skipping ownership transfer for non-curated pool ${poolAddress}`
    )
    return
  }

  // Update the curator of the pool
  await context.db.sql
    .update(relayPool)
    .set({
      curator: newOwner as `0x${string}`,
      updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    })
    .where(
      and(
        eq(relayPool.chainId, context.chain.id),
        eq(relayPool.contractAddress, event.log.address)
      )
    )

  // Let's add the timelock.
  await context.db
    .insert(timelock)
    .values({
      chainId: context.chain.id,
      contractAddress: newOwner as `0x${string}`,
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
      updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    })
    .onConflictDoNothing()

  // Remove the previous curator...
}
