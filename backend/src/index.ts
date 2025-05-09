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
ponder.on('RelayPool:Deposit', Deposit)

/**
 * Handles withdrawals from the RelayPool
 * Updates:
 * - Pool total assets and shares
 * - User balance records
 * - Yield pool state
 * - Creates pool action record
 */
ponder.on('RelayPool:Withdraw', Withdraw)

/**
 * Handles the deployment of a new RelayPool
 * Creates:
 * - New relay pool record
 * - Associated yield pool record
 * - Initial origin configurations
 */
ponder.on('RelayPoolFactory:PoolDeployed', PoolDeployed)

/**
 * Handles the deployment of a new RelayBridge
 * Creates:
 * - New bridge contract record
 * - Initializes transfer nonce tracking
 */
ponder.on('RelayBridgeFactory:BridgeDeployed', BridgeDeployed)

/**
 * Handles the initiation of a RelayBridge transaction
 * Creates:
 * - Bridge transaction record
 * - Links origin and destination pools
 * - Tracks cross-chain message status
 */
ponder.on('RelayBridge:BridgeInitiated', BridgeInitiated)

/**
 * Handles the addition of a new origin to a RelayPool
 * Creates:
 * - New pool origin record
 * - Links bridge and proxy bridge contracts
 * - Sets initial debt limits
 */
ponder.on(
  'RelayPool:OriginAdded((address curator, uint32 chainId, address bridge, address proxyBridge, uint256 maxDebt, uint32 bridgeFee, uint32 coolDown) origin)',
  OriginAdded
)
ponder.on(
  'RelayPool:OriginAdded((address curator, uint32 chainId, address bridge, address proxyBridge, uint256 maxDebt, uint16 bridgeFee, uint32 coolDown) origin)',
  OriginAdded
)

/**
 * Handles the disabling of an origin in a RelayPool
 */
ponder.on('RelayPool:OriginDisabled', OriginDisabled)

/**
 * Handles Hyperlane messages when they successfully reached the pool and a new loan is emitted
 */
ponder.on(
  'RelayPool:LoanEmitted(uint256 indexed nonce, address indexed recipient, address asset, uint256 amount, (uint32 chainId, address bridge, address curator, uint256 maxDebt, uint256 outstandingDebt, address proxyBridge, uint32 bridgeFee, uint32 coolDown) origin, uint256 fees)',
  LoanEmitted
)
ponder.on(
  'RelayPool:LoanEmitted(uint256 indexed nonce, address indexed recipient, address asset, uint256 amount, (uint32 chainId, address bridge, address curator, uint256 maxDebt, uint256 outstandingDebt, address proxyBridge, uint16 bridgeFee, uint32 coolDown) origin, uint256 fees)',
  LoanEmitted
)

/**
 * Handles the change of the outstanding debt of a relay pool
 */
ponder.on(
  'RelayPool:OutstandingDebtChanged(uint256 oldDebt, uint256 newDebt, (uint32 chainId, address bridge, address curator, uint256 maxDebt, uint256 outstandingDebt, address proxyBridge, uint32 bridgeFee, uint32 coolDown) origin, uint256 oldOriginDebt, uint256 newOriginDebt)',
  OutstandingDebtChanged
)
ponder.on(
  'RelayPool:OutstandingDebtChanged(uint256 oldDebt, uint256 newDebt, (uint32 chainId, address bridge, address curator, uint256 maxDebt, uint256 outstandingDebt, address proxyBridge, uint16 bridgeFee, uint32 coolDown) origin, uint256 oldOriginDebt, uint256 newOriginDebt)',
  OutstandingDebtChanged
)

/**
 * Handles proven withdrawals from the OP portal
 */
ponder.on('OPPortal:WithdrawalProven', WithdrawalProven)

/**
 * Handles finalzied withdrawals from the OP portal
 */
ponder.on('OPPortal:WithdrawalFinalized', WithdrawalFinalized)

/**
 * Handles completed withdrawals from the Orbit Outbox
 */
ponder.on('OrbitOutbox:OutBoxTransactionExecuted', OutBoxTransactionExecuted)

/**
 * Handles finalzied withdrawals for the ZkSync stack
 */
ponder.on('L1NativeTokenVault:BridgeMint', BridgeMint)

// ============= RelayPoolTimelock Events =============
ponder.on('RelayPool:OwnershipTransferred', OwnershipTransferred)
ponder.on('RelayPoolTimelock:RoleGranted', RoleGranted)
ponder.on('RelayPoolTimelock:RoleRevoked', RoleRevoked)

/**
 * Handles the change of the yield pool
 */
ponder.on('RelayPool:YieldPoolChanged', YieldPoolChanged)
