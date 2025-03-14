import { RelayClient } from '../client'
import type { DocumentNode } from 'graphql'
import type { Variables } from 'graphql-request'

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
   * Get all relay pools with latest snapshot information
   *
   * @param options - Query options
   * @param options.limit - Maximum number of pools to fetch (default: 10)
   * @param options.originsLimit - Maximum number of origins to fetch per pool (default: 10)
   * @param options.snapshotsLimit - Maximum number of snapshots to fetch per pool (default: 1)
   * @param options.targetTimestamp - The timestamp to get snapshot data for (default: current time)
   * @param options.orderDirection - The order direction for the snapshot query (default: "desc")
   * @returns Promise containing all pool data with snapshots
   */
  async getAllPools(
    options: {
      limit?: number
      originsLimit?: number
      snapshotsLimit?: number
      targetTimestamp?: string | number
      orderDirection?: string
    } = {}
  ) {
    const {
      limit = 10,
      originsLimit = 10,
      snapshotsLimit = 1,
      targetTimestamp = Math.floor(Date.now() / 1000).toString(),
      orderDirection = 'desc',
    } = options

    return this.client.sdk.GetAllPools({
      limit,
      originsLimit,
      snapshotsLimit,
      targetTimestamp,
      orderDirection,
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
    return this.client.sdk.GetRelayPool({ contractAddress, chainId })
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
      poolAddress,
      chainId,
      originsLimit,
      snapshotsLimit,
      targetTimestamp,
      orderDirection,
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
      yieldPoolAddress,
      chainId,
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
      poolAddress,
      fromTimestamp,
      limit,
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
      walletAddress,
      limit,
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
      walletAddress,
      poolAddress,
      limit,
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
      nativeBridgeStatus,
      limit,
    })
  }
}
