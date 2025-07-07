import { Context, Event } from 'ponder:registry'
import { poolOrigin, relayPool } from 'ponder:schema'
import { logger } from '../../logger.js'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:OriginDisabled'>
  context: Context<'RelayPool:OriginDisabled'>
}) {
  const poolAddress = event.log.address

  const pool = await context.db.find(relayPool, {
    chainId: context.chain.id,
    contractAddress: poolAddress,
  })

  if (!pool) {
    logger.info(`Skipping origin disabled for non-curated pool ${poolAddress}`)
    return
  }

  await context.db.delete(poolOrigin, {
    chainId: context.chain.id,
    originBridge: event.args.bridge as `0x${string}`,
    originChainId: event.args.chainId,
    pool: poolAddress as `0x${string}`,
  })
}
