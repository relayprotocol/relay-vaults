import { gql } from 'graphql-request'
import { logger } from './logger'

const GET_DELAYED_BRIDGE_TRANSACTIONS = gql`
  query GetDelayedBridgeTransactions($originTimestamp: BigInt!) {
    bridgeTransactions(
      where: {
        originTimestamp_lt: $originTimestamp
        nativeBridgeStatus_in: ["INITIATED"]
      }
    ) {
      items {
        destinationPoolAddress
        destinationPoolChainId

        originChainId
        originBridgeAddress

        originTxHash
        originTimestamp
      }
    }
  }
`

export const checkPendingBridges = async ({ vaultService }) => {
  const { bridgeTransactions } = await vaultService.query(
    GET_DELAYED_BRIDGE_TRANSACTIONS,
    {
      originTimestamp: Math.floor(Date.now() / 1000) - 60 * 60 * 24, // 24 hours ago
    }
  )
  for (const tx of bridgeTransactions.items) {
    logger.warn('Delayed transaction found', {
      ...tx,
    })
  }
}
