import { Context, Event } from 'ponder:registry'
import { poolOrigin } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:OriginAdded'>
  context: Context<'RelayPool:OriginAdded'>
}) {
  const { origin } = event.args
  const poolAddress = event.log.address

  // Insert the pool origin
  await context.db
    .insert(poolOrigin)
    .values({
      bridgeFee: origin.bridgeFee,
      chainId: context.chain.id,
      coolDown: origin.coolDown,
      curator: origin.curator,
      currentOutstandingDebt: BigInt(0),
      maxDebt: origin.maxDebt,
      originBridge: origin.bridge as `0x${string}`,
      originChainId: origin.chainId,
      pool: poolAddress as `0x${string}`,
      proxyBridge: origin.proxyBridge as `0x${string}`,
    })
    .onConflictDoUpdate({
      bridgeFee: origin.bridgeFee,
      coolDown: origin.coolDown,
      curator: origin.curator,
      maxDebt: origin.maxDebt,
    })
}
