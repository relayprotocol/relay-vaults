import { RelayVaultService } from '@relay-protocol/client'
import { gql } from 'graphql-request'
import { finalizeWithdrawal } from './relay'

// TODO: handle time? Each chain has its own delay
const GET_ALL_TRANSACTIONS_TO_FINALIZE = gql`
  query GetAllBridgeTransactionsToProve(
    $nativeBridgeStatus: String!
    $originTimestamp: BigInt!
  ) {
    bridgeTransactions(
      where: {
        nativeBridgeStatus: $nativeBridgeStatus
        originTimestamp_lt: $originTimestamp
      }
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

export const finalizeWithdrawals = async ({
  vaultService,
}: {
  vaultService: RelayVaultService
}) => {
  const { bridgeTransactions } = await vaultService.query(
    GET_ALL_TRANSACTIONS_TO_FINALIZE,
    {
      nativeBridgeStatus: 'INITIATED',
      originTimestamp:
        Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7,
    }
  )
  for (let i = 0; i < bridgeTransactions.items.length; i++) {
    try {
      const bridgeTransaction = bridgeTransactions.items[i]
      // await finalizeWithdrawal(bridgeTransaction)
    } catch (error) {
      console.error(error)
    }
  }
}
