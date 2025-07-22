import { Context, Event } from 'ponder:registry'
import { poolOrigin, relayPool } from 'ponder:schema'
import { BPS_DIVISOR } from '../../constants.js'
import { logger } from '../../logger.js'
import { chainIdFromDomainId } from '@relay-vaults/helpers'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:OriginAdded'>
  context: Context<'RelayPool:OriginAdded'>
}) {
  // @ts-expect-error - event.args is not properly typed
  const { origin } = event.args
  const poolAddress = event.log.address

  const originChainId = chainIdFromDomainId(origin.chainId)
  const pool = await context.db.find(relayPool, {
    chainId: context.chain.id,
    contractAddress: poolAddress,
  })

  if (!pool) {
    logger.info(`Skipping origin added for non-curated pool ${poolAddress}`)
    return
  }

  const fractionalBpsDenominator = (await context.client.readContract({
    abi: context.contracts.RelayPool.abi,
    address: event.log.address,
    functionName: 'FRACTIONAL_BPS_DENOMINATOR',
  })) as bigint

  const bridgeFeeInBps = Number(
    (BigInt(origin.bridgeFee) * BPS_DIVISOR) / fractionalBpsDenominator
  )

  // Insert the pool origin
  await context.db
    .insert(poolOrigin)
    .values({
      bridgeFee: bridgeFeeInBps,
      chainId: context.chain.id,
      coolDown: origin.coolDown,
      createdAt: new Date(),
      curator: origin.curator,
      currentOutstandingDebt: BigInt(0),
      maxDebt: origin.maxDebt,
      originBridge: origin.bridge as `0x${string}`,
      originChainId,
      pool: poolAddress as `0x${string}`,
      proxyBridge: origin.proxyBridge as `0x${string}`,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      bridgeFee: bridgeFeeInBps,
      coolDown: origin.coolDown,
      curator: origin.curator,
      maxDebt: origin.maxDebt,
      updatedAt: new Date(),
    })
}
