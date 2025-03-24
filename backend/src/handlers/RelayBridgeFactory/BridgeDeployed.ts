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

  await context.db.insert(relayBridge).values({
    asset: asset as `0x${string}`,
    chainId: context.network.chainId,
    contractAddress: bridge as `0x${string}`,
    createdAt: BigInt(new Date().getTime()),
    createdAtBlock: event.block.number,
    transferNonce: BigInt(0),
  })
}
