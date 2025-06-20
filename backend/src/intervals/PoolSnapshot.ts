import { eq, and, desc, lte } from 'ponder'
import { ponder } from 'ponder:registry'
import { relayPool, vaultSnapshot, yieldPool } from 'ponder:schema'
import { erc4626Abi, erc20Abi } from 'viem'
import type { Address } from 'viem'

/**
 * Helper to calculate APY from share price data.
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
  return Math.round(apyValue * 10000) // basis-points (2dp)
}

// Determine APY interval (seconds)
const APY_INTERVAL_SEC = 7 * 24 * 3600 // 7-day window; for all-time, set to 0

/** Fetch a reference snapshot for a given vault */
async function fetchVaultReferenceSnapshot(
  db: any,
  vaultAddress: Address,
  chainId: number,
  yieldPoolAddress: Address,
  nowTimestamp: number,
  intervalSeconds: number
) {
  const baseWhere = and(
    eq(vaultSnapshot.vault, vaultAddress),
    eq(vaultSnapshot.chainId, chainId),
    eq(vaultSnapshot.yieldPool, yieldPoolAddress)
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

  if (intervalSeconds <= 0) return getOne()

  const cutoff = BigInt(nowTimestamp - intervalSeconds)
  const ref = await getOne(lte(vaultSnapshot.timestamp, cutoff))
  return ref || getOne()
}

/** Fetch a reference snapshot for a yield pool */
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

  if (intervalSeconds <= 0) return getOne()

  const cutoff = BigInt(nowTimestamp - intervalSeconds)
  const ref = await getOne(lte(vaultSnapshot.timestamp, cutoff))
  return ref || getOne()
}

/** Utility to fetch share price from an ERC4626 vault */
async function fetchSharePrice(context: any, contractAddress: Address) {
  const decimals = await context.client.readContract({
    abi: erc20Abi,
    address: contractAddress,
    functionName: 'decimals',
  })
  const shareUnit = BigInt(10) ** BigInt(decimals)
  const sharePrice = await context.client.readContract({
    abi: erc4626Abi,
    address: contractAddress,
    args: [shareUnit],
    functionName: 'convertToAssets',
  })
  return sharePrice as bigint
}

ponder.on('PoolSnapshot:block', async ({ event, context }) => {
  // Retrieve all relay pools for the current chain
  const pools = await context.db.sql
    .select()
    .from(relayPool)
    // @ts-expect-error – context.chain.id is not typed in Ponder
    .where(eq(relayPool.chainId, context.chain.id))
    .execute()

  if (pools.length === 0) return // nothing to do

  for (const pool of pools) {
    try {
      // 1. Read live data from the vault contract
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

      // 2. Update relay_pool table with fresh metrics
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

      // 3. Snapshot share prices + compute APY
      if (!pool.yieldPool) continue // skip if no yield pool configured

      const [vaultSharePrice, yieldSharePrice] = await Promise.all([
        fetchSharePrice(context, pool.contractAddress),
        fetchSharePrice(context, pool.yieldPool),
      ])

      const snapshotId = `${pool.chainId}-${pool.contractAddress.toLowerCase()}-${event.block.number}`
      const snapshot = {
        sharePrice: vaultSharePrice.toString(),
        timestamp: event.block.timestamp,
        yieldPool: pool.yieldPool,
        yieldPoolSharePrice: yieldSharePrice.toString(),
      }

      await context.db
        .insert(vaultSnapshot)
        .values({
          ...snapshot,
          blockNumber: event.block.number,
          chainId: pool.chainId,
          id: snapshotId,
          vault: pool.contractAddress,
        })
        .onConflictDoUpdate(snapshot)

      // 4. Compute vault APY
      try {
        const vaultRef = await fetchVaultReferenceSnapshot(
          context.db,
          pool.contractAddress,
          pool.chainId,
          pool.yieldPool,
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
                chainId: pool.chainId,
                contractAddress: pool.contractAddress,
              })
              .set({ apy: vaultAPY })
          }
        }
      } catch (e) {
        console.error(
          `Failed to compute APY for vault ${pool.contractAddress}`,
          e
        )
      }

      // 5. Compute base yield-pool APY
      try {
        const yieldRef = await fetchYieldPoolReferenceSnapshot(
          context.db,
          pool.yieldPool,
          pool.chainId,
          Number(event.block.timestamp),
          APY_INTERVAL_SEC
        )
        if (yieldRef) {
          const baseAPY = calculateAPY(
            Number(yieldSharePrice),
            Number(yieldRef.yieldPoolSharePrice ?? yieldRef.price),
            Number(event.block.timestamp),
            Number(yieldRef.timestamp)
          )
          if (baseAPY !== null) {
            await context.db
              .insert(yieldPool)
              .values({
                apy: baseAPY,
                asset: pool.asset,
                chainId: pool.chainId,
                contractAddress: pool.yieldPool,
                lastUpdated: event.block.timestamp,
                name: 'Unknown',
              })
              .onConflictDoUpdate({
                apy: baseAPY,
                lastUpdated: event.block.timestamp,
              })
          }
        }
      } catch (e) {
        console.error(
          `Failed to compute base yield APY for ${pool.yieldPool}`,
          e
        )
      }
    } catch (err) {
      console.error(`Snapshot failed for pool ${pool.contractAddress}`, err)
    }
  }
})
