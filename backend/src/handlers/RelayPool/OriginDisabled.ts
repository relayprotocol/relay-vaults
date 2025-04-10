import { Context, Event } from 'ponder:registry'
import { poolOrigin } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:OriginDisabled'>
  context: Context<'RelayPool:OriginDisabled'>
}) {
  const poolAddress = event.log.address

  await context.db.delete(poolOrigin, {
    chainId: context.network.chainId,
    originBridge: event.args.bridge as `0x${string}`,
    originChainId: event.args.chainId,
    pool: poolAddress as `0x${string}`,
  })
}
