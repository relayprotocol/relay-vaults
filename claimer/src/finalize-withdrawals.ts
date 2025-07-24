import { RelayVaultService } from '@relay-vaults/client'
import { gql } from 'graphql-request'
import { finalizeWithdrawal } from './relay'
import { logger } from './logger'

// The solver needs opProofTxHash in some cases (Blast)
const GET_ALL_TRANSACTIONS_TO_FINALIZE = gql`
  query GetAllBridgeTransactionsToFinalize(
    $expectedFinalizationTimestamp: BigInt!
  ) {
    bridgeTransactions(
      where: {
        expectedFinalizationTimestamp_lt: $expectedFinalizationTimestamp
        nativeBridgeStatus_in: ["HANDLED", "PROVEN"]
      }
    ) {
      items {
        originChainId
        destinationPoolChainId
        asset
        amount
        originTxHash
        originTimestamp
        opProofTxHash
      }
    }
  }
`

export const finalizeWithdrawals = async ({
  vaultService,
}: {
  vaultService: RelayVaultService
}) => {
  // query ready withdrawal for all chains
  const now = Math.floor(new Date().getTime() / 1000)
  const { bridgeTransactions } = await vaultService.query(
    GET_ALL_TRANSACTIONS_TO_FINALIZE,
    {
      expectedFinalizationTimestamp: now,
    }
  )

  for (let i = 0; i < bridgeTransactions.items.length; i++) {
    try {
      const bridgeTransaction = bridgeTransactions.items[i]
      await finalizeWithdrawal(bridgeTransaction)
    } catch (error) {
      logger.error(error)
    }
  }
}
