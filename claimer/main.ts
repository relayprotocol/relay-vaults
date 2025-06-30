import { start, stop } from './src/runner'
import { proveTransactions } from './src/prove-transactions'
import { claimTransactions } from './src/claim-withdrawals'
import { finalizeWithdrawals } from './src/finalize-withdrawals'
import { checkL2Chains } from './src/check-l2-status'
import { checkOutstandingDebts } from './src/check-outstading-debts'
import { logger } from './src/logger'

const run = async () => {
  const { vaultService } = await start()
  await checkOutstandingDebts({ vaultService })
  await proveTransactions({ vaultService })
  await finalizeWithdrawals({ vaultService })
  await claimTransactions({ vaultService })
  await checkL2Chains()
  await stop()
}

run().catch((error: Error) => {
  logger.error(error.message)
  process.exit(1)
})
