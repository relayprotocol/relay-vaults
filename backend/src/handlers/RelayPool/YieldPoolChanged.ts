import { eq, and } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { relayPool } from 'ponder:schema'
import { logger } from '../../logger.js'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:YieldPoolChanged'>
  context: Context<'RelayPool:YieldPoolChanged'>
}) {
  const poolAddress = event.log.address
  const pool = await context.db.find(relayPool, {
    chainId: context.chain.id,
    contractAddress: poolAddress,
  })

  if (!pool) {
    logger.info(
      `Skipping yield pool change for non-curated pool ${poolAddress}`
    )
    return
  }

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
