import { Context, Event } from 'ponder:registry'
import { poolAction, relayPool, userBalance } from 'ponder:schema'
import { logger } from '../../logger.js'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:Withdraw'>
  context: Context<'RelayPool:Withdraw'>
}) {
  const { owner, receiver, assets, shares } = event.args
  const blockNumber = event.block.number
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp

  // Get the relay pool to find its yield pool
  const pool = await context.db.find(relayPool, {
    chainId: context.chain.id,
    contractAddress: event.log.address,
  })

  if (!pool) {
    logger.info(`Skipping withdraw for non-curated pool ${event.log.address}`)
    return
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
        chainId: context.chain.id,
        contractAddress: event.log.address,
      })
      .set({
        totalAssets: relayTotalAssets,
        totalShares: relayTotalShares,
        updatedAt: new Date(),
      }),

    // Record pool action
    context.db
      .insert(poolAction)
      .values({
        assets,
        blockNumber,
        chainId: context.chain.id,
        createdAt: new Date(),
        relayPool: event.log.address,
        shares,
        timestamp,
        transactionHash,
        type: 'WITHDRAW',
        updatedAt: new Date(),
        user: owner,
      })
      .onConflictDoNothing(),
  ])

  // Get user balance
  const user = await context.db.find(userBalance, {
    chainId: context.chain.id,
    relayPool: event.log.address,
    wallet: owner,
  })

  // Update user balance
  await context.db
    .update(userBalance, {
      chainId: context.chain.id,
      relayPool: event.log.address,
      wallet: owner,
    })
    .set({
      lastUpdated: timestamp,
      shareBalance: user.shareBalance - shares,
      totalWithdrawn: user.totalWithdrawn + assets,
      updatedAt: new Date(),
    })
}
