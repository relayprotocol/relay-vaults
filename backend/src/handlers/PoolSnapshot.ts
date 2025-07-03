import { eq, and, desc, lte } from 'ponder'
import { Context } from 'ponder:registry'
import { relayPool, vaultSnapshot, yieldPool } from 'ponder:schema'
import { erc4626Abi } from 'viem'
import type { Address } from 'viem'
import { BPS_DIVISOR } from '../constants.js'

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
  return Math.round(apyValue * Number(BPS_DIVISOR))
}

// Determine APY interval (seconds)
const APY_INTERVAL_SEC = 7 * 24 * 3600 // 7-day window; for all-time, set to 0

type SnapshotRefFilters = {
  vaultAddress?: Address
  yieldPoolAddress: Address
  chainId: number
}

/** Fetch a reference snapshot for a given vault or yield pool */
async function fetchReferenceSnapshot(
  db: any,
  filters: SnapshotRefFilters,
  nowTimestamp: number,
  intervalSeconds: number
) {
  const conditions = [
    eq(vaultSnapshot.yieldPool, filters.yieldPoolAddress),
    eq(vaultSnapshot.chainId, filters.chainId),
  ]
  if (filters.vaultAddress) {
    conditions.push(eq(vaultSnapshot.vault, filters.vaultAddress))
  }
  const baseWhere = and(...conditions)

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
  return getOne(lte(vaultSnapshot.timestamp, cutoff))
}

/** Utility to fetch share price from an ERC4626 vault */
async function fetchSharePrice(
  context: Context,
  contractAddress: Address,
  decimals: number
) {
  const shareUnit = BigInt(10) ** BigInt(decimals)
  const sharePrice = await context.client.readContract({
    abi: erc4626Abi,
    address: contractAddress,
    args: [shareUnit],
    functionName: 'convertToAssets',
  })

  return sharePrice as bigint
}

export default async function ({
  event,
  context,
}: {
  event: Event<'PoolSnapshot:block'>
  context: Context<'PoolSnapshot:block'>
}) {
  // Retrieve all relay pools for the current chain
  const pools = await context.db.sql
    .select()
    .from(relayPool)
    .where(eq(relayPool.chainId, context.chain.id))
    .execute()

  if (pools.length === 0) return // nothing to do

  for (const pool of pools) {
    try {
      // 1. Get live data from the vault contract and share prices
      const [totalAssets, totalShares, vaultSharePrice, yieldSharePrice] =
        await Promise.all([
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
          fetchSharePrice(context, pool.contractAddress, pool.decimals),
          fetchSharePrice(context, pool.yieldPool, pool.decimals),
        ])

      // 2. Update relay_pool table with fresh metrics and insert vault snapshot
      await context.db
        .update(relayPool, {
          chainId: pool.chainId,
          contractAddress: pool.contractAddress,
        })
        .set({
          totalAssets: BigInt(totalAssets as string),
          totalShares: BigInt(totalShares as string),
        })

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
          vault: pool.contractAddress,
        })
        .onConflictDoUpdate(snapshot)

      // 4. Compute vault APY
      try {
        let vaultRef = await fetchReferenceSnapshot(
          context.db,
          {
            chainId: pool.chainId,
            vaultAddress: pool.contractAddress,
            yieldPoolAddress: pool.yieldPool,
          },
          Number(event.block.timestamp),
          APY_INTERVAL_SEC
        )

        // Fallback to oldest available snapshot if no interval match found
        if (!vaultRef) {
          const baseWhere = and(
            eq(vaultSnapshot.vault, pool.contractAddress),
            eq(vaultSnapshot.chainId, pool.chainId),
            eq(vaultSnapshot.yieldPool, pool.yieldPool)
          )
          const rows: any[] = await context.db.sql
            .select()
            .from(vaultSnapshot)
            .where(baseWhere)
            .orderBy(vaultSnapshot.timestamp)
            .limit(1)
            .execute()
          vaultRef = rows.length ? rows[0] : null
        }
        if (vaultRef) {
          // Let's use the "adjusted" sharePrice (which takes into account the upcoming fees)
          const pendingBridgeFees = await context.client.readContract({
            abi: context.contracts.RelayPool.abi,
            address: pool.contractAddress,
            functionName: 'pendingBridgeFees',
          })

          const adjustedSharePrice =
            (BigInt(totalAssets + pendingBridgeFees) *
              BigInt(10 ** pool.decimals)) /
            BigInt(totalShares)

          const vaultAPY = calculateAPY(
            Number(adjustedSharePrice),
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
        let yieldRef = await fetchReferenceSnapshot(
          context.db,
          {
            chainId: pool.chainId,
            yieldPoolAddress: pool.yieldPool,
          },
          Number(event.block.timestamp),
          APY_INTERVAL_SEC
        )

        // Fallback to oldest available snapshot if no interval match found
        if (!yieldRef) {
          const baseWhere = and(
            eq(vaultSnapshot.yieldPool, pool.yieldPool),
            eq(vaultSnapshot.chainId, pool.chainId)
          )
          const rows: any[] = await context.db.sql
            .select()
            .from(vaultSnapshot)
            .where(baseWhere)
            .orderBy(vaultSnapshot.timestamp)
            .limit(1)
            .execute()
          yieldRef = rows.length ? rows[0] : null
        }
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
      console.error(
        `Snapshot failed for pool ${pool.contractAddress} at block ${event.block.number}, event ID ${event.id}`,
        err
      )
    }
  }
}
