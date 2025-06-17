/**
 * Vault Snapshot Handler
 *
 * This interval handler captures periodic snapshots of both the vault's share price and the
 * associated base yield pool's share price. For each vault (relay pool), it:
 * 1. Retrieves the vault's share price by reading the decimals and computing the share unit
 *    from the vault's contract.
 * 2. Retrieves the yield pool's share price via its contract address stored in the vault record.
 * 3. Creates a unique snapshot ID by combining the vault address, chain ID, and block number.
 * 4. Stores the snapshot with block metadata in the vaultSnapshot table.
 */

import { eq } from 'ponder'
import { ponder } from 'ponder:registry'
import { vaultSnapshot, relayPool, yieldPool } from 'ponder:schema'
import { erc4626Abi, erc20Abi } from 'viem'

/**
 * Helper to calculate apy from price data
 */
function calculateAPY(
  currentPrice: number,
  startingPrice: number,
  currentTimestamp: number,
  startingTimestamp: number
): string | null {
  if (startingPrice <= 0 || currentPrice === startingPrice) return null

  const deltaTime = currentTimestamp - startingTimestamp
  if (deltaTime <= 0) return null

  const secondsPerYear = 365 * 24 * 3600
  const growthFactor = currentPrice / startingPrice
  const apyValue = Math.pow(growthFactor, secondsPerYear / deltaTime) - 1
  const apyPercentage = apyValue * 100

  return apyPercentage.toFixed(2)
}
/**
 * Helper to pick a reference snapshot.
 * If intervalSeconds is provided (>0), it returns the snapshot whose timestamp is
 * the first one *before* (currentTimestamp - intervalSeconds). Otherwise it
 * returns the very first (oldest) snapshot (default behaviour).
 */
function selectSnapshot(
  snapshots: any[],
  priceField: string,
  currentTimestamp: number,
  intervalSeconds?: number
) {
  if (snapshots.length === 0) return null

  // Default: oldest snapshot
  if (!intervalSeconds || intervalSeconds <= 0) {
    const snap = snapshots[0]
    return {
      price: Number(snap[priceField]),
      timestamp: Number(snap.timestamp),
    }
  }

  const targetTimestamp = currentTimestamp - intervalSeconds

  // Iterate from newest to oldest to find the first snap at or before the target timestamp
  for (let i = snapshots.length - 1; i >= 0; i--) {
    const snap = snapshots[i]
    if (Number(snap.timestamp) <= targetTimestamp) {
      return {
        price: Number(snap[priceField]),
        timestamp: Number(snap.timestamp),
      }
    }
  }

  // if no snapshot meets the interval requirement, fallback to oldest
  const fallback = snapshots[0]
  return {
    price: Number(fallback[priceField]),
    timestamp: Number(fallback.timestamp),
  }
}

// Determine APY interval (seconds)
const APY_INTERVAL_SEC = 7 * 24 * 3600 // 7-day window; for all-time, we set to 0

ponder.on('VaultSnapshot:block', async ({ event, context }) => {
  // Helper function to fetch share price using a contract's address
  async function fetchSharePrice(contractAddress: string) {
    // Retrieve the contract's decimals
    const decimals = await context.client.readContract({
      abi: erc20Abi,
      address: contractAddress,
      functionName: 'decimals',
    })

    // Calculate the share unit using the contract's decimals
    const shareUnit = BigInt(10) ** BigInt(decimals)

    // Query the current share price from convertToAssets with the calculated share unit
    const sharePrice = await context.client.readContract({
      abi: erc4626Abi,
      address: contractAddress,
      args: [shareUnit],
      functionName: 'convertToAssets',
    })

    return sharePrice
  }

  // Retrieve all vaults from the relayPool table
  const vaults = await context.db.sql
    .select()
    .from(relayPool)
    .where(eq(relayPool.chainId, context.network.chainId))
    .execute()

  // Skip operation if no vaults exist yet
  if (vaults.length === 0) {
    return
  }

  for (const vault of vaults) {
    // Skip if the vault has no yield pool
    if (!vault.yieldPool) {
      console.warn(
        `Vault ${vault.contractAddress} has no valid yield pool, skipping...`
      )
      continue
    }

    // Fetch vault and yield pool share prices concurrently (they are independent)
    const [vaultSharePrice, yieldPoolSharePrice] = await Promise.all([
      fetchSharePrice(vault.contractAddress), // vault's own share price
      fetchSharePrice(vault.yieldPool), // yield pool's share price
    ])

    // Create a unique snapshot ID by combining chainId, vault address (in lowercase), and block number
    const id = `${vault.chainId}-${vault.contractAddress.toLowerCase()}-${event.block.number}`

    const snapshot = {
      sharePrice: vaultSharePrice.toString(),
      timestamp: event.block.timestamp,
      yieldPool: vault.yieldPool,
      yieldPoolSharePrice: yieldPoolSharePrice.toString(),
    }

    await context.db
      .insert(vaultSnapshot)
      .values({
        ...snapshot,
        blockNumber: event.block.number,
        chainId: vault.chainId,
        id,
        vault: vault.contractAddress,
      })
      .onConflictDoUpdate(snapshot)

    // vault apy computation
    try {
      // Fetch snapshots for this vault and yield pool, ordered by timestamp
      const historicalSnapshots = await context.db.sql
        .select()
        .from(vaultSnapshot)
        .where(eq(vaultSnapshot.vault, vault.contractAddress))
        .where(eq(vaultSnapshot.chainId, vault.chainId))
        .where(eq(vaultSnapshot.yieldPool, vault.yieldPool))
        .orderBy('timestamp ASC')
        .execute()

      if (historicalSnapshots.length > 0) {
        const vaultData = selectSnapshot(
          historicalSnapshots,
          'sharePrice',
          Number(event.block.timestamp),
          APY_INTERVAL_SEC
        )

        if (vaultData) {
          const vaultAPY = calculateAPY(
            Number(vaultSharePrice),
            vaultData.price,
            Number(event.block.timestamp),
            vaultData.timestamp
          )

          if (vaultAPY) {
            // update the pool's apy
            await context.db
              .update(relayPool, {
                chainId: vault.chainId,
                contractAddress: vault.contractAddress,
              })
              .set({
                apy: vaultAPY,
              })
          }
        }
      }
    } catch (e) {
      console.error(
        `Failed to compute APY for vault ${vault.contractAddress} on chain ${vault.chainId}:`,
        e
      )
    }

    // base yield apy computation
    try {
      // Fetch snapshots for this yield pool, ordered by timestamp
      const historicalYieldSnapshots = await context.db.sql
        .select()
        .from(vaultSnapshot)
        .where(eq(vaultSnapshot.yieldPool, vault.yieldPool))
        .where(eq(vaultSnapshot.chainId, vault.chainId))
        .orderBy('timestamp ASC')
        .execute()

      if (historicalYieldSnapshots.length > 0) {
        const yieldData = selectSnapshot(
          historicalYieldSnapshots,
          'yieldPoolSharePrice',
          Number(event.block.timestamp),
          APY_INTERVAL_SEC
        )

        if (yieldData) {
          const baseYieldAPY = calculateAPY(
            Number(yieldPoolSharePrice),
            yieldData.price,
            Number(event.block.timestamp),
            yieldData.timestamp
          )

          if (baseYieldAPY) {
            // update the yield pool's apy
            await context.db
              .insert(yieldPool)
              .values({
                apy: baseYieldAPY,
                asset: vault.asset,
                chainId: vault.chainId,
                contractAddress: vault.yieldPool,
                lastUpdated: event.block.timestamp,
                name: 'Unknown', // placeholder - will be updated by event handlers
              })
              .onConflictDoUpdate({
                apy: baseYieldAPY,
                lastUpdated: event.block.timestamp,
              })
          }
        }
      }
    } catch (e) {
      console.error(
        `Failed to compute base yield APY for yield pool ${vault.yieldPool} on chain ${vault.chainId}:`,
        e
      )
    }
  }
})
