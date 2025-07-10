import { Context, Event } from 'ponder:registry'
import { poolOrigin, relayPool } from 'ponder:schema'
import { logger } from '../../logger.js'
import { chainIdFromDomainId } from '../../utils/hyperlane.js'

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
  const originChainId = chainIdFromDomainId(event.args.chainId) // Convert from domainId

  // Get the actual maxDebt from the contract
  const origin = await context.client.readContract({
    abi: context.contracts.RelayPool.abi,
    address: poolAddress,
    functionName: 'authorizedOrigins',
    args: [event.args.chainId, event.args.bridge],
  })

  await context.db
    .update(poolOrigin, {
      chainId: context.chain.id,
      originBridge: event.args.bridge as `0x${string}`,
      originChainId,
      pool: poolAddress as `0x${string}`,
    })
    .set({ maxDebt: origin.maxDebt })
}
