import { start, stop } from './src/runner'
import { proveTransactions } from './src/prove-transactions'
import { claimTransactions } from './src/claim-withdrawals'
import { finalizeWithdrawals } from './src/finalize-withdrawals'
import { checkL2Chains } from './src/check-l2-status'
import { logger } from './src/logger'

const run = async () => {
  const { vaultService } = await start()
  await proveTransactions({ vaultService })
  await finalizeWithdrawals({ vaultService })
  await claimTransactions({ vaultService })
  await checkL2Chains()
  await stop()
  logger.info('Done!')
}

run().catch((error) => {
  logger.error(error)
  process.exit(1)
})
