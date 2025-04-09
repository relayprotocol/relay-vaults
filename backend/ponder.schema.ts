import { index, onchainTable, primaryKey, relations } from 'ponder'

/**
 * Track yield pools
 * - contractAddress: Contract address
 * - asset: Asset (token) address
 * - name: Yield pool name
 * - lastUpdated: Last time the yield pool was updated
 */
export const yieldPool = onchainTable(
  'yield_pool',
  (t) => ({
    asset: t.hex().notNull(),
    chainId: t.integer().notNull(),
    contractAddress: t.hex().notNull(),
    lastUpdated: t.bigint().notNull(),
    name: t.text().notNull(),
  }),
  (table) => ({
    assetIdx: index().on(table.asset),
    chainIdIdx: index().on(table.chainId),
    pk: primaryKey({
      columns: [table.chainId, table.contractAddress],
    }),
  })
)

/**
 * Track relay pools
 * - contractAddress: Contract address
 * - curator: Address of the curator
 * - asset: Asset (token) address
 * - yieldPool: Yield pool address
 * - outstandingDebt: Current outstanding debt
 * - totalAssets: Total assets in pool
 * - totalShares: Total shares issued
 * - totalBridgeFees: Total bridge fees accumulated
 * - chainId: Chain ID where the pool is deployed
 * - createdAt: Block timestamp of creation
 * - createdAtBlock: Block number of creation
 */
export const relayPool = onchainTable(
  'relay_pool',
  (t) => ({
    asset: t.hex().notNull(),
    chainId: t.integer().notNull(),
    contractAddress: t.hex().notNull(),
    createdAt: t.bigint().notNull(),
    createdAtBlock: t.bigint().notNull(),
    curator: t.hex().notNull(),
    name: t.text().notNull(),
    outstandingDebt: t.bigint().notNull(),
    symbol: t.text().notNull(),
    totalAssets: t.bigint().notNull(),
    totalBridgeFees: t.bigint().notNull(),
    totalShares: t.bigint().notNull(),
    yieldPool: t.hex().notNull(),
  }),
  (table) => ({
    assetIdx: index().on(table.asset),
    curatorIdx: index().on(table.curator),
    pk: primaryKey({
      columns: [table.chainId, table.contractAddress],
    }),
    yieldPoolIdx: index().on(table.yieldPool),
  })
)

export const poolOrigin = onchainTable(
  'pool_origin',
  (t) => ({
    bridgeFee: t.integer().notNull(),
    chainId: t.integer().notNull(),
    coolDown: t.integer().notNull(),
    curator: t.hex().notNull(),
    currentOutstandingDebt: t.bigint().notNull(),
    maxDebt: t.bigint().notNull(),
    originBridge: t.hex().notNull(),
    originChainId: t.integer().notNull(),
    pool: t.hex().notNull(),
    proxyBridge: t.hex().notNull(),
  }),
  (table) => ({
    originIdx: index().on(table.originChainId, table.originBridge),
    pk: primaryKey({
      columns: [
        table.chainId,
        table.pool,
        table.originChainId,
        table.originBridge,
      ],
    }),
    poolIdx: index().on(table.chainId, table.pool),
  })
)

export const poolOriginsRelation = relations(relayPool, ({ many }) => ({
  origins: many(poolOrigin),
}))

export const originPoolRelation = relations(poolOrigin, ({ one }) => ({
  pool: one(relayPool, {
    fields: [poolOrigin.pool, poolOrigin.chainId],
    references: [relayPool.contractAddress, relayPool.chainId],
  }),
}))

/**
 * Track pool deposits/withdrawals
 * - type: DEPOSIT or WITHDRAW
 * - user: User address
 * - relayPool: Pool address
 * - assets: Amount of assets
 * - shares: Amount of shares
 * - timestamp: Block timestamp
 * - blockNumber: Block number
 * - transactionHash: Transaction hash
 */
export const poolAction = onchainTable(
  'pool_action',
  (t) => ({
    assets: t.bigint().notNull(),
    blockNumber: t.bigint().notNull(),
    chainId: t.integer().notNull(),
    relayPool: t.hex().notNull(),
    shares: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    transactionHash: t.hex().notNull(),
    type: t.text().notNull(),
    user: t.hex().notNull(),
  }),
  (table) => ({
    assetsIdx: index().on(table.chainId, table.assets),
    pk: primaryKey({
      columns: [table.chainId, table.transactionHash],
    }),
    poolIdx: index().on(table.chainId, table.relayPool),
    userIdx: index().on(table.user),
  })
)

/**
 * Track user balances across all pools
 */
export const userBalance = onchainTable(
  'user_balance',
  (t) => ({
    chainId: t.integer().notNull(),
    lastUpdated: t.bigint().notNull(),
    relayPool: t.hex().notNull(),
    shareBalance: t.bigint().notNull(),
    totalDeposited: t.bigint().notNull(),
    totalWithdrawn: t.bigint().notNull(),
    wallet: t.hex().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.chainId, table.wallet, table.relayPool],
    }),
    relayPoolIdx: index().on(table.chainId, table.relayPool),
    walletIdx: index().on(table.wallet),
  })
)

/**
 * Relations for user balance
 */
export const userBalanceRelations = relations(userBalance, ({ one }) => ({
  pool: one(relayPool, {
    fields: [userBalance.relayPool, userBalance.chainId],
    references: [relayPool.contractAddress, relayPool.chainId],
  }),
}))

/**
 * Relations for relay pool
 */
export const relayPoolRelations = relations(relayPool, ({ many }) => ({
  snapshots: many(vaultSnapshot),
  userBalances: many(userBalance),
}))

export const relayBridge = onchainTable(
  'relay_bridge',
  (t) => ({
    asset: t.hex().notNull(),
    chainId: t.integer().notNull(),
    contractAddress: t.hex().notNull(),
    createdAt: t.bigint().notNull(),
    createdAtBlock: t.bigint().notNull(),
    transferNonce: t.bigint().notNull(),
  }),
  (table) => ({
    assetIdx: index().on(table.asset),
    pk: primaryKey({
      columns: [table.chainId, table.contractAddress],
    }),
  })
)

/**
 * Track bridge transactions across chains
 *
 * Bridge identification:
 * - originBridgeAddress: Bridge contract initiating the transfer
 * - nonce: Unique nonce from the origin bridge
 * - originChainId: Source chain ID
 *
 * Chain/Pool info:
 * - destinationPoolAddress: Destination pool that will receive funds
 * - destinationPoolChainId: Chain ID of the destination pool
 *
 * Transaction participants:
 * - originSender: User who initiated the bridge
 * - destinationRecipient: Address receiving the instant loan
 *
 * Asset details:
 * - asset: Asset contract address being bridged
 * - amount: Amount of asset being bridged
 *
 * Hyperlane:
 * - hyperlaneMessageId: ID of the fast Hyperlane message
 *
 * Bridge status:
 * - nativeBridgeStatus: INITIATED, PROVEN, FINALIZED
 * - nativeBridgeFinalizedTxHash: Transaction hash of finalization
 *
 * Loan tracking:
 * - loanEmittedTxHash: Transaction hash of loan emission
 *
 * Origin transaction:
 * - originTimestamp: Block timestamp when bridge was initiated
 * - originTxHash: Transaction hash of the bridge initiation
 *
 * OP Specifics:
 * - opWithdrawalHash: Withdrawal hash
 * - opProofTxHash: Transaction hash of proof submission
 *
 * ARB Specifics:
 * - arbTransactionIndex
 *
 * ZKSYNC Specifics:
 * - zksyncWithdrawalHash: hash of the message passed from L2 to L1
 * - zksyncFinalizeHash: hash of the tx where withdrawal was finalized (on L1)
 */
export const bridgeTransaction = onchainTable(
  'bridge_transaction',
  (t) => ({
    amount: t.bigint().notNull(),
    arbTransactionIndex: t.bigint(),
    asset: t.hex().notNull(),
    destinationPoolAddress: t.hex().notNull(),
    destinationPoolChainId: t.integer().notNull(),
    destinationRecipient: t.hex().notNull(),
    hyperlaneMessageId: t.hex().notNull(),
    loanEmittedTxHash: t.hex(),
    nativeBridgeFinalizedTxHash: t.hex(),
    nativeBridgeStatus: t.text().notNull(),
    nonce: t.bigint().notNull(),
    opProofTxHash: t.hex(),
    opWithdrawalHash: t.hex(),
    originBridgeAddress: t.hex().notNull(),
    originChainId: t.integer().notNull(),
    originSender: t.hex().notNull(),
    originTimestamp: t.bigint().notNull(),
    originTxHash: t.hex().notNull(),
    zksyncFinalizeHash: t.hex(),
    zksyncWithdrawalHash: t.hex(),
  }),
  (table) => ({
    arbTransactionIndex: index().on(table.arbTransactionIndex),
    assetIdx: index().on(table.asset),
    opWithdrawalHashIdx: index().on(table.opWithdrawalHash),
    originTxHashIdx: index().on(table.originTxHash),
    pk: primaryKey({
      columns: [table.originChainId, table.originBridgeAddress, table.nonce],
    }),
    poolIdx: index().on(
      table.destinationPoolChainId,
      table.destinationPoolAddress
    ),
    senderIdx: index().on(table.originSender),
    zksyncFinalizeHashIdx: index().on(table.zksyncFinalizeHash),
    zksyncWithdrawalHashIdx: index().on(table.zksyncWithdrawalHash),
  })
)

/**
 * Track vault share price snapshots over time
 * - vault: Vault (pool) contract address
 * - chainId: Chain ID of the vault
 * - blockNumber: Block number when the snapshot was taken
 * - timestamp: Block timestamp when the snapshot was taken
 * - sharePrice: Share price at snapshot time, computed via convertToAssets(1e18)
 */
export const vaultSnapshot = onchainTable(
  'vaultSnapshot',
  (t) => ({
    blockNumber: t.bigint().notNull(),
    chainId: t.integer().notNull(),
    sharePrice: t.numeric().notNull(),
    timestamp: t.bigint().notNull(),
    vault: t.hex().notNull(),
    yieldPoolSharePrice: t.numeric().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.chainId, table.blockNumber, table.vault],
    }),
    vaultChainIdx: index().on(table.vault, table.chainId),
  })
)

// relation between poolOrigin and bridgeTransaction
export const poolOriginBridgeTransactions = relations(
  poolOrigin,
  ({ many }) => ({
    transactions: many(bridgeTransaction),
  })
)

// reverse relation between bridgeTransaction and poolOrigin
export const bridgeTransactionOrigin = relations(
  bridgeTransaction,
  ({ one }) => ({
    origin: one(poolOrigin, {
      fields: [
        bridgeTransaction.destinationPoolChainId,
        bridgeTransaction.destinationPoolAddress,
        bridgeTransaction.originChainId,
        bridgeTransaction.originBridgeAddress,
      ],
      references: [
        poolOrigin.chainId,
        poolOrigin.pool,
        poolOrigin.originChainId,
        poolOrigin.originBridge,
      ],
    }),
  })
)

// Update the relation to include chainId in the join condition
export const vaultSnapshotRelations = relations(vaultSnapshot, ({ one }) => ({
  pool: one(relayPool, {
    fields: [vaultSnapshot.vault, vaultSnapshot.chainId],
    references: [relayPool.contractAddress, relayPool.chainId],
  }),
}))
