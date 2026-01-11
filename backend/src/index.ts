/**
 * This indexer tracks and maintains the state of the Relay Lending Protocol across multiple chains.
 *
 * 1. Pool transaction tracking
 * 2. Yield strategy performance metrics
 *
 * Performance Considerations:
 * - Uses efficient upsert patterns for balance updates
 * - Maintains normalized data structure for quick queries
 *
 * Database Schema Design:
 * - Pool transactions are tracked in real-time
 * - Yield strategies track both actions and current balances
 *
 * @note This indexer assumes events are received in chronological order per chain
 */

import { ponder } from 'ponder:registry'
import Deposit from './handlers/RelayPool/Deposit'
import Withdraw from './handlers/RelayPool/Withdraw'
import Transfer from './handlers/RelayPool/Transfer'
import PoolDeployed from './handlers/RelayPoolFactory/PoolDeployed'
import BridgeDeployed from './handlers/RelayBridgeFactory/BridgeDeployed'
import BridgeInitiated from './handlers/RelayBridge/BridgeInitiated'
import OriginAdded from './handlers/RelayPool/OriginAdded'
import OriginDisabled from './handlers/RelayPool/OriginDisabled'
import LoanEmitted from './handlers/RelayPool/LoanEmitted'
import OutstandingDebtChanged from './handlers/RelayPool/OutstandingDebtChanged'
import WithdrawalProven from './handlers/OPPortal/WithdrawalProven'
import WithdrawalFinalized from './handlers/OPPortal/WithdrawalFinalized'
import OutBoxTransactionExecuted from './handlers/OrbitOutbox/OutBoxTransactionExecuted'
import BridgeMint from './handlers/Zksync/BridgeMint'
import RoleGranted from './handlers/RelayPoolTimelock/RoleGranted'
import RoleRevoked from './handlers/RelayPoolTimelock/RoleRevoked'
import OwnershipTransferred from './handlers/RelayPool/OwnershipTransferred'
import YieldPoolChanged from './handlers/RelayPool/YieldPoolChanged'
import PoolSnapshot from './handlers/PoolSnapshot'
import { logEvent } from './logger'

// ============= Block handlers  =============
logEvent(ponder, 'PoolSnapshot:block', PoolSnapshot)

// ============= RelayPool Events =============

/**
 * Handles deposits into the RelayPool
 * Updates:
 * - Pool total assets and shares
 * - User balance records
 * - Yield pool state
 * - Creates pool action record
 */
logEvent(ponder, 'RelayPool:Deposit', Deposit)

/**
 * Handles withdrawals from the RelayPool
 * Updates:
 * - Pool total assets and shares
 * - User balance records
 * - Yield pool state
 * - Creates pool action record
 */
logEvent(ponder, 'RelayPool:Withdraw', Withdraw)

logEvent(ponder, 'RelayPool:Transfer', Transfer)

/**
 * Handles the deployment of a new RelayPool
 * Creates:
 * - New relay pool record
 * - Associated yield pool record
 * - Initial origin configurations
 */
logEvent(ponder, 'RelayPoolFactory:PoolDeployed', PoolDeployed)

/**
 * Handles the deployment of a new RelayBridge
 * Creates:
 * - New bridge contract record
 * - Initializes transfer nonce tracking
 */
logEvent(ponder, 'RelayBridgeFactory:BridgeDeployed', BridgeDeployed)

/**
 * Handles the initiation of a RelayBridge transaction
 * Creates:
 * - Bridge transaction record
 * - Links origin and destination pools
 * - Tracks cross-chain message status
 */
logEvent(ponder, 'RelayBridge:BridgeInitiated', BridgeInitiated)

/**
 * Handles the addition of a new origin to a RelayPool
 * Creates:
 * - New pool origin record
 * - Links bridge and proxy bridge contracts
 * - Sets initial debt limits
 */

// Removed commented-out overload blocks for 'RelayPool:OriginAdded' to reduce clutter and improve readability.
logEvent(ponder, 'RelayPool:OriginAdded', OriginAdded)

/**
 * Handles the disabling of an origin in a RelayPool
 */
logEvent(ponder, 'RelayPool:OriginDisabled', OriginDisabled)

/**
 * Handles Hyperlane messages when they successfully reached the pool and a new loan is emitted
 */
logEvent(ponder, 'RelayPool:LoanEmitted', LoanEmitted)

/**
 * Handles the change of the outstanding debt of a relay pool
 */
logEvent(ponder, 'RelayPool:OutstandingDebtChanged', OutstandingDebtChanged)

/**
 * Handles proven withdrawals from the OP portal
 */
logEvent(
  ponder,
  'OPPortal:WithdrawalProven(bytes32 indexed withdrawalHash, address indexed from, address indexed to)',
  WithdrawalProven
)

/**
 * Handles proven withdrawals from the OP portal for Blast
 */
logEvent(
  ponder,
  'OPPortal:WithdrawalProven(bytes32 indexed withdrawalHash, address indexed from, address indexed to, uint256 requestId)',
  WithdrawalProven
)

/**
 * Handles finalized withdrawals from the OP portal
 */
logEvent(
  ponder,
  'OPPortal:WithdrawalFinalized(bytes32 indexed withdrawalHash, bool success)',
  WithdrawalFinalized
)

/**
 * Handles finalized withdrawals from the OP portal for Blast
 */
logEvent(
  ponder,
  'OPPortal:WithdrawalFinalized(bytes32 indexed withdrawalHash, uint256 indexed hintId, bool success)',
  WithdrawalFinalized
)

/**
 * Handles completed withdrawals from the Orbit Outbox
 */
logEvent(
  ponder,
  'OrbitOutbox:OutBoxTransactionExecuted',
  OutBoxTransactionExecuted
)

/**
 * Handles finalzied withdrawals for the ZkSync stack
 */
logEvent(ponder, 'L1NativeTokenVault:BridgeMint', BridgeMint)

// ============= RelayPoolTimelock Events =============
logEvent(ponder, 'RelayPool:OwnershipTransferred', OwnershipTransferred)
logEvent(ponder, 'RelayPoolTimelock:RoleGranted', RoleGranted)
logEvent(ponder, 'RelayPoolTimelock:RoleRevoked', RoleRevoked)

/**
 * Handles the change of the yield pool
 */
logEvent(ponder, 'RelayPool:YieldPoolChanged', YieldPoolChanged)
