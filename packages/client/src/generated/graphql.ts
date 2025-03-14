import { GraphQLClient, RequestOptions } from 'graphql-request'
import { GraphQLError, print } from 'graphql'
import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders']
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  BigInt: { input: any; output: any }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any }
}

export type Meta = {
  __typename?: 'Meta'
  status: Maybe<Scalars['JSON']['output']>
}

export type PageInfo = {
  __typename?: 'PageInfo'
  endCursor: Maybe<Scalars['String']['output']>
  hasNextPage: Scalars['Boolean']['output']
  hasPreviousPage: Scalars['Boolean']['output']
  startCursor: Maybe<Scalars['String']['output']>
}

export type Query = {
  __typename?: 'Query'
  _meta: Maybe<Meta>
  bridgeTransaction: Maybe<BridgeTransaction>
  bridgeTransactions: BridgeTransactionPage
  poolAction: Maybe<PoolAction>
  poolActions: PoolActionPage
  poolOrigin: Maybe<PoolOrigin>
  poolOrigins: PoolOriginPage
  relayBridge: Maybe<RelayBridge>
  relayBridges: RelayBridgePage
  relayPool: Maybe<RelayPool>
  relayPools: RelayPoolPage
  userBalance: Maybe<UserBalance>
  userBalances: UserBalancePage
  vaultSnapshot: Maybe<VaultSnapshot>
  vaultSnapshots: VaultSnapshotPage
  yieldPool: Maybe<YieldPool>
  yieldPools: YieldPoolPage
}

export type QueryBridgeTransactionArgs = {
  nonce: Scalars['BigInt']['input']
  originBridgeAddress: Scalars['String']['input']
  originChainId: Scalars['Float']['input']
}

export type QueryBridgeTransactionsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<BridgeTransactionFilter>
}

export type QueryPoolActionArgs = {
  chainId: Scalars['Float']['input']
  transactionHash: Scalars['String']['input']
}

export type QueryPoolActionsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<PoolActionFilter>
}

export type QueryPoolOriginArgs = {
  chainId: Scalars['Float']['input']
  originBridge: Scalars['String']['input']
  originChainId: Scalars['Float']['input']
  pool: Scalars['String']['input']
}

export type QueryPoolOriginsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<PoolOriginFilter>
}

export type QueryRelayBridgeArgs = {
  chainId: Scalars['Float']['input']
  contractAddress: Scalars['String']['input']
}

export type QueryRelayBridgesArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<RelayBridgeFilter>
}

export type QueryRelayPoolArgs = {
  chainId: Scalars['Float']['input']
  contractAddress: Scalars['String']['input']
}

export type QueryRelayPoolsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<RelayPoolFilter>
}

export type QueryUserBalanceArgs = {
  chainId: Scalars['Float']['input']
  relayPool: Scalars['String']['input']
  wallet: Scalars['String']['input']
}

export type QueryUserBalancesArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<UserBalanceFilter>
}

export type QueryVaultSnapshotArgs = {
  blockNumber: Scalars['BigInt']['input']
  chainId: Scalars['Float']['input']
  vault: Scalars['String']['input']
}

export type QueryVaultSnapshotsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<VaultSnapshotFilter>
}

export type QueryYieldPoolArgs = {
  chainId: Scalars['Float']['input']
  contractAddress: Scalars['String']['input']
}

export type QueryYieldPoolsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<YieldPoolFilter>
}

export type BridgeTransaction = {
  __typename?: 'bridgeTransaction'
  amount: Scalars['BigInt']['output']
  arbTransactionIndex: Maybe<Scalars['BigInt']['output']>
  asset: Scalars['String']['output']
  destinationPoolAddress: Scalars['String']['output']
  destinationPoolChainId: Scalars['Int']['output']
  destinationRecipient: Scalars['String']['output']
  hyperlaneMessageId: Scalars['String']['output']
  loanEmittedTxHash: Maybe<Scalars['String']['output']>
  nativeBridgeFinalizedTxHash: Maybe<Scalars['String']['output']>
  nativeBridgeStatus: Scalars['String']['output']
  nonce: Scalars['BigInt']['output']
  opProofTxHash: Maybe<Scalars['String']['output']>
  opWithdrawalHash: Maybe<Scalars['String']['output']>
  origin: Maybe<PoolOrigin>
  originBridgeAddress: Scalars['String']['output']
  originChainId: Scalars['Int']['output']
  originSender: Scalars['String']['output']
  originTimestamp: Scalars['BigInt']['output']
  originTxHash: Scalars['String']['output']
}

export type BridgeTransactionFilter = {
  AND: InputMaybe<Array<InputMaybe<BridgeTransactionFilter>>>
  OR: InputMaybe<Array<InputMaybe<BridgeTransactionFilter>>>
  amount: InputMaybe<Scalars['BigInt']['input']>
  amount_gt: InputMaybe<Scalars['BigInt']['input']>
  amount_gte: InputMaybe<Scalars['BigInt']['input']>
  amount_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  amount_lt: InputMaybe<Scalars['BigInt']['input']>
  amount_lte: InputMaybe<Scalars['BigInt']['input']>
  amount_not: InputMaybe<Scalars['BigInt']['input']>
  amount_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  arbTransactionIndex: InputMaybe<Scalars['BigInt']['input']>
  arbTransactionIndex_gt: InputMaybe<Scalars['BigInt']['input']>
  arbTransactionIndex_gte: InputMaybe<Scalars['BigInt']['input']>
  arbTransactionIndex_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  arbTransactionIndex_lt: InputMaybe<Scalars['BigInt']['input']>
  arbTransactionIndex_lte: InputMaybe<Scalars['BigInt']['input']>
  arbTransactionIndex_not: InputMaybe<Scalars['BigInt']['input']>
  arbTransactionIndex_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  asset: InputMaybe<Scalars['String']['input']>
  asset_contains: InputMaybe<Scalars['String']['input']>
  asset_ends_with: InputMaybe<Scalars['String']['input']>
  asset_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  asset_not: InputMaybe<Scalars['String']['input']>
  asset_not_contains: InputMaybe<Scalars['String']['input']>
  asset_not_ends_with: InputMaybe<Scalars['String']['input']>
  asset_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  asset_not_starts_with: InputMaybe<Scalars['String']['input']>
  asset_starts_with: InputMaybe<Scalars['String']['input']>
  destinationPoolAddress: InputMaybe<Scalars['String']['input']>
  destinationPoolAddress_contains: InputMaybe<Scalars['String']['input']>
  destinationPoolAddress_ends_with: InputMaybe<Scalars['String']['input']>
  destinationPoolAddress_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  destinationPoolAddress_not: InputMaybe<Scalars['String']['input']>
  destinationPoolAddress_not_contains: InputMaybe<Scalars['String']['input']>
  destinationPoolAddress_not_ends_with: InputMaybe<Scalars['String']['input']>
  destinationPoolAddress_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  destinationPoolAddress_not_starts_with: InputMaybe<Scalars['String']['input']>
  destinationPoolAddress_starts_with: InputMaybe<Scalars['String']['input']>
  destinationPoolChainId: InputMaybe<Scalars['Int']['input']>
  destinationPoolChainId_gt: InputMaybe<Scalars['Int']['input']>
  destinationPoolChainId_gte: InputMaybe<Scalars['Int']['input']>
  destinationPoolChainId_in: InputMaybe<
    Array<InputMaybe<Scalars['Int']['input']>>
  >
  destinationPoolChainId_lt: InputMaybe<Scalars['Int']['input']>
  destinationPoolChainId_lte: InputMaybe<Scalars['Int']['input']>
  destinationPoolChainId_not: InputMaybe<Scalars['Int']['input']>
  destinationPoolChainId_not_in: InputMaybe<
    Array<InputMaybe<Scalars['Int']['input']>>
  >
  destinationRecipient: InputMaybe<Scalars['String']['input']>
  destinationRecipient_contains: InputMaybe<Scalars['String']['input']>
  destinationRecipient_ends_with: InputMaybe<Scalars['String']['input']>
  destinationRecipient_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  destinationRecipient_not: InputMaybe<Scalars['String']['input']>
  destinationRecipient_not_contains: InputMaybe<Scalars['String']['input']>
  destinationRecipient_not_ends_with: InputMaybe<Scalars['String']['input']>
  destinationRecipient_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  destinationRecipient_not_starts_with: InputMaybe<Scalars['String']['input']>
  destinationRecipient_starts_with: InputMaybe<Scalars['String']['input']>
  hyperlaneMessageId: InputMaybe<Scalars['String']['input']>
  hyperlaneMessageId_contains: InputMaybe<Scalars['String']['input']>
  hyperlaneMessageId_ends_with: InputMaybe<Scalars['String']['input']>
  hyperlaneMessageId_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  hyperlaneMessageId_not: InputMaybe<Scalars['String']['input']>
  hyperlaneMessageId_not_contains: InputMaybe<Scalars['String']['input']>
  hyperlaneMessageId_not_ends_with: InputMaybe<Scalars['String']['input']>
  hyperlaneMessageId_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  hyperlaneMessageId_not_starts_with: InputMaybe<Scalars['String']['input']>
  hyperlaneMessageId_starts_with: InputMaybe<Scalars['String']['input']>
  loanEmittedTxHash: InputMaybe<Scalars['String']['input']>
  loanEmittedTxHash_contains: InputMaybe<Scalars['String']['input']>
  loanEmittedTxHash_ends_with: InputMaybe<Scalars['String']['input']>
  loanEmittedTxHash_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  loanEmittedTxHash_not: InputMaybe<Scalars['String']['input']>
  loanEmittedTxHash_not_contains: InputMaybe<Scalars['String']['input']>
  loanEmittedTxHash_not_ends_with: InputMaybe<Scalars['String']['input']>
  loanEmittedTxHash_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  loanEmittedTxHash_not_starts_with: InputMaybe<Scalars['String']['input']>
  loanEmittedTxHash_starts_with: InputMaybe<Scalars['String']['input']>
  nativeBridgeFinalizedTxHash: InputMaybe<Scalars['String']['input']>
  nativeBridgeFinalizedTxHash_contains: InputMaybe<Scalars['String']['input']>
  nativeBridgeFinalizedTxHash_ends_with: InputMaybe<Scalars['String']['input']>
  nativeBridgeFinalizedTxHash_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  nativeBridgeFinalizedTxHash_not: InputMaybe<Scalars['String']['input']>
  nativeBridgeFinalizedTxHash_not_contains: InputMaybe<
    Scalars['String']['input']
  >
  nativeBridgeFinalizedTxHash_not_ends_with: InputMaybe<
    Scalars['String']['input']
  >
  nativeBridgeFinalizedTxHash_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  nativeBridgeFinalizedTxHash_not_starts_with: InputMaybe<
    Scalars['String']['input']
  >
  nativeBridgeFinalizedTxHash_starts_with: InputMaybe<
    Scalars['String']['input']
  >
  nativeBridgeStatus: InputMaybe<Scalars['String']['input']>
  nativeBridgeStatus_contains: InputMaybe<Scalars['String']['input']>
  nativeBridgeStatus_ends_with: InputMaybe<Scalars['String']['input']>
  nativeBridgeStatus_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  nativeBridgeStatus_not: InputMaybe<Scalars['String']['input']>
  nativeBridgeStatus_not_contains: InputMaybe<Scalars['String']['input']>
  nativeBridgeStatus_not_ends_with: InputMaybe<Scalars['String']['input']>
  nativeBridgeStatus_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  nativeBridgeStatus_not_starts_with: InputMaybe<Scalars['String']['input']>
  nativeBridgeStatus_starts_with: InputMaybe<Scalars['String']['input']>
  nonce: InputMaybe<Scalars['BigInt']['input']>
  nonce_gt: InputMaybe<Scalars['BigInt']['input']>
  nonce_gte: InputMaybe<Scalars['BigInt']['input']>
  nonce_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  nonce_lt: InputMaybe<Scalars['BigInt']['input']>
  nonce_lte: InputMaybe<Scalars['BigInt']['input']>
  nonce_not: InputMaybe<Scalars['BigInt']['input']>
  nonce_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  opProofTxHash: InputMaybe<Scalars['String']['input']>
  opProofTxHash_contains: InputMaybe<Scalars['String']['input']>
  opProofTxHash_ends_with: InputMaybe<Scalars['String']['input']>
  opProofTxHash_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  opProofTxHash_not: InputMaybe<Scalars['String']['input']>
  opProofTxHash_not_contains: InputMaybe<Scalars['String']['input']>
  opProofTxHash_not_ends_with: InputMaybe<Scalars['String']['input']>
  opProofTxHash_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  opProofTxHash_not_starts_with: InputMaybe<Scalars['String']['input']>
  opProofTxHash_starts_with: InputMaybe<Scalars['String']['input']>
  opWithdrawalHash: InputMaybe<Scalars['String']['input']>
  opWithdrawalHash_contains: InputMaybe<Scalars['String']['input']>
  opWithdrawalHash_ends_with: InputMaybe<Scalars['String']['input']>
  opWithdrawalHash_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  opWithdrawalHash_not: InputMaybe<Scalars['String']['input']>
  opWithdrawalHash_not_contains: InputMaybe<Scalars['String']['input']>
  opWithdrawalHash_not_ends_with: InputMaybe<Scalars['String']['input']>
  opWithdrawalHash_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  opWithdrawalHash_not_starts_with: InputMaybe<Scalars['String']['input']>
  opWithdrawalHash_starts_with: InputMaybe<Scalars['String']['input']>
  originBridgeAddress: InputMaybe<Scalars['String']['input']>
  originBridgeAddress_contains: InputMaybe<Scalars['String']['input']>
  originBridgeAddress_ends_with: InputMaybe<Scalars['String']['input']>
  originBridgeAddress_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  originBridgeAddress_not: InputMaybe<Scalars['String']['input']>
  originBridgeAddress_not_contains: InputMaybe<Scalars['String']['input']>
  originBridgeAddress_not_ends_with: InputMaybe<Scalars['String']['input']>
  originBridgeAddress_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  originBridgeAddress_not_starts_with: InputMaybe<Scalars['String']['input']>
  originBridgeAddress_starts_with: InputMaybe<Scalars['String']['input']>
  originChainId: InputMaybe<Scalars['Int']['input']>
  originChainId_gt: InputMaybe<Scalars['Int']['input']>
  originChainId_gte: InputMaybe<Scalars['Int']['input']>
  originChainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  originChainId_lt: InputMaybe<Scalars['Int']['input']>
  originChainId_lte: InputMaybe<Scalars['Int']['input']>
  originChainId_not: InputMaybe<Scalars['Int']['input']>
  originChainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  originSender: InputMaybe<Scalars['String']['input']>
  originSender_contains: InputMaybe<Scalars['String']['input']>
  originSender_ends_with: InputMaybe<Scalars['String']['input']>
  originSender_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  originSender_not: InputMaybe<Scalars['String']['input']>
  originSender_not_contains: InputMaybe<Scalars['String']['input']>
  originSender_not_ends_with: InputMaybe<Scalars['String']['input']>
  originSender_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  originSender_not_starts_with: InputMaybe<Scalars['String']['input']>
  originSender_starts_with: InputMaybe<Scalars['String']['input']>
  originTimestamp: InputMaybe<Scalars['BigInt']['input']>
  originTimestamp_gt: InputMaybe<Scalars['BigInt']['input']>
  originTimestamp_gte: InputMaybe<Scalars['BigInt']['input']>
  originTimestamp_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  originTimestamp_lt: InputMaybe<Scalars['BigInt']['input']>
  originTimestamp_lte: InputMaybe<Scalars['BigInt']['input']>
  originTimestamp_not: InputMaybe<Scalars['BigInt']['input']>
  originTimestamp_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  originTxHash: InputMaybe<Scalars['String']['input']>
  originTxHash_contains: InputMaybe<Scalars['String']['input']>
  originTxHash_ends_with: InputMaybe<Scalars['String']['input']>
  originTxHash_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  originTxHash_not: InputMaybe<Scalars['String']['input']>
  originTxHash_not_contains: InputMaybe<Scalars['String']['input']>
  originTxHash_not_ends_with: InputMaybe<Scalars['String']['input']>
  originTxHash_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  originTxHash_not_starts_with: InputMaybe<Scalars['String']['input']>
  originTxHash_starts_with: InputMaybe<Scalars['String']['input']>
}

export type BridgeTransactionPage = {
  __typename?: 'bridgeTransactionPage'
  items: Array<BridgeTransaction>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PoolAction = {
  __typename?: 'poolAction'
  assets: Scalars['BigInt']['output']
  blockNumber: Scalars['BigInt']['output']
  chainId: Scalars['Int']['output']
  relayPool: Scalars['String']['output']
  shares: Scalars['BigInt']['output']
  timestamp: Scalars['BigInt']['output']
  transactionHash: Scalars['String']['output']
  type: Scalars['String']['output']
  user: Scalars['String']['output']
}

export type PoolActionFilter = {
  AND: InputMaybe<Array<InputMaybe<PoolActionFilter>>>
  OR: InputMaybe<Array<InputMaybe<PoolActionFilter>>>
  assets: InputMaybe<Scalars['BigInt']['input']>
  assets_gt: InputMaybe<Scalars['BigInt']['input']>
  assets_gte: InputMaybe<Scalars['BigInt']['input']>
  assets_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  assets_lt: InputMaybe<Scalars['BigInt']['input']>
  assets_lte: InputMaybe<Scalars['BigInt']['input']>
  assets_not: InputMaybe<Scalars['BigInt']['input']>
  assets_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  blockNumber: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  blockNumber_lt: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  chainId: InputMaybe<Scalars['Int']['input']>
  chainId_gt: InputMaybe<Scalars['Int']['input']>
  chainId_gte: InputMaybe<Scalars['Int']['input']>
  chainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  chainId_lt: InputMaybe<Scalars['Int']['input']>
  chainId_lte: InputMaybe<Scalars['Int']['input']>
  chainId_not: InputMaybe<Scalars['Int']['input']>
  chainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  relayPool: InputMaybe<Scalars['String']['input']>
  relayPool_contains: InputMaybe<Scalars['String']['input']>
  relayPool_ends_with: InputMaybe<Scalars['String']['input']>
  relayPool_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  relayPool_not: InputMaybe<Scalars['String']['input']>
  relayPool_not_contains: InputMaybe<Scalars['String']['input']>
  relayPool_not_ends_with: InputMaybe<Scalars['String']['input']>
  relayPool_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  relayPool_not_starts_with: InputMaybe<Scalars['String']['input']>
  relayPool_starts_with: InputMaybe<Scalars['String']['input']>
  shares: InputMaybe<Scalars['BigInt']['input']>
  shares_gt: InputMaybe<Scalars['BigInt']['input']>
  shares_gte: InputMaybe<Scalars['BigInt']['input']>
  shares_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  shares_lt: InputMaybe<Scalars['BigInt']['input']>
  shares_lte: InputMaybe<Scalars['BigInt']['input']>
  shares_not: InputMaybe<Scalars['BigInt']['input']>
  shares_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  timestamp: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  timestamp_lt: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  transactionHash: InputMaybe<Scalars['String']['input']>
  transactionHash_contains: InputMaybe<Scalars['String']['input']>
  transactionHash_ends_with: InputMaybe<Scalars['String']['input']>
  transactionHash_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionHash_not: InputMaybe<Scalars['String']['input']>
  transactionHash_not_contains: InputMaybe<Scalars['String']['input']>
  transactionHash_not_ends_with: InputMaybe<Scalars['String']['input']>
  transactionHash_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  transactionHash_not_starts_with: InputMaybe<Scalars['String']['input']>
  transactionHash_starts_with: InputMaybe<Scalars['String']['input']>
  type: InputMaybe<Scalars['String']['input']>
  type_contains: InputMaybe<Scalars['String']['input']>
  type_ends_with: InputMaybe<Scalars['String']['input']>
  type_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  type_not: InputMaybe<Scalars['String']['input']>
  type_not_contains: InputMaybe<Scalars['String']['input']>
  type_not_ends_with: InputMaybe<Scalars['String']['input']>
  type_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  type_not_starts_with: InputMaybe<Scalars['String']['input']>
  type_starts_with: InputMaybe<Scalars['String']['input']>
  user: InputMaybe<Scalars['String']['input']>
  user_contains: InputMaybe<Scalars['String']['input']>
  user_ends_with: InputMaybe<Scalars['String']['input']>
  user_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  user_not: InputMaybe<Scalars['String']['input']>
  user_not_contains: InputMaybe<Scalars['String']['input']>
  user_not_ends_with: InputMaybe<Scalars['String']['input']>
  user_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  user_not_starts_with: InputMaybe<Scalars['String']['input']>
  user_starts_with: InputMaybe<Scalars['String']['input']>
}

export type PoolActionPage = {
  __typename?: 'poolActionPage'
  items: Array<PoolAction>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PoolOrigin = {
  __typename?: 'poolOrigin'
  bridgeFee: Scalars['Int']['output']
  chainId: Scalars['Int']['output']
  coolDown: Scalars['Int']['output']
  curator: Scalars['String']['output']
  currentOutstandingDebt: Scalars['BigInt']['output']
  maxDebt: Scalars['BigInt']['output']
  originBridge: Scalars['String']['output']
  originChainId: Scalars['Int']['output']
  pool: Maybe<RelayPool>
  proxyBridge: Scalars['String']['output']
  transactions: Maybe<BridgeTransactionPage>
}

export type PoolOriginTransactionsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<BridgeTransactionFilter>
}

export type PoolOriginFilter = {
  AND: InputMaybe<Array<InputMaybe<PoolOriginFilter>>>
  OR: InputMaybe<Array<InputMaybe<PoolOriginFilter>>>
  bridgeFee: InputMaybe<Scalars['Int']['input']>
  bridgeFee_gt: InputMaybe<Scalars['Int']['input']>
  bridgeFee_gte: InputMaybe<Scalars['Int']['input']>
  bridgeFee_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  bridgeFee_lt: InputMaybe<Scalars['Int']['input']>
  bridgeFee_lte: InputMaybe<Scalars['Int']['input']>
  bridgeFee_not: InputMaybe<Scalars['Int']['input']>
  bridgeFee_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  chainId: InputMaybe<Scalars['Int']['input']>
  chainId_gt: InputMaybe<Scalars['Int']['input']>
  chainId_gte: InputMaybe<Scalars['Int']['input']>
  chainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  chainId_lt: InputMaybe<Scalars['Int']['input']>
  chainId_lte: InputMaybe<Scalars['Int']['input']>
  chainId_not: InputMaybe<Scalars['Int']['input']>
  chainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  coolDown: InputMaybe<Scalars['Int']['input']>
  coolDown_gt: InputMaybe<Scalars['Int']['input']>
  coolDown_gte: InputMaybe<Scalars['Int']['input']>
  coolDown_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  coolDown_lt: InputMaybe<Scalars['Int']['input']>
  coolDown_lte: InputMaybe<Scalars['Int']['input']>
  coolDown_not: InputMaybe<Scalars['Int']['input']>
  coolDown_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  curator: InputMaybe<Scalars['String']['input']>
  curator_contains: InputMaybe<Scalars['String']['input']>
  curator_ends_with: InputMaybe<Scalars['String']['input']>
  curator_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  curator_not: InputMaybe<Scalars['String']['input']>
  curator_not_contains: InputMaybe<Scalars['String']['input']>
  curator_not_ends_with: InputMaybe<Scalars['String']['input']>
  curator_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  curator_not_starts_with: InputMaybe<Scalars['String']['input']>
  curator_starts_with: InputMaybe<Scalars['String']['input']>
  currentOutstandingDebt: InputMaybe<Scalars['BigInt']['input']>
  currentOutstandingDebt_gt: InputMaybe<Scalars['BigInt']['input']>
  currentOutstandingDebt_gte: InputMaybe<Scalars['BigInt']['input']>
  currentOutstandingDebt_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  currentOutstandingDebt_lt: InputMaybe<Scalars['BigInt']['input']>
  currentOutstandingDebt_lte: InputMaybe<Scalars['BigInt']['input']>
  currentOutstandingDebt_not: InputMaybe<Scalars['BigInt']['input']>
  currentOutstandingDebt_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  maxDebt: InputMaybe<Scalars['BigInt']['input']>
  maxDebt_gt: InputMaybe<Scalars['BigInt']['input']>
  maxDebt_gte: InputMaybe<Scalars['BigInt']['input']>
  maxDebt_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  maxDebt_lt: InputMaybe<Scalars['BigInt']['input']>
  maxDebt_lte: InputMaybe<Scalars['BigInt']['input']>
  maxDebt_not: InputMaybe<Scalars['BigInt']['input']>
  maxDebt_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  originBridge: InputMaybe<Scalars['String']['input']>
  originBridge_contains: InputMaybe<Scalars['String']['input']>
  originBridge_ends_with: InputMaybe<Scalars['String']['input']>
  originBridge_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  originBridge_not: InputMaybe<Scalars['String']['input']>
  originBridge_not_contains: InputMaybe<Scalars['String']['input']>
  originBridge_not_ends_with: InputMaybe<Scalars['String']['input']>
  originBridge_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  originBridge_not_starts_with: InputMaybe<Scalars['String']['input']>
  originBridge_starts_with: InputMaybe<Scalars['String']['input']>
  originChainId: InputMaybe<Scalars['Int']['input']>
  originChainId_gt: InputMaybe<Scalars['Int']['input']>
  originChainId_gte: InputMaybe<Scalars['Int']['input']>
  originChainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  originChainId_lt: InputMaybe<Scalars['Int']['input']>
  originChainId_lte: InputMaybe<Scalars['Int']['input']>
  originChainId_not: InputMaybe<Scalars['Int']['input']>
  originChainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  pool: InputMaybe<Scalars['String']['input']>
  pool_contains: InputMaybe<Scalars['String']['input']>
  pool_ends_with: InputMaybe<Scalars['String']['input']>
  pool_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  pool_not: InputMaybe<Scalars['String']['input']>
  pool_not_contains: InputMaybe<Scalars['String']['input']>
  pool_not_ends_with: InputMaybe<Scalars['String']['input']>
  pool_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  pool_not_starts_with: InputMaybe<Scalars['String']['input']>
  pool_starts_with: InputMaybe<Scalars['String']['input']>
  proxyBridge: InputMaybe<Scalars['String']['input']>
  proxyBridge_contains: InputMaybe<Scalars['String']['input']>
  proxyBridge_ends_with: InputMaybe<Scalars['String']['input']>
  proxyBridge_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  proxyBridge_not: InputMaybe<Scalars['String']['input']>
  proxyBridge_not_contains: InputMaybe<Scalars['String']['input']>
  proxyBridge_not_ends_with: InputMaybe<Scalars['String']['input']>
  proxyBridge_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  proxyBridge_not_starts_with: InputMaybe<Scalars['String']['input']>
  proxyBridge_starts_with: InputMaybe<Scalars['String']['input']>
}

export type PoolOriginPage = {
  __typename?: 'poolOriginPage'
  items: Array<PoolOrigin>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type RelayBridge = {
  __typename?: 'relayBridge'
  asset: Scalars['String']['output']
  chainId: Scalars['Int']['output']
  contractAddress: Scalars['String']['output']
  createdAt: Scalars['BigInt']['output']
  createdAtBlock: Scalars['BigInt']['output']
  transferNonce: Scalars['BigInt']['output']
}

export type RelayBridgeFilter = {
  AND: InputMaybe<Array<InputMaybe<RelayBridgeFilter>>>
  OR: InputMaybe<Array<InputMaybe<RelayBridgeFilter>>>
  asset: InputMaybe<Scalars['String']['input']>
  asset_contains: InputMaybe<Scalars['String']['input']>
  asset_ends_with: InputMaybe<Scalars['String']['input']>
  asset_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  asset_not: InputMaybe<Scalars['String']['input']>
  asset_not_contains: InputMaybe<Scalars['String']['input']>
  asset_not_ends_with: InputMaybe<Scalars['String']['input']>
  asset_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  asset_not_starts_with: InputMaybe<Scalars['String']['input']>
  asset_starts_with: InputMaybe<Scalars['String']['input']>
  chainId: InputMaybe<Scalars['Int']['input']>
  chainId_gt: InputMaybe<Scalars['Int']['input']>
  chainId_gte: InputMaybe<Scalars['Int']['input']>
  chainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  chainId_lt: InputMaybe<Scalars['Int']['input']>
  chainId_lte: InputMaybe<Scalars['Int']['input']>
  chainId_not: InputMaybe<Scalars['Int']['input']>
  chainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  contractAddress: InputMaybe<Scalars['String']['input']>
  contractAddress_contains: InputMaybe<Scalars['String']['input']>
  contractAddress_ends_with: InputMaybe<Scalars['String']['input']>
  contractAddress_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  contractAddress_not: InputMaybe<Scalars['String']['input']>
  contractAddress_not_contains: InputMaybe<Scalars['String']['input']>
  contractAddress_not_ends_with: InputMaybe<Scalars['String']['input']>
  contractAddress_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  contractAddress_not_starts_with: InputMaybe<Scalars['String']['input']>
  contractAddress_starts_with: InputMaybe<Scalars['String']['input']>
  createdAt: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gt: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gte: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  createdAtBlock_lt: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_lte: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  createdAt_gt: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  createdAt_lt: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  transferNonce: InputMaybe<Scalars['BigInt']['input']>
  transferNonce_gt: InputMaybe<Scalars['BigInt']['input']>
  transferNonce_gte: InputMaybe<Scalars['BigInt']['input']>
  transferNonce_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  transferNonce_lt: InputMaybe<Scalars['BigInt']['input']>
  transferNonce_lte: InputMaybe<Scalars['BigInt']['input']>
  transferNonce_not: InputMaybe<Scalars['BigInt']['input']>
  transferNonce_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
}

export type RelayBridgePage = {
  __typename?: 'relayBridgePage'
  items: Array<RelayBridge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type RelayPool = {
  __typename?: 'relayPool'
  asset: Scalars['String']['output']
  chainId: Scalars['Int']['output']
  contractAddress: Scalars['String']['output']
  createdAt: Scalars['BigInt']['output']
  createdAtBlock: Scalars['BigInt']['output']
  curator: Scalars['String']['output']
  name: Scalars['String']['output']
  origins: Maybe<PoolOriginPage>
  outstandingDebt: Scalars['BigInt']['output']
  snapshots: Maybe<VaultSnapshotPage>
  symbol: Scalars['String']['output']
  totalAssets: Scalars['BigInt']['output']
  totalBridgeFees: Scalars['BigInt']['output']
  totalShares: Scalars['BigInt']['output']
  userBalances: Maybe<UserBalancePage>
  yieldPool: Scalars['String']['output']
}

export type RelayPoolOriginsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<PoolOriginFilter>
}

export type RelayPoolSnapshotsArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<VaultSnapshotFilter>
}

export type RelayPoolUserBalancesArgs = {
  after: InputMaybe<Scalars['String']['input']>
  before: InputMaybe<Scalars['String']['input']>
  limit: InputMaybe<Scalars['Int']['input']>
  orderBy: InputMaybe<Scalars['String']['input']>
  orderDirection: InputMaybe<Scalars['String']['input']>
  where: InputMaybe<UserBalanceFilter>
}

export type RelayPoolFilter = {
  AND: InputMaybe<Array<InputMaybe<RelayPoolFilter>>>
  OR: InputMaybe<Array<InputMaybe<RelayPoolFilter>>>
  asset: InputMaybe<Scalars['String']['input']>
  asset_contains: InputMaybe<Scalars['String']['input']>
  asset_ends_with: InputMaybe<Scalars['String']['input']>
  asset_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  asset_not: InputMaybe<Scalars['String']['input']>
  asset_not_contains: InputMaybe<Scalars['String']['input']>
  asset_not_ends_with: InputMaybe<Scalars['String']['input']>
  asset_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  asset_not_starts_with: InputMaybe<Scalars['String']['input']>
  asset_starts_with: InputMaybe<Scalars['String']['input']>
  chainId: InputMaybe<Scalars['Int']['input']>
  chainId_gt: InputMaybe<Scalars['Int']['input']>
  chainId_gte: InputMaybe<Scalars['Int']['input']>
  chainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  chainId_lt: InputMaybe<Scalars['Int']['input']>
  chainId_lte: InputMaybe<Scalars['Int']['input']>
  chainId_not: InputMaybe<Scalars['Int']['input']>
  chainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  contractAddress: InputMaybe<Scalars['String']['input']>
  contractAddress_contains: InputMaybe<Scalars['String']['input']>
  contractAddress_ends_with: InputMaybe<Scalars['String']['input']>
  contractAddress_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  contractAddress_not: InputMaybe<Scalars['String']['input']>
  contractAddress_not_contains: InputMaybe<Scalars['String']['input']>
  contractAddress_not_ends_with: InputMaybe<Scalars['String']['input']>
  contractAddress_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  contractAddress_not_starts_with: InputMaybe<Scalars['String']['input']>
  contractAddress_starts_with: InputMaybe<Scalars['String']['input']>
  createdAt: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gt: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_gte: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  createdAtBlock_lt: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_lte: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not: InputMaybe<Scalars['BigInt']['input']>
  createdAtBlock_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  createdAt_gt: InputMaybe<Scalars['BigInt']['input']>
  createdAt_gte: InputMaybe<Scalars['BigInt']['input']>
  createdAt_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  createdAt_lt: InputMaybe<Scalars['BigInt']['input']>
  createdAt_lte: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not: InputMaybe<Scalars['BigInt']['input']>
  createdAt_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  curator: InputMaybe<Scalars['String']['input']>
  curator_contains: InputMaybe<Scalars['String']['input']>
  curator_ends_with: InputMaybe<Scalars['String']['input']>
  curator_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  curator_not: InputMaybe<Scalars['String']['input']>
  curator_not_contains: InputMaybe<Scalars['String']['input']>
  curator_not_ends_with: InputMaybe<Scalars['String']['input']>
  curator_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  curator_not_starts_with: InputMaybe<Scalars['String']['input']>
  curator_starts_with: InputMaybe<Scalars['String']['input']>
  name: InputMaybe<Scalars['String']['input']>
  name_contains: InputMaybe<Scalars['String']['input']>
  name_ends_with: InputMaybe<Scalars['String']['input']>
  name_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  name_not: InputMaybe<Scalars['String']['input']>
  name_not_contains: InputMaybe<Scalars['String']['input']>
  name_not_ends_with: InputMaybe<Scalars['String']['input']>
  name_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  name_not_starts_with: InputMaybe<Scalars['String']['input']>
  name_starts_with: InputMaybe<Scalars['String']['input']>
  outstandingDebt: InputMaybe<Scalars['BigInt']['input']>
  outstandingDebt_gt: InputMaybe<Scalars['BigInt']['input']>
  outstandingDebt_gte: InputMaybe<Scalars['BigInt']['input']>
  outstandingDebt_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  outstandingDebt_lt: InputMaybe<Scalars['BigInt']['input']>
  outstandingDebt_lte: InputMaybe<Scalars['BigInt']['input']>
  outstandingDebt_not: InputMaybe<Scalars['BigInt']['input']>
  outstandingDebt_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  symbol: InputMaybe<Scalars['String']['input']>
  symbol_contains: InputMaybe<Scalars['String']['input']>
  symbol_ends_with: InputMaybe<Scalars['String']['input']>
  symbol_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  symbol_not: InputMaybe<Scalars['String']['input']>
  symbol_not_contains: InputMaybe<Scalars['String']['input']>
  symbol_not_ends_with: InputMaybe<Scalars['String']['input']>
  symbol_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  symbol_not_starts_with: InputMaybe<Scalars['String']['input']>
  symbol_starts_with: InputMaybe<Scalars['String']['input']>
  totalAssets: InputMaybe<Scalars['BigInt']['input']>
  totalAssets_gt: InputMaybe<Scalars['BigInt']['input']>
  totalAssets_gte: InputMaybe<Scalars['BigInt']['input']>
  totalAssets_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  totalAssets_lt: InputMaybe<Scalars['BigInt']['input']>
  totalAssets_lte: InputMaybe<Scalars['BigInt']['input']>
  totalAssets_not: InputMaybe<Scalars['BigInt']['input']>
  totalAssets_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  totalBridgeFees: InputMaybe<Scalars['BigInt']['input']>
  totalBridgeFees_gt: InputMaybe<Scalars['BigInt']['input']>
  totalBridgeFees_gte: InputMaybe<Scalars['BigInt']['input']>
  totalBridgeFees_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  totalBridgeFees_lt: InputMaybe<Scalars['BigInt']['input']>
  totalBridgeFees_lte: InputMaybe<Scalars['BigInt']['input']>
  totalBridgeFees_not: InputMaybe<Scalars['BigInt']['input']>
  totalBridgeFees_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  totalShares: InputMaybe<Scalars['BigInt']['input']>
  totalShares_gt: InputMaybe<Scalars['BigInt']['input']>
  totalShares_gte: InputMaybe<Scalars['BigInt']['input']>
  totalShares_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  totalShares_lt: InputMaybe<Scalars['BigInt']['input']>
  totalShares_lte: InputMaybe<Scalars['BigInt']['input']>
  totalShares_not: InputMaybe<Scalars['BigInt']['input']>
  totalShares_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  yieldPool: InputMaybe<Scalars['String']['input']>
  yieldPool_contains: InputMaybe<Scalars['String']['input']>
  yieldPool_ends_with: InputMaybe<Scalars['String']['input']>
  yieldPool_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  yieldPool_not: InputMaybe<Scalars['String']['input']>
  yieldPool_not_contains: InputMaybe<Scalars['String']['input']>
  yieldPool_not_ends_with: InputMaybe<Scalars['String']['input']>
  yieldPool_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  yieldPool_not_starts_with: InputMaybe<Scalars['String']['input']>
  yieldPool_starts_with: InputMaybe<Scalars['String']['input']>
}

export type RelayPoolPage = {
  __typename?: 'relayPoolPage'
  items: Array<RelayPool>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type UserBalance = {
  __typename?: 'userBalance'
  chainId: Scalars['Int']['output']
  lastUpdated: Scalars['BigInt']['output']
  pool: Maybe<RelayPool>
  relayPool: Scalars['String']['output']
  shareBalance: Scalars['BigInt']['output']
  totalDeposited: Scalars['BigInt']['output']
  totalWithdrawn: Scalars['BigInt']['output']
  wallet: Scalars['String']['output']
}

export type UserBalanceFilter = {
  AND: InputMaybe<Array<InputMaybe<UserBalanceFilter>>>
  OR: InputMaybe<Array<InputMaybe<UserBalanceFilter>>>
  chainId: InputMaybe<Scalars['Int']['input']>
  chainId_gt: InputMaybe<Scalars['Int']['input']>
  chainId_gte: InputMaybe<Scalars['Int']['input']>
  chainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  chainId_lt: InputMaybe<Scalars['Int']['input']>
  chainId_lte: InputMaybe<Scalars['Int']['input']>
  chainId_not: InputMaybe<Scalars['Int']['input']>
  chainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  lastUpdated: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_gt: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_gte: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  lastUpdated_lt: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_lte: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_not: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  relayPool: InputMaybe<Scalars['String']['input']>
  relayPool_contains: InputMaybe<Scalars['String']['input']>
  relayPool_ends_with: InputMaybe<Scalars['String']['input']>
  relayPool_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  relayPool_not: InputMaybe<Scalars['String']['input']>
  relayPool_not_contains: InputMaybe<Scalars['String']['input']>
  relayPool_not_ends_with: InputMaybe<Scalars['String']['input']>
  relayPool_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  relayPool_not_starts_with: InputMaybe<Scalars['String']['input']>
  relayPool_starts_with: InputMaybe<Scalars['String']['input']>
  shareBalance: InputMaybe<Scalars['BigInt']['input']>
  shareBalance_gt: InputMaybe<Scalars['BigInt']['input']>
  shareBalance_gte: InputMaybe<Scalars['BigInt']['input']>
  shareBalance_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  shareBalance_lt: InputMaybe<Scalars['BigInt']['input']>
  shareBalance_lte: InputMaybe<Scalars['BigInt']['input']>
  shareBalance_not: InputMaybe<Scalars['BigInt']['input']>
  shareBalance_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  totalDeposited: InputMaybe<Scalars['BigInt']['input']>
  totalDeposited_gt: InputMaybe<Scalars['BigInt']['input']>
  totalDeposited_gte: InputMaybe<Scalars['BigInt']['input']>
  totalDeposited_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  totalDeposited_lt: InputMaybe<Scalars['BigInt']['input']>
  totalDeposited_lte: InputMaybe<Scalars['BigInt']['input']>
  totalDeposited_not: InputMaybe<Scalars['BigInt']['input']>
  totalDeposited_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  totalWithdrawn: InputMaybe<Scalars['BigInt']['input']>
  totalWithdrawn_gt: InputMaybe<Scalars['BigInt']['input']>
  totalWithdrawn_gte: InputMaybe<Scalars['BigInt']['input']>
  totalWithdrawn_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  totalWithdrawn_lt: InputMaybe<Scalars['BigInt']['input']>
  totalWithdrawn_lte: InputMaybe<Scalars['BigInt']['input']>
  totalWithdrawn_not: InputMaybe<Scalars['BigInt']['input']>
  totalWithdrawn_not_in: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >
  wallet: InputMaybe<Scalars['String']['input']>
  wallet_contains: InputMaybe<Scalars['String']['input']>
  wallet_ends_with: InputMaybe<Scalars['String']['input']>
  wallet_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  wallet_not: InputMaybe<Scalars['String']['input']>
  wallet_not_contains: InputMaybe<Scalars['String']['input']>
  wallet_not_ends_with: InputMaybe<Scalars['String']['input']>
  wallet_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  wallet_not_starts_with: InputMaybe<Scalars['String']['input']>
  wallet_starts_with: InputMaybe<Scalars['String']['input']>
}

export type UserBalancePage = {
  __typename?: 'userBalancePage'
  items: Array<UserBalance>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type VaultSnapshot = {
  __typename?: 'vaultSnapshot'
  blockNumber: Scalars['BigInt']['output']
  chainId: Scalars['Int']['output']
  pool: Maybe<RelayPool>
  sharePrice: Scalars['String']['output']
  timestamp: Scalars['BigInt']['output']
  vault: Scalars['String']['output']
  yieldPoolSharePrice: Scalars['String']['output']
}

export type VaultSnapshotFilter = {
  AND: InputMaybe<Array<InputMaybe<VaultSnapshotFilter>>>
  OR: InputMaybe<Array<InputMaybe<VaultSnapshotFilter>>>
  blockNumber: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gt: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_gte: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  blockNumber_lt: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_lte: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not: InputMaybe<Scalars['BigInt']['input']>
  blockNumber_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  chainId: InputMaybe<Scalars['Int']['input']>
  chainId_gt: InputMaybe<Scalars['Int']['input']>
  chainId_gte: InputMaybe<Scalars['Int']['input']>
  chainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  chainId_lt: InputMaybe<Scalars['Int']['input']>
  chainId_lte: InputMaybe<Scalars['Int']['input']>
  chainId_not: InputMaybe<Scalars['Int']['input']>
  chainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  sharePrice: InputMaybe<Scalars['String']['input']>
  sharePrice_contains: InputMaybe<Scalars['String']['input']>
  sharePrice_ends_with: InputMaybe<Scalars['String']['input']>
  sharePrice_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  sharePrice_not: InputMaybe<Scalars['String']['input']>
  sharePrice_not_contains: InputMaybe<Scalars['String']['input']>
  sharePrice_not_ends_with: InputMaybe<Scalars['String']['input']>
  sharePrice_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  sharePrice_not_starts_with: InputMaybe<Scalars['String']['input']>
  sharePrice_starts_with: InputMaybe<Scalars['String']['input']>
  timestamp: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  timestamp_lt: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  vault: InputMaybe<Scalars['String']['input']>
  vault_contains: InputMaybe<Scalars['String']['input']>
  vault_ends_with: InputMaybe<Scalars['String']['input']>
  vault_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  vault_not: InputMaybe<Scalars['String']['input']>
  vault_not_contains: InputMaybe<Scalars['String']['input']>
  vault_not_ends_with: InputMaybe<Scalars['String']['input']>
  vault_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  vault_not_starts_with: InputMaybe<Scalars['String']['input']>
  vault_starts_with: InputMaybe<Scalars['String']['input']>
  yieldPoolSharePrice: InputMaybe<Scalars['String']['input']>
  yieldPoolSharePrice_contains: InputMaybe<Scalars['String']['input']>
  yieldPoolSharePrice_ends_with: InputMaybe<Scalars['String']['input']>
  yieldPoolSharePrice_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  yieldPoolSharePrice_not: InputMaybe<Scalars['String']['input']>
  yieldPoolSharePrice_not_contains: InputMaybe<Scalars['String']['input']>
  yieldPoolSharePrice_not_ends_with: InputMaybe<Scalars['String']['input']>
  yieldPoolSharePrice_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  yieldPoolSharePrice_not_starts_with: InputMaybe<Scalars['String']['input']>
  yieldPoolSharePrice_starts_with: InputMaybe<Scalars['String']['input']>
}

export type VaultSnapshotPage = {
  __typename?: 'vaultSnapshotPage'
  items: Array<VaultSnapshot>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type YieldPool = {
  __typename?: 'yieldPool'
  asset: Scalars['String']['output']
  chainId: Scalars['Int']['output']
  contractAddress: Scalars['String']['output']
  lastUpdated: Scalars['BigInt']['output']
  name: Scalars['String']['output']
}

export type YieldPoolFilter = {
  AND: InputMaybe<Array<InputMaybe<YieldPoolFilter>>>
  OR: InputMaybe<Array<InputMaybe<YieldPoolFilter>>>
  asset: InputMaybe<Scalars['String']['input']>
  asset_contains: InputMaybe<Scalars['String']['input']>
  asset_ends_with: InputMaybe<Scalars['String']['input']>
  asset_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  asset_not: InputMaybe<Scalars['String']['input']>
  asset_not_contains: InputMaybe<Scalars['String']['input']>
  asset_not_ends_with: InputMaybe<Scalars['String']['input']>
  asset_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  asset_not_starts_with: InputMaybe<Scalars['String']['input']>
  asset_starts_with: InputMaybe<Scalars['String']['input']>
  chainId: InputMaybe<Scalars['Int']['input']>
  chainId_gt: InputMaybe<Scalars['Int']['input']>
  chainId_gte: InputMaybe<Scalars['Int']['input']>
  chainId_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  chainId_lt: InputMaybe<Scalars['Int']['input']>
  chainId_lte: InputMaybe<Scalars['Int']['input']>
  chainId_not: InputMaybe<Scalars['Int']['input']>
  chainId_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  contractAddress: InputMaybe<Scalars['String']['input']>
  contractAddress_contains: InputMaybe<Scalars['String']['input']>
  contractAddress_ends_with: InputMaybe<Scalars['String']['input']>
  contractAddress_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  contractAddress_not: InputMaybe<Scalars['String']['input']>
  contractAddress_not_contains: InputMaybe<Scalars['String']['input']>
  contractAddress_not_ends_with: InputMaybe<Scalars['String']['input']>
  contractAddress_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  contractAddress_not_starts_with: InputMaybe<Scalars['String']['input']>
  contractAddress_starts_with: InputMaybe<Scalars['String']['input']>
  lastUpdated: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_gt: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_gte: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  lastUpdated_lt: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_lte: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_not: InputMaybe<Scalars['BigInt']['input']>
  lastUpdated_not_in: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  name: InputMaybe<Scalars['String']['input']>
  name_contains: InputMaybe<Scalars['String']['input']>
  name_ends_with: InputMaybe<Scalars['String']['input']>
  name_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  name_not: InputMaybe<Scalars['String']['input']>
  name_not_contains: InputMaybe<Scalars['String']['input']>
  name_not_ends_with: InputMaybe<Scalars['String']['input']>
  name_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  name_not_starts_with: InputMaybe<Scalars['String']['input']>
  name_starts_with: InputMaybe<Scalars['String']['input']>
}

export type YieldPoolPage = {
  __typename?: 'yieldPoolPage'
  items: Array<YieldPool>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GetAllPoolsQueryVariables = Exact<{
  limit: InputMaybe<Scalars['Int']['input']>
  originsLimit: InputMaybe<Scalars['Int']['input']>
  snapshotsLimit: InputMaybe<Scalars['Int']['input']>
  targetTimestamp: Scalars['BigInt']['input']
  orderDirection: Scalars['String']['input']
}>

export type GetAllPoolsQuery = {
  __typename?: 'Query'
  relayPools: {
    __typename?: 'relayPoolPage'
    items: Array<{
      __typename?: 'relayPool'
      asset: string
      contractAddress: string
      totalAssets: any
      outstandingDebt: any
      chainId: number
      origins: {
        __typename?: 'poolOriginPage'
        totalCount: number
        items: Array<{
          __typename?: 'poolOrigin'
          proxyBridge: string
          originChainId: number
          originBridge: string
        }>
      } | null
      snapshots: {
        __typename?: 'vaultSnapshotPage'
        items: Array<{
          __typename?: 'vaultSnapshot'
          vault: string
          blockNumber: any
          timestamp: any
          sharePrice: string
          yieldPoolSharePrice: string
        }>
      } | null
    }>
  }
}

export type GetRelayPoolQueryVariables = Exact<{
  contractAddress: Scalars['String']['input']
  chainId: Scalars['Float']['input']
}>

export type GetRelayPoolQuery = {
  __typename?: 'Query'
  relayPool: {
    __typename?: 'relayPool'
    contractAddress: string
    curator: string
    asset: string
    yieldPool: string
    outstandingDebt: any
    totalAssets: any
    totalShares: any
    chainId: number
    createdAt: any
    createdAtBlock: any
  } | null
}

export type GetAllBridgeTransactionsByTypeQueryVariables = Exact<{
  nativeBridgeStatus: Scalars['String']['input']
  limit: InputMaybe<Scalars['Int']['input']>
}>

export type GetAllBridgeTransactionsByTypeQuery = {
  __typename?: 'Query'
  bridgeTransactions: {
    __typename?: 'bridgeTransactionPage'
    items: Array<{
      __typename?: 'bridgeTransaction'
      originBridgeAddress: string
      nonce: any
      originChainId: number
      destinationPoolAddress: string
      destinationPoolChainId: number
      originSender: string
      destinationRecipient: string
      asset: string
      amount: any
      hyperlaneMessageId: string
      nativeBridgeStatus: string
      opProofTxHash: string | null
      nativeBridgeFinalizedTxHash: string | null
      loanEmittedTxHash: string | null
      originTimestamp: any
      originTxHash: string
    }>
  }
}

export type GetPoolDetailsQueryVariables = Exact<{
  poolAddress: Scalars['String']['input']
  chainId: Scalars['Float']['input']
  originsLimit: InputMaybe<Scalars['Int']['input']>
  snapshotsLimit: InputMaybe<Scalars['Int']['input']>
  targetTimestamp: Scalars['BigInt']['input']
  orderDirection: Scalars['String']['input']
}>

export type GetPoolDetailsQuery = {
  __typename?: 'Query'
  relayPool: {
    __typename?: 'relayPool'
    yieldPool: string
    contractAddress: string
    chainId: number
    asset: string
    totalAssets: any
    totalShares: any
    outstandingDebt: any
    totalBridgeFees: any
    origins: {
      __typename?: 'poolOriginPage'
      totalCount: number
      items: Array<{
        __typename?: 'poolOrigin'
        chainId: number
        proxyBridge: string
        bridgeFee: number
        coolDown: number
        originChainId: number
        originBridge: string
        currentOutstandingDebt: any
        maxDebt: any
      }>
    } | null
    snapshots: {
      __typename?: 'vaultSnapshotPage'
      items: Array<{
        __typename?: 'vaultSnapshot'
        vault: string
        blockNumber: any
        timestamp: any
        sharePrice: string
        yieldPoolSharePrice: string
      }>
    } | null
  } | null
}

export type GetYieldPoolQueryVariables = Exact<{
  yieldPoolAddress: Scalars['String']['input']
  chainId: Scalars['Float']['input']
}>

export type GetYieldPoolQuery = {
  __typename?: 'Query'
  yieldPool: {
    __typename?: 'yieldPool'
    contractAddress: string
    name: string
    lastUpdated: any
  } | null
}

export type GetVolumeQueryVariables = Exact<{
  poolAddress: Scalars['String']['input']
  fromTimestamp: Scalars['BigInt']['input']
  limit: InputMaybe<Scalars['Int']['input']>
}>

export type GetVolumeQuery = {
  __typename?: 'Query'
  bridgeTransactions: {
    __typename?: 'bridgeTransactionPage'
    items: Array<{ __typename?: 'bridgeTransaction'; amount: any }>
  }
}

export type GetUserBalancesQueryVariables = Exact<{
  walletAddress: Scalars['String']['input']
  limit: InputMaybe<Scalars['Int']['input']>
}>

export type GetUserBalancesQuery = {
  __typename?: 'Query'
  userBalances: {
    __typename?: 'userBalancePage'
    items: Array<{
      __typename?: 'userBalance'
      relayPool: string
      shareBalance: any
      totalDeposited: any
      totalWithdrawn: any
      pool: {
        __typename?: 'relayPool'
        contractAddress: string
        asset: string
        totalAssets: any
        totalShares: any
        chainId: number
      } | null
    }>
  }
}

export type GetUserBalanceForPoolQueryVariables = Exact<{
  walletAddress: Scalars['String']['input']
  poolAddress: Scalars['String']['input']
  limit: InputMaybe<Scalars['Int']['input']>
}>

export type GetUserBalanceForPoolQuery = {
  __typename?: 'Query'
  userBalances: {
    __typename?: 'userBalancePage'
    items: Array<{
      __typename?: 'userBalance'
      shareBalance: any
      totalDeposited: any
      totalWithdrawn: any
      pool: {
        __typename?: 'relayPool'
        contractAddress: string
        asset: string
        chainId: number
        totalAssets: any
        totalShares: any
      } | null
    }>
  }
}

export const GetAllPoolsDocument = gql`
  query GetAllPools(
    $limit: Int
    $originsLimit: Int
    $snapshotsLimit: Int
    $targetTimestamp: BigInt!
    $orderDirection: String!
  ) {
    relayPools(limit: $limit) {
      items {
        asset
        contractAddress
        totalAssets
        outstandingDebt
        chainId
        origins(limit: $originsLimit) {
          totalCount
          items {
            proxyBridge
            originChainId
            originBridge
          }
        }
        snapshots(
          limit: $snapshotsLimit
          where: { timestamp_lte: $targetTimestamp }
          orderBy: "blockNumber"
          orderDirection: $orderDirection
        ) {
          items {
            vault
            blockNumber
            timestamp
            sharePrice
            yieldPoolSharePrice
          }
        }
      }
    }
  }
`
export const GetRelayPoolDocument = gql`
  query GetRelayPool($contractAddress: String!, $chainId: Float!) {
    relayPool(contractAddress: $contractAddress, chainId: $chainId) {
      contractAddress
      curator
      asset
      yieldPool
      outstandingDebt
      totalAssets
      totalShares
      chainId
      createdAt
      createdAtBlock
    }
  }
`
export const GetAllBridgeTransactionsByTypeDocument = gql`
  query GetAllBridgeTransactionsByType(
    $nativeBridgeStatus: String!
    $limit: Int
  ) {
    bridgeTransactions(
      where: { nativeBridgeStatus: $nativeBridgeStatus }
      limit: $limit
    ) {
      items {
        originBridgeAddress
        nonce
        originChainId
        destinationPoolAddress
        destinationPoolChainId
        originSender
        destinationRecipient
        asset
        amount
        hyperlaneMessageId
        nativeBridgeStatus
        opProofTxHash
        nativeBridgeFinalizedTxHash
        loanEmittedTxHash
        originTimestamp
        originTxHash
      }
    }
  }
`
export const GetPoolDetailsDocument = gql`
  query GetPoolDetails(
    $poolAddress: String!
    $chainId: Float!
    $originsLimit: Int
    $snapshotsLimit: Int
    $targetTimestamp: BigInt!
    $orderDirection: String!
  ) {
    relayPool(contractAddress: $poolAddress, chainId: $chainId) {
      yieldPool
      contractAddress
      chainId
      asset
      totalAssets
      totalShares
      outstandingDebt
      totalBridgeFees
      origins(limit: $originsLimit) {
        totalCount
        items {
          chainId
          proxyBridge
          bridgeFee
          coolDown
          originChainId
          originBridge
          currentOutstandingDebt
          maxDebt
        }
      }
      snapshots(
        limit: $snapshotsLimit
        where: { timestamp_lte: $targetTimestamp }
        orderBy: "blockNumber"
        orderDirection: $orderDirection
      ) {
        items {
          vault
          blockNumber
          timestamp
          sharePrice
          yieldPoolSharePrice
        }
      }
    }
  }
`
export const GetYieldPoolDocument = gql`
  query GetYieldPool($yieldPoolAddress: String!, $chainId: Float!) {
    yieldPool(contractAddress: $yieldPoolAddress, chainId: $chainId) {
      contractAddress
      name
      lastUpdated
    }
  }
`
export const GetVolumeDocument = gql`
  query GetVolume($poolAddress: String!, $fromTimestamp: BigInt!, $limit: Int) {
    bridgeTransactions(
      where: {
        destinationPoolAddress: $poolAddress
        originTimestamp_gt: $fromTimestamp
      }
      limit: $limit
    ) {
      items {
        amount
      }
    }
  }
`
export const GetUserBalancesDocument = gql`
  query GetUserBalances($walletAddress: String!, $limit: Int) {
    userBalances(where: { wallet: $walletAddress }, limit: $limit) {
      items {
        relayPool
        shareBalance
        totalDeposited
        totalWithdrawn
        pool {
          contractAddress
          asset
          totalAssets
          totalShares
          chainId
        }
      }
    }
  }
`
export const GetUserBalanceForPoolDocument = gql`
  query GetUserBalanceForPool(
    $walletAddress: String!
    $poolAddress: String!
    $limit: Int
  ) {
    userBalances(
      where: { AND: [{ wallet: $walletAddress }, { relayPool: $poolAddress }] }
      limit: $limit
    ) {
      items {
        shareBalance
        totalDeposited
        totalWithdrawn
        pool {
          contractAddress
          asset
          chainId
          totalAssets
          totalShares
        }
      }
    }
  }
`

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables
) => action()
const GetAllPoolsDocumentString = print(GetAllPoolsDocument)
const GetRelayPoolDocumentString = print(GetRelayPoolDocument)
const GetAllBridgeTransactionsByTypeDocumentString = print(
  GetAllBridgeTransactionsByTypeDocument
)
const GetPoolDetailsDocumentString = print(GetPoolDetailsDocument)
const GetYieldPoolDocumentString = print(GetYieldPoolDocument)
const GetVolumeDocumentString = print(GetVolumeDocument)
const GetUserBalancesDocumentString = print(GetUserBalancesDocument)
const GetUserBalanceForPoolDocumentString = print(GetUserBalanceForPoolDocument)
export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    GetAllPools(
      variables: GetAllPoolsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<{
      data: GetAllPoolsQuery
      errors?: GraphQLError[]
      extensions?: any
      headers: Headers
      status: number
    }> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.rawRequest<GetAllPoolsQuery>(
            GetAllPoolsDocumentString,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetAllPools',
        'query',
        variables
      )
    },
    GetRelayPool(
      variables: GetRelayPoolQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<{
      data: GetRelayPoolQuery
      errors?: GraphQLError[]
      extensions?: any
      headers: Headers
      status: number
    }> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.rawRequest<GetRelayPoolQuery>(
            GetRelayPoolDocumentString,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetRelayPool',
        'query',
        variables
      )
    },
    GetAllBridgeTransactionsByType(
      variables: GetAllBridgeTransactionsByTypeQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<{
      data: GetAllBridgeTransactionsByTypeQuery
      errors?: GraphQLError[]
      extensions?: any
      headers: Headers
      status: number
    }> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.rawRequest<GetAllBridgeTransactionsByTypeQuery>(
            GetAllBridgeTransactionsByTypeDocumentString,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetAllBridgeTransactionsByType',
        'query',
        variables
      )
    },
    GetPoolDetails(
      variables: GetPoolDetailsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<{
      data: GetPoolDetailsQuery
      errors?: GraphQLError[]
      extensions?: any
      headers: Headers
      status: number
    }> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.rawRequest<GetPoolDetailsQuery>(
            GetPoolDetailsDocumentString,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetPoolDetails',
        'query',
        variables
      )
    },
    GetYieldPool(
      variables: GetYieldPoolQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<{
      data: GetYieldPoolQuery
      errors?: GraphQLError[]
      extensions?: any
      headers: Headers
      status: number
    }> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.rawRequest<GetYieldPoolQuery>(
            GetYieldPoolDocumentString,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetYieldPool',
        'query',
        variables
      )
    },
    GetVolume(
      variables: GetVolumeQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<{
      data: GetVolumeQuery
      errors?: GraphQLError[]
      extensions?: any
      headers: Headers
      status: number
    }> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.rawRequest<GetVolumeQuery>(
            GetVolumeDocumentString,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetVolume',
        'query',
        variables
      )
    },
    GetUserBalances(
      variables: GetUserBalancesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<{
      data: GetUserBalancesQuery
      errors?: GraphQLError[]
      extensions?: any
      headers: Headers
      status: number
    }> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.rawRequest<GetUserBalancesQuery>(
            GetUserBalancesDocumentString,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetUserBalances',
        'query',
        variables
      )
    },
    GetUserBalanceForPool(
      variables: GetUserBalanceForPoolQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<{
      data: GetUserBalanceForPoolQuery
      errors?: GraphQLError[]
      extensions?: any
      headers: Headers
      status: number
    }> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.rawRequest<GetUserBalanceForPoolQuery>(
            GetUserBalanceForPoolDocumentString,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetUserBalanceForPool',
        'query',
        variables
      )
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>
