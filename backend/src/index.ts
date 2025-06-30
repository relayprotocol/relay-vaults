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

import { traceEvent } from './tracer'
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

// ============= RelayPool Events =============

/**
 * Handles deposits into the RelayPool
 * Updates:
 * - Pool total assets and shares
 * - User balance records
 * - Yield pool state
 * - Creates pool action record
 */
traceEvent(ponder, 'RelayPool:Deposit', Deposit)

/**
 * Handles withdrawals from the RelayPool
 * Updates:
 * - Pool total assets and shares
 * - User balance records
 * - Yield pool state
 * - Creates pool action record
 */
traceEvent(ponder, 'RelayPool:Withdraw', Withdraw)

traceEvent(ponder, 'RelayPool:Transfer', Transfer)

/**
 * Handles the deployment of a new RelayPool
 * Creates:
 * - New relay pool record
 * - Associated yield pool record
 * - Initial origin configurations
 */
traceEvent(ponder, 'RelayPoolFactory:PoolDeployed', PoolDeployed)

/**
 * Handles the deployment of a new RelayBridge
 * Creates:
 * - New bridge contract record
 * - Initializes transfer nonce tracking
 */
traceEvent(ponder, 'RelayBridgeFactory:BridgeDeployed', BridgeDeployed)

/**
 * Handles the initiation of a RelayBridge transaction
 * Creates:
 * - Bridge transaction record
 * - Links origin and destination pools
 * - Tracks cross-chain message status
 */
traceEvent(ponder, 'RelayBridge:BridgeInitiated', BridgeInitiated)

/**
 * Handles the addition of a new origin to a RelayPool
 * Creates:
 * - New pool origin record
 * - Links bridge and proxy bridge contracts
 * - Sets initial debt limits
 */

// Removed commented-out overload blocks for 'RelayPool:OriginAdded' to reduce clutter and improve readability.
traceEvent(ponder, 'RelayPool:OriginAdded', OriginAdded)

/**
 * Handles the disabling of an origin in a RelayPool
 */
traceEvent(ponder, 'RelayPool:OriginDisabled', OriginDisabled)

/**
 * Handles Hyperlane messages when they successfully reached the pool and a new loan is emitted
 */
traceEvent(ponder, 'RelayPool:LoanEmitted', LoanEmitted)


/**
 * Handles the change of the outstanding debt of a relay pool
 */
traceEvent(ponder, 'RelayPool:OutstandingDebtChanged', OutstandingDebtChanged)

/**
 * Handles proven withdrawals from the OP portal
 */
traceEvent(ponder, 'OPPortal:WithdrawalProven', WithdrawalProven)

/**
 * Handles finalzied withdrawals from the OP portal
 */
traceEvent(ponder, 'OPPortal:WithdrawalFinalized', WithdrawalFinalized)

/**
 * Handles completed withdrawals from the Orbit Outbox
 */
traceEvent(
  ponder,
  'OrbitOutbox:OutBoxTransactionExecuted',
  OutBoxTransactionExecuted
)

/**
 * Handles finalzied withdrawals for the ZkSync stack
 */
traceEvent(ponder, 'L1NativeTokenVault:BridgeMint', BridgeMint)

// ============= RelayPoolTimelock Events =============
traceEvent(ponder, 'RelayPool:OwnershipTransferred', OwnershipTransferred)
traceEvent(ponder, 'RelayPoolTimelock:RoleGranted', RoleGranted)
traceEvent(ponder, 'RelayPoolTimelock:RoleRevoked', RoleRevoked)

/**
 * Handles the change of the yield pool
 */
traceEvent(ponder, 'RelayPool:YieldPoolChanged', YieldPoolChanged)
