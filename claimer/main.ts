import { heartbeat } from './src/tracer'
import { start, stop } from './src/runner'
import { proveTransactions } from './src/prove-transactions'
import { claimTransactions } from './src/claim-withdrawals'
import { finalizeWithdrawals } from './src/finalize-withdrawals'
import { checkL2Chains } from './src/check-l2-status'
import { checkOutstandingDebts } from './src/check-outstading-debts'
import { checkPendingBridges } from './src/check-pending-bridges'

import { logger } from './src/logger'

const run = async () => {
  const { vaultService } = await start()
  await heartbeat()

  // process transactions
  await proveTransactions({ vaultService })
  await finalizeWithdrawals({ vaultService })
  await claimTransactions({ vaultService })

  // Check statuses
  await checkPendingBridges({ vaultService })
  await checkL2Chains()
  await checkOutstandingDebts({ vaultService })
  await stop()
}

run().catch((error: Error) => {
  logger.error(error.message)
  process.exit(1)
})
