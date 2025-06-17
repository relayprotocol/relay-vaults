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

import { eq, and, desc, lte } from 'ponder'
import { ponder } from 'ponder:registry'
import { vaultSnapshot, relayPool, yieldPool } from 'ponder:schema'
import { erc4626Abi, erc20Abi } from 'viem'
import type { Address } from 'viem'

/**
 * Helper to calculate apy from price data
 */
function calculateAPY(
  currentPrice: number,
  startingPrice: number,
  currentTimestamp: number,
  startingTimestamp: number
): number | null {
  if (startingPrice <= 0 || currentPrice === startingPrice) return null

  const deltaTime = currentTimestamp - startingTimestamp
  if (deltaTime <= 0) return null

  const secondsPerYear = 365 * 24 * 3600
  const growthFactor = currentPrice / startingPrice
  const apyValue = Math.pow(growthFactor, secondsPerYear / deltaTime) - 1

  return Math.round(apyValue * 10000)
}

// Determine APY interval (seconds)
const APY_INTERVAL_SEC = 7 * 24 * 3600 // 7-day window; for all-time, we set to 0

/**
 * Fetch a reference snapshot for a given vault.
 */
async function fetchVaultReferenceSnapshot(
  db: any,
  vaultAddress: Address,
  chainId: number,
  yieldPoolAddress: Address,
  nowTimestamp: number,
  intervalSeconds: number
) {
  // Query builder with the common predicates
  const baseWhere = and(
    eq(vaultSnapshot.vault, vaultAddress),
    eq(vaultSnapshot.chainId, chainId),
    eq(vaultSnapshot.yieldPool, yieldPoolAddress)
  )

  // Helper to materialise the query with order & limit
  const getOne = async (additionalAnd?: any) => {
    const whereClause = additionalAnd
      ? and(baseWhere, additionalAnd)
      : baseWhere
    const rows: any[] = await db.sql
      .select()
      .from(vaultSnapshot)
      .where(whereClause)
      .orderBy(
        additionalAnd ? desc(vaultSnapshot.timestamp) : vaultSnapshot.timestamp
      )
      .limit(1)
      .execute()
    return rows.length ? rows[0] : null
  }

  if (intervalSeconds <= 0) {
    // All-time APY → take the very first snapshot (oldest)
    return await getOne()
  }

  const cutoff = BigInt(nowTimestamp - intervalSeconds)
  const ref = await getOne(lte(vaultSnapshot.timestamp, cutoff))
  if (ref) return ref

  // Fallback to the oldest if nothing satisfies the window
  return await getOne()
}

/**
 * Fetch a reference snapshot for a yield pool (aggregated across vaults).
 */
async function fetchYieldPoolReferenceSnapshot(
  db: any,
  yieldPoolAddress: Address,
  chainId: number,
  nowTimestamp: number,
  intervalSeconds: number
) {
  const baseWhere = and(
    eq(vaultSnapshot.yieldPool, yieldPoolAddress),
    eq(vaultSnapshot.chainId, chainId)
  )

  const getOne = async (additionalAnd?: any) => {
    const whereClause = additionalAnd
      ? and(baseWhere, additionalAnd)
      : baseWhere
    const rows: any[] = await db.sql
      .select()
      .from(vaultSnapshot)
      .where(whereClause)
      .orderBy(
        additionalAnd ? desc(vaultSnapshot.timestamp) : vaultSnapshot.timestamp
      )
      .limit(1)
      .execute()
    return rows.length ? rows[0] : null
  }

  if (intervalSeconds <= 0) return await getOne()

  const cutoff = BigInt(nowTimestamp - intervalSeconds)
  const ref = await getOne(lte(vaultSnapshot.timestamp, cutoff))
  if (ref) return ref

  return await getOne()
}

ponder.on('VaultSnapshot:block', async ({ event, context }) => {
  // Helper function to fetch share price using a contract's address
  async function fetchSharePrice(contractAddress: Address) {
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
    // @ts-expect-error - context.chain.id is not typed properly in Ponder
    .where(eq(relayPool.chainId, context.chain.id))
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
      const vaultRef = await fetchVaultReferenceSnapshot(
        context.db,
        vault.contractAddress,
        vault.chainId,
        vault.yieldPool,
        Number(event.block.timestamp),
        APY_INTERVAL_SEC
      )

      if (vaultRef) {
        const vaultAPY = calculateAPY(
          Number(vaultSharePrice),
          Number(vaultRef.sharePrice),
          Number(event.block.timestamp),
          Number(vaultRef.timestamp)
        )

        if (vaultAPY !== null) {
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
    } catch (e) {
      console.error(
        `Failed to compute APY for vault ${vault.contractAddress} on chain ${vault.chainId}:`,
        e
      )
    }

    // base yield apy computation
    try {
      const yieldRef = await fetchYieldPoolReferenceSnapshot(
        context.db,
        vault.yieldPool,
        vault.chainId,
        Number(event.block.timestamp),
        APY_INTERVAL_SEC
      )

      if (yieldRef) {
        const baseYieldAPY = calculateAPY(
          Number(yieldPoolSharePrice),
          Number(yieldRef.yieldPoolSharePrice ?? yieldRef.price),
          Number(event.block.timestamp),
          Number(yieldRef.timestamp)
        )

        if (baseYieldAPY !== null) {
          await context.db
            .insert(yieldPool)
            .values({
              apy: baseYieldAPY,
              asset: vault.asset,
              chainId: vault.chainId,
              contractAddress: vault.yieldPool,
              lastUpdated: event.block.timestamp,
              name: 'Unknown',
            })
            .onConflictDoUpdate({
              apy: baseYieldAPY,
              lastUpdated: event.block.timestamp,
            })
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
