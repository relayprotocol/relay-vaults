/**
 * Relay Pool Snapshot Handler
 *
 * This interval handler captures periodic snapshots of all relay pools details by reading
 * current state from the vault contracts.
 */

import { eq } from 'ponder'
import { ponder } from 'ponder:registry'
import { relayPool } from 'ponder:schema'

ponder.on('RelayPoolSnapshot:block', async ({ event, context }) => {
  // Retrieve all relay pools for the current chain
  const pools = await context.db.sql
    .select()
    .from(relayPool)
    // @ts-expect-error - context.chain.id is not typed properly in Ponder
    .where(eq(relayPool.chainId, context.chain.id))
    .execute()

  // Skip execution if no pools exist yet
  if (pools.length === 0) {
    return
  }

  for (const pool of pools) {
    try {
      // Read current state from the vault contract
      const [totalAssets, totalShares, decimals] = await Promise.all([
        context.client.readContract({
          abi: context.contracts.RelayPool.abi,
          address: pool.contractAddress,
          functionName: 'totalAssets',
        }),
        context.client.readContract({
          abi: context.contracts.RelayPool.abi,
          address: pool.contractAddress,
          functionName: 'totalSupply',
        }),
        context.client.readContract({
          abi: context.contracts.RelayPool.abi,
          address: pool.contractAddress,
          functionName: 'decimals',
        }),
      ])

      // Update the relay pool with current values
      await context.db
        .update(relayPool, {
          chainId: pool.chainId,
          contractAddress: pool.contractAddress,
        })
        .set({
          decimals: Number(decimals),
          totalAssets: BigInt(totalAssets as string),
          totalShares: BigInt(totalShares as string),
        })
    } catch (error) {
      console.error(
        `Failed to update relay pool ${pool.contractAddress} on chain ${pool.chainId}:`,
        error
      )
    }
  }
})
