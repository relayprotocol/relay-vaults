import { gql } from 'graphql-request'
import { RelayVaultService } from '@relay-vaults/client'
import networks from '@relay-vaults/networks'
import { OriginNetworkConfig } from '@relay-vaults/types'
import { submitProof } from './relay'
import { logger } from './logger'

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
        originChainId
        destinationPoolChainId
        asset
        amount
        originTxHash
        originTimestamp
      }
    }
  }
`

const OpChains: (number | bigint)[] = (
  Object.values(networks) as OriginNetworkConfig[]
)
  .filter((n) => n.stack === 'optimism' || n.stack === 'optimism-alt')
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
      logger.error(error)
    }
  }
}
