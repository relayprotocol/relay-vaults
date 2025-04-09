import { gql } from 'graphql-request'
import { RelayVaultService } from '@relay-protocol/client'
import networks from '@relay-protocol/networks'
import { L2NetworkConfig } from '@relay-protocol/types'
import { submitProof } from './relay'

const GET_ALL_TRANSACTIONS_TO_PROVE = gql`
  query GetAllBridgeTransactionsToProve(
    $nativeBridgeStatus: String!
    $originChainIds: [Int]
    $originTimestamp: BigInt!
  ) {
    bridgeTransactions(
      where: {
        nativeBridgeStatus: $nativeBridgeStatus
        originChainId_in: $originChainIds
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

const OpChains: (number | bigint)[] = (
  Object.values(networks) as L2NetworkConfig[]
)
  .filter((n) => n.stack === 'optimism')
  .map((n) => n.chainId)

// Take all transactions that are initiated and attempts to prove them!
export const proveTransactions = async ({
  vaultService,
}: {
  vaultService: RelayVaultService
}) => {
  const { bridgeTransactions } = await vaultService.query(
    GET_ALL_TRANSACTIONS_TO_PROVE,
    {
      nativeBridgeStatus: 'INITIATED',
      originChainIds: OpChains,
      originTimestamp: Math.floor(new Date().getTime() / 1000) - 60 * 30,
    }
  )
  for (let i = 0; i < bridgeTransactions.items.length; i++) {
    try {
      const bridgeTransaction = bridgeTransactions.items[i]
      await submitProof(bridgeTransaction)
    } catch (error) {
      console.error(error)
    }
  }
}
