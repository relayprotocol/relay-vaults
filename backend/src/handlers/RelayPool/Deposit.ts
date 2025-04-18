import { Context, Event } from 'ponder:registry'
import { poolAction, relayPool, userBalance } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:Deposit'>
  context: Context<'RelayPool:Deposit'>
}) {
  const { owner, assets, shares } = event.args
  const blockNumber = event.block.number
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp

  // Get the relay pool to find its yield pool
  const pool = await context.db.find(relayPool, {
    chainId: context.network.chainId,
    contractAddress: event.log.address,
  })

  if (!pool) {
    throw new Error(`Relay pool ${event.log.address} not found`)
  }

  // Fetch current state from relay pool
  const [relayTotalAssets, relayTotalShares] = await Promise.all([
    context.client.readContract({
      abi: context.contracts.RelayPool.abi,
      address: event.log.address,
      functionName: 'totalAssets',
    }),
    context.client.readContract({
      abi: context.contracts.RelayPool.abi,
      address: event.log.address,
      functionName: 'totalSupply',
    }),
  ])

  // Update states
  await Promise.all([
    // Update relay pool
    context.db
      .update(relayPool, {
        chainId: context.network.chainId,
        contractAddress: event.log.address,
      })
      .set({
        totalAssets: relayTotalAssets,
        totalShares: relayTotalShares,
      }),

    // Record pool action
    context.db
      .insert(poolAction)
      .values({
        assets,
        blockNumber,
        chainId: context.network.chainId,
        owner: event.log.address,
        receiver: event.log.address,
        relayPool: event.log.address,
        shares,
        timestamp,
        transactionHash,
        type: 'DEPOSIT',
        user: owner,
      })
      .onConflictDoNothing(),
  ])

  await context.db
    .insert(userBalance)
    .values({
      chainId: context.network.chainId,
      lastUpdated: timestamp,
      relayPool: event.log.address,
      shareBalance: shares,
      totalDeposited: assets,
      totalWithdrawn: 0n,
      wallet: owner,
    })
    .onConflictDoUpdate((row) => ({
      lastUpdated: timestamp,
      shareBalance: row.shareBalance + shares,
      totalDeposited: row.totalDeposited + assets,
    }))
}
