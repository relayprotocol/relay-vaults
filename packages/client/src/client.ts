import { GraphQLClient } from 'graphql-request'
import type { DocumentNode } from 'graphql'
import type { Variables } from 'graphql-request'
import { getSdk } from './generated/graphql'

/**
 * RelayClient provides a low-level interface for making GraphQL requests to the Relay Protocol vaults API.
 * It wraps the graphql-request client and provides type-safe query methods through the generated SDK.
 *
 * This class is primarily used internally by RelayVaultService, but can be used directly
 * for custom queries if needed.
 *
 * @example
 * ```typescript
 * const client = new RelayClient('http://localhost:42069/graphql')
 * const { data } = await client.sdk.GetAllPools()
 * ```
 */
export class RelayClient {
  private client: GraphQLClient
  public sdk: ReturnType<typeof getSdk>

  /**
   * Creates a new RelayClient instance
   *
   * @param url - The GraphQL endpoint URL
   */
  constructor(url: string) {
    this.client = new GraphQLClient(url)
    this.sdk = getSdk(this.client)
  }

  /**
   * Execute a raw GraphQL query
   *
   * @internal
   */
  async query<TData = any, TVariables extends Variables = Variables>(
    query: string | DocumentNode,
    variables?: TVariables
  ): Promise<TData> {
    return this.client.request<TData>(query, variables)
  }
}
