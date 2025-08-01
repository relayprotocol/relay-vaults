import { RelayClient } from '../client'
import type { DocumentNode } from 'graphql'
import type { Variables } from 'graphql-request'
import {
  RelayPoolFilter,
  YieldPoolFilter,
  PoolOriginFilter,
} from '../generated/graphql'

/**
 * RelayVaultService provides a high-level interface for interacting with Relay Protocol vaults
 * through the GraphQL API.
 *
 * Usage:
 * ```typescript
 * const vaultService = new RelayVaultService('https://api.example.com/graphql')
 * const pools = await vaultService.getAllPools()
 * ```
 */
export class RelayVaultService {
  private client: RelayClient

  /**
   * Creates a new RelayVaultService instance
   *
   * @param endpoint - The GraphQL API endpoint URL
   * @throws Will throw an error if the endpoint URL is invalid
   */
  constructor(endpoint: string) {
    if (!endpoint) {
      throw new Error('GraphQL endpoint URL is required')
    }
    this.client = new RelayClient(endpoint)
  }

  /**
   * Execute a raw GraphQL query with variables
   *
   * @param query - The GraphQL query document
   * @param variables - Query variables (optional)
   * @returns Promise containing the query result
   * @throws Will throw an error if the query fails
   *
   * @example
   * ```typescript
   * const { data } = await vaultService.query(GET_ALL_POOLS)
   * // Or with variables
   * const { data } = await vaultService.query(GET_USER_BALANCES, { walletAddress: "0x..." })
   * ```
   */
  async query<TData = any, TVariables extends Variables = Variables>(
    query: string | DocumentNode,
    variables?: TVariables
  ): Promise<TData> {
    return this.client.query<TData, TVariables>(query, variables)
  }

  /**
   * Get all relay pools without snapshot information (faster query)
   *
   * @param options - Query options
   * @param options.limit - Maximum number of pools to fetch (default: 25)
   * @param options.originsLimit - Maximum number of origins to fetch per pool (default: 10)
   * @param options.chainIds - Array of chain IDs to filter by (optional)
   * @param options.curator - Curator address to filter by (optional)
   * @returns Promise containing all pool data without snapshots
   */
  async getAllPools(
    options: {
      limit?: number
      originsLimit?: number
      chainIds?: number[]
      curator?: string
      asset?: string
    } = {}
  ) {
    const { limit = 25, originsLimit = 10, chainIds, curator, asset } = options

    // Build the where filter
    const where: Partial<RelayPoolFilter> = {}

    if (chainIds && chainIds.length > 0) {
      where.chainId_in = chainIds
    }

    if (curator) {
      where.curator = curator
    }

    if (asset) {
      where.asset = asset
    }

    const hasFilters = Object.keys(where).length > 0

    return this.client.sdk.GetAllPools({
      limit,
      originsLimit,
      where: hasFilters ? (where as RelayPoolFilter) : null,
    })
  }

  /**
   * Get all yield pools with optional chain filtering
   *
   * @param options - Query options
   * @param options.limit - Maximum number of yield pools to fetch (default: 25)
   * @param options.chainId - Chain ID to filter by (optional)
   * @returns Promise containing all yield pool data
   */
  async getAllYieldPools(
    options: {
      limit?: number
      chainId?: number
    } = {}
  ) {
    const { limit = 25, chainId } = options

    // Build the where filter
    const where: Partial<YieldPoolFilter> = {}

    if (chainId) {
      where.chainId = chainId
    }

    const hasFilters = Object.keys(where).length > 0

    return this.client.sdk.GetAllYieldPools({
      limit,
      where: hasFilters ? (where as YieldPoolFilter) : null,
    })
  }

  /**
   * Get all relay pools with latest snapshot information
   *
   * @param options - Query options
   * @param options.limit - Maximum number of pools to fetch (default: 10)
   * @param options.originsLimit - Maximum number of origins to fetch per pool (default: 10)
   * @param options.snapshotsLimit - Maximum number of snapshots to fetch per pool (default: 1)
   * @param options.targetTimestamp - The timestamp to get snapshot data for (default: current time)
   * @param options.orderDirection - The order direction for the snapshot query (default: "desc")
   * @param options.chainIds - Array of chain IDs to filter by (optional)
   * @param options.curator - Curator address to filter by (optional)
   * @returns Promise containing all pool data with snapshots
   */
  async getAllPoolsWithSnapshots(
    options: {
      limit?: number
      originsLimit?: number
      snapshotsLimit?: number
      targetTimestamp?: string | number
      orderDirection?: string
      chainIds?: number[]
      curator?: string
    } = {}
  ) {
    const {
      limit = 10,
      originsLimit = 10,
      snapshotsLimit = 1,
      targetTimestamp = Math.floor(Date.now() / 1000),
      orderDirection = 'desc',
      chainIds,
      curator,
    } = options

    // Build the where filter
    const where: Partial<RelayPoolFilter> = {}

    if (chainIds && chainIds.length > 0) {
      where.chainId_in = chainIds
    }

    if (curator) {
      where.curator = curator
    }

    const hasFilters = Object.keys(where).length > 0

    return this.client.sdk.GetAllPoolsWithSnapshots({
      limit,
      orderDirection,
      originsLimit,
      snapshotsLimit,
      targetTimestamp: targetTimestamp.toString(),
      where: hasFilters ? (where as RelayPoolFilter) : null,
    })
  }

  /**
   * Get a specific pool by contract address
   *
   * @param contractAddress - The pool's contract address
   * @param chainId - The chain ID where the pool is deployed
   * @returns Promise containing the pool data
   */
  async getRelayPool(contractAddress: string, chainId: number) {
    return this.client.sdk.GetRelayPool({ chainId, contractAddress })
  }

  /**
   * Get detailed pool information with snapshot data at a specific point in time
   *
   * @param poolAddress - The pool's contract address
   * @param chainId - The chain ID where the pool is deployed
   * @param options - Additional query options
   * @param options.originsLimit - Maximum number of origins to fetch (default: 10)
   * @param options.snapshotsLimit - Maximum number of snapshots to fetch (default: 1)
   * @param options.targetTimestamp - The timestamp to get snapshot data for (default: current time)
   * @param options.orderDirection - The order direction for the snapshot query (default: "desc")
   * @returns Promise containing the detailed pool data
   */
  async getPoolDetails(
    poolAddress: string,
    chainId: number,
    options: {
      originsLimit?: number
      snapshotsLimit?: number
      targetTimestamp?: string | number
      orderDirection?: string
    } = {}
  ) {
    const {
      originsLimit = 10,
      snapshotsLimit = 1,
      targetTimestamp = Math.floor(Date.now() / 1000).toString(),
      orderDirection = 'desc',
    } = options

    return this.client.sdk.GetPoolDetails({
      chainId,
      orderDirection,
      originsLimit,
      poolAddress,
      snapshotsLimit,
      targetTimestamp,
    })
  }

  /**
   * Get yield pool information
   *
   * @param yieldPoolAddress - The yield pool's contract address
   * @param chainId - The chain ID where the yield pool is deployed
   * @returns Promise containing the yield pool data
   */
  async getYieldPool(yieldPoolAddress: string, chainId: number) {
    return this.client.sdk.GetYieldPool({
      chainId,
      yieldPoolAddress,
    })
  }

  /**
   * Get transaction volume for a pool since a specific timestamp
   *
   * @param poolAddress - The pool's contract address
   * @param fromTimestamp - The timestamp to start counting volume from
   * @param limit - Maximum number of transactions to fetch (default: 100)
   * @returns Promise containing the transaction volume data
   */
  async getVolume(
    poolAddress: string,
    fromTimestamp: string | number,
    limit: number = 100
  ) {
    return this.client.sdk.GetVolume({
      fromTimestamp,
      limit,
      poolAddress,
    })
  }

  /**
   * Get user balances for a specific wallet with detailed information
   *
   * @param walletAddress - The wallet address
   * @param limit - Maximum number of balances to fetch (default: 100)
   * @returns Promise containing the user's detailed balances
   */
  async getUserBalances(walletAddress: string, limit: number = 100) {
    return this.client.sdk.GetUserBalances({
      limit,
      walletAddress,
    })
  }

  /**
   * Get user balance in a specific pool by pool address only
   *
   * @param walletAddress - The wallet address
   * @param poolAddress - The pool's contract address
   * @param limit - Maximum number of results to fetch (default: 1)
   * @returns Promise containing the user's balance in the specified pool
   */
  async getUserBalanceForPool(
    walletAddress: string,
    poolAddress: string,
    limit: number = 1
  ) {
    return this.client.sdk.GetUserBalanceForPool({
      limit,
      poolAddress,
      walletAddress,
    })
  }

  /**
   * Get bridge transactions for a specific pool in reverse chronological order
   *
   * @param poolAddress - The pool's contract address
   * @param poolChainId - The chain ID where the pool is deployed
   * @param options - Query options
   * @param options.limit - Maximum number of transactions to fetch (default: 100)
   * @param options.orderBy - Field to order by (default: "originTimestamp")
   * @param options.orderDirection - Order direction (default: "desc" for most recent first)
   * @param options.after - Cursor to fetch results after (for infinite scrolling)
   * @param options.before - Cursor to fetch results before (for pagination)
   * @returns Promise containing the bridge transactions for the pool
   */
  async getPoolBridgeTransactions(
    poolAddress: string,
    poolChainId: number,
    options: {
      limit?: number
      orderBy?: string
      orderDirection?: string
      after?: string
      before?: string
    } = {}
  ) {
    const {
      limit = 100,
      orderBy = 'originTimestamp',
      orderDirection = 'desc',
      after,
      before,
    } = options

    return this.client.sdk.GetPoolBridgeTransactions({
      after: after || null,
      before: before || null,
      limit,
      orderBy,
      orderDirection,
      poolAddress,
      poolChainId,
    })
  }

  /**
   * Get bridge transactions for multiple pools in reverse chronological order
   *
   * @param options - Query options
   * @param options.poolAddresses - Array of pool contract addresses (optional)
   * @param options.poolChainIds - Array of chain IDs where pools are deployed (optional)
   * @param options.limit - Maximum number of transactions to fetch (default: 100)
   * @param options.orderBy - Field to order by (default: "originTimestamp")
   * @param options.orderDirection - Order direction (default: "desc" for most recent first)
   * @param options.after - Cursor to fetch results after (for infinite scrolling)
   * @param options.before - Cursor to fetch results before (for pagination)
   * @returns Promise containing the bridge transactions for all specified pools
   */
  async getAllPoolsBridgeTransactions(
    options: {
      poolAddresses?: string[]
      poolChainIds?: number[]
      limit?: number
      orderBy?: string
      orderDirection?: string
      after?: string
      before?: string
    } = {}
  ) {
    const {
      poolAddresses,
      poolChainIds,
      limit = 100,
      orderBy = 'originTimestamp',
      orderDirection = 'desc',
      after,
      before,
    } = options

    return this.client.sdk.GetAllPoolsBridgeTransactions({
      after: after || null,
      before: before || null,
      limit,
      orderBy,
      orderDirection,
      poolAddresses: poolAddresses || null,
      poolChainIds: poolChainIds || null,
    })
  }

  /**
   * Get all bridge transactions by status
   *
   * @param nativeBridgeStatus - The status of the bridge transactions to fetch
   * @param limit - Maximum number of transactions to fetch (default: 100)
   * @returns Promise containing the bridge transactions
   */
  async getAllBridgeTransactionsByType(
    nativeBridgeStatus: string,
    limit: number = 100
  ) {
    return this.client.sdk.GetAllBridgeTransactionsByType({
      limit,
      nativeBridgeStatus,
    })
  }

  /**
   * Get origin bridge address with sufficient available debt
   * for a specific pool and origin chain
   *
   * @param chainId - The chain ID where the pool is deployed
   * @param poolAddress - The pool's contract address
   * @param originChainId - The origin chain ID
   * @param amount the required amount of additional debt
   *
   * @returns Promise containing the origin bridge address
   */
  async getOriginBridge(
    poolChainId: number,
    originChainId: number,
    currencyAddress: string,
    amount: bigint,
    poolLimit: number = 100,
    originLimit: number = 100
  ) {
    const res = await this.client.sdk.GetOriginBridge({
      currencyAddress,
      originChainId,
      originLimit,
      poolChainId,
      // over-fetch to allow filtering
      poolLimit,
    })

    // filter only pool that have available liquidity
    if (res.data.relayPools) {
      res.data.relayPools.items = (res.data.relayPools?.items ?? []).filter(
        (pool: any) => {
          return (
            amount < BigInt(pool.totalAssets) - BigInt(pool.outstandingDebt)
          )
        }
      )
    }

    // for remaining pools, filter origin that have enough available debt
    const pools = res.data.relayPools?.items ?? []
    for (const pool of pools) {
      if (pool.origins?.items) {
        pool.origins.items = (pool.origins.items ?? [])
          .filter((origin: any) => {
            return (
              BigInt(origin.maxDebt) >
              amount + BigInt(origin.currentOutstandingDebt)
            )
          })
          .slice(0, originLimit)
      }
    }

    return res
  }

  /**
   * Get vault snapshots within a specific time interval
   *
   * @param vaultAddress - The vault's contract address
   * @param chainId - The chain ID where the vault is deployed
   * @param options - Query options
   * @param options.days - Number of days back from now to fetch snapshots (default: 7)
   * @param options.timestampFrom - Custom start timestamp (overrides days parameter)
   * @param options.timestampTo - Custom end timestamp (default: current time)
   * @param options.limit - Maximum number of snapshots to fetch (default: 1000)
   * @param options.orderBy - Field to order by (default: "timestamp")
   * @param options.orderDirection - Order direction (default: "asc" for chronological)
   * @returns Promise containing vault snapshots with APY data and timestamps
   */
  async getVaultSnapshots(
    vaultAddress: string,
    chainId: number,
    options: {
      days?: number
      timestampFrom?: string | number
      timestampTo?: string | number
      limit?: number
      orderBy?: string
      orderDirection?: string
    } = {}
  ) {
    const {
      days = 7,
      timestampFrom,
      timestampTo = Math.floor(Date.now() / 1000),
      limit = 1000,
      orderBy = 'timestamp',
      orderDirection = 'asc',
    } = options

    // Calculate timestampFrom if not provided
    const calculatedTimestampFrom = timestampFrom
      ? timestampFrom.toString()
      : (Number(timestampTo) - days * 24 * 60 * 60).toString()

    return this.client.sdk.GetVaultSnapshots({
      chainId,
      limit,
      orderBy,
      orderDirection,
      timestampFrom: calculatedTimestampFrom,
      timestampTo: timestampTo.toString(),
      vaultAddress,
    })
  }

  /**
   * Get vault snapshots with intelligent aggregation for chart display
   *
   * @param vaultAddress - The vault's contract address
   * @param chainId - The chain ID where the vault is deployed
   * @param options - Query options
   * @param options.timeRange - Predefined time range ('7d', '30d', '90d', '1y') or custom days number
   * @param options.timestampFrom - Custom start timestamp (overrides timeRange)
   * @param options.timestampTo - Custom end timestamp (default: current time)
   * @param options.targetHour - Hour of day for daily aggregation (0-23, default: 6 for 6am UTC)
   * @param options.maxPoints - Maximum data points to return (default: based on timeRange)
   * @returns Promise containing optimally sampled vault snapshots for chart display
   */
  async getVaultSnapshotAggregatedData(
    vaultAddress: string,
    chainId: number,
    options: {
      timeRange?: '7d' | '30d' | '90d' | '1y' | number
      timestampFrom?: string | number
      timestampTo?: string | number
      targetHour?: number
      maxPoints?: number
    } = {}
  ) {
    const {
      timeRange = '7d',
      timestampFrom,
      timestampTo = Math.floor(Date.now() / 1000),
      targetHour = 6,
      maxPoints,
    } = options

    let days: number
    if (typeof timeRange === 'number') {
      days = timeRange
    } else {
      const timeRangeMap = { '1y': 365, '30d': 30, '7d': 7, '90d': 90 }
      days = timeRangeMap[timeRange]
    }

    const startTimestamp = timestampFrom
      ? Number(timestampFrom)
      : Number(timestampTo) - days * 24 * 60 * 60

    // Determine strategy based on time range
    if (days <= 7) {
      return this.getVaultSnapshots(vaultAddress, chainId, {
        limit: maxPoints || 1000,
        orderBy: 'timestamp',
        orderDirection: 'asc',
        timestampFrom: startTimestamp,
        timestampTo,
      })
    } else {
      const startDate = new Date(startTimestamp * 1000)
      const endDate = new Date(Number(timestampTo) * 1000)

      // Get UTC dates for each day
      const currentDate = new Date(startDate)
      currentDate.setUTCHours(targetHour, 0, 0, 0)

      if (currentDate <= startDate) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      }

      const targetTimestamps: number[] = []
      const maxDays = maxPoints || days

      while (currentDate <= endDate && targetTimestamps.length < maxDays) {
        targetTimestamps.push(Math.floor(currentDate.getTime() / 1000))
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      }

      const BATCH_SIZE = 6
      const finalResults: any[] = []

      for (
        let batchStart = 0;
        batchStart < targetTimestamps.length;
        batchStart += BATCH_SIZE
      ) {
        const batchEnd = Math.min(
          batchStart + BATCH_SIZE,
          targetTimestamps.length
        )
        const batchTimestamps = targetTimestamps.slice(batchStart, batchEnd)

        // Create parallel API calls for current batch
        const batchPromises = batchTimestamps.map(
          async (targetTimestamp, batchIndex) => {
            const globalIndex = batchStart + batchIndex
            try {
              const windowStart = targetTimestamp - 3 * 60 * 60
              const windowEnd = targetTimestamp + 3 * 60 * 60

              const response = await this.client.sdk.GetVaultSnapshots({
                chainId,
                limit: 20,
                orderBy: 'timestamp',
                orderDirection: 'asc',
                timestampFrom: windowStart.toString(),
                timestampTo: windowEnd.toString(),
                vaultAddress,
              })

              if (response.data?.vaultSnapshots?.items?.length > 0) {
                const snapshots = response.data.vaultSnapshots.items
                let closestSnapshot = snapshots[0]
                let minDiff = Math.abs(
                  Number(snapshots[0].timestamp) - targetTimestamp
                )

                for (const snapshot of snapshots) {
                  const diff = Math.abs(
                    Number(snapshot.timestamp) - targetTimestamp
                  )
                  if (diff < minDiff) {
                    minDiff = diff
                    closestSnapshot = snapshot
                  }
                }

                return {
                  index: globalIndex,
                  snapshot: closestSnapshot,
                  targetTimestamp,
                }
              }
              return { index: globalIndex, snapshot: null, targetTimestamp }
            } catch (error) {
              console.warn(
                `Failed to fetch snapshot for timestamp ${targetTimestamp}:`,
                error
              )
              return {
                error,
                index: globalIndex,
                snapshot: null,
                targetTimestamp,
              }
            }
          }
        )

        // Execute current batch in parallel
        const batchResults = await Promise.allSettled(batchPromises)

        // Process batch results and maintain order
        const batchSnapshots: Array<{ index: number; snapshot: any }> = []
        batchResults.forEach((result) => {
          if (
            result.status === 'fulfilled' &&
            result.value &&
            result.value.snapshot
          ) {
            batchSnapshots.push({
              index: result.value.index,
              snapshot: result.value.snapshot,
            })
          }
        })

        // Sort by index to maintain chronological order within batch
        batchSnapshots.sort((a, b) => a.index - b.index)
        finalResults.push(...batchSnapshots.map((item) => item.snapshot))

        if (batchEnd < targetTimestamps.length) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      return {
        data: {
          vaultSnapshots: {
            items: finalResults,
          },
        },
      }
    }
  }

  /**
   * Get the oldest vault snapshot for a specific vault
   *
   * @param vaultAddress - The vault's contract address
   * @param chainId - The chain ID where the vault is deployed
   * @returns Promise containing the oldest vault snapshot data
   */
  async getOldestVaultSnapshot(vaultAddress: string, chainId: number) {
    return this.client.sdk.GetOldestVaultSnapshot({
      chainId,
      vaultAddress,
    })
  }

  /**
   * Get all origins for a specific vault with configurable limit and filtering
   *
   * @param poolAddress - The pool's contract address
   * @param chainId - The chain ID where the pool is deployed
   * @param options - Query options
   * @param options.limit - Maximum number of origins to fetch (default: 30)
   * @param options.excludeZeroMaxDebt - Whether to exclude origins with maxDebt <= 0 (default: false)
   * @returns Promise containing vault origins
   */
  async getAllVaultOrigins(
    poolAddress: string,
    chainId: number,
    options: {
      limit?: number
      excludeZeroMaxDebt?: boolean
    } = {}
  ) {
    const { limit = 30, excludeZeroMaxDebt = false } = options

    const where = excludeZeroMaxDebt ? { maxDebt_gt: '0' } : null

    return this.client.sdk.GetAllVaultOrigins({
      chainId,
      limit,
      poolAddress,
      where: where as PoolOriginFilter,
    })
  }
}
