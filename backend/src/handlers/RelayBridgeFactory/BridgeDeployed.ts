import { Context, Event } from 'ponder:registry'
import { relayBridge } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayBridgeFactory:BridgeDeployed'>
  context: Context<'RelayBridgeFactory:BridgeDeployed'>
}) {
  const { bridge, asset } = event.args

  await context.db
    .insert(relayBridge)
    .values({
      asset: asset as `0x${string}`,
      chainId: context.chain.id,
      contractAddress: bridge as `0x${string}`,
      createdAt: new Date(),
      createdAtBlock: event.block.number,
      transferNonce: BigInt(0),
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
}
