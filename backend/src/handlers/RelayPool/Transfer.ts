import { Context, Event } from 'ponder:registry'
import { userBalance } from 'ponder:schema'
import { erc4626Abi, zeroAddress } from 'viem'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:Transfer'>
  context: Context<'RelayPool:Transfer'>
}) {
  const timestamp = event.block.timestamp
  const { to, from, amount: shares } = event.args
  if (from === zeroAddress || to === zeroAddress) {
    // Mint/burns are handled via deposits/withdrawals
    return
  }

  const assets = await context.client.readContract({
    abi: erc4626Abi,
    address: event.log.address,
    args: [shares],
    functionName: 'convertToAssets',
  })

  const user = await context.db.find(userBalance, {
    chainId: context.network.chainId,
    relayPool: event.log.address,
    wallet: event.args.from,
  })

  // Decrease the share balance of the sender
  await context.db
    .update(userBalance, {
      chainId: context.network.chainId,
      relayPool: event.log.address,
      wallet: event.args.from,
    })
    .set({
      lastUpdated: timestamp,
      shareBalance: user.shareBalance - shares,
      totalWithdrawn: user.totalWithdrawn + assets,
      updatedAt: new Date(),
    })

  // Increase the share balance of the recipient
  await context.db
    .insert(userBalance)
    .values({
      chainId: context.network.chainId,
      createdAt: new Date(),
      lastUpdated: timestamp,
      relayPool: event.log.address,
      shareBalance: shares,
      totalDeposited: assets,
      totalWithdrawn: 0n,
      updatedAt: new Date(),
      wallet: to,
    })
    .onConflictDoUpdate((row) => ({
      lastUpdated: timestamp,
      shareBalance: row.shareBalance + shares,
      totalDeposited: row.totalDeposited + assets,
      updatedAt: new Date(),
    }))
}
