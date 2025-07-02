import { gql } from 'graphql-request'
import { logger } from './logger'

const GET_OUTSTANDING_DEBTS = gql`
  query {
    relayPools {
      items {
        chainId
        contractAddress
        outstandingDebt
        origins(where: { maxDebt_gt: "0" }) {
          items {
            currentOutstandingDebt
          }
        }
      }
    }
  }
`

export const checkOutstandingDebts = async ({ vaultService }) => {
  const { relayPools } = await vaultService.query(GET_OUTSTANDING_DEBTS)
  for (let i = 0; i < relayPools.items.length; i++) {
    const { outstandingDebt, origins, chainId, contractAddress } =
      relayPools.items[i]
    // verify that it matches the sum of all origins' currentOutstandingDebt
    const totalOriginOutstandingDebt = origins.items.reduce(
      (acc, origin) => acc + BigInt(origin.currentOutstandingDebt),
      BigInt(0)
    )
    if (totalOriginOutstandingDebt !== BigInt(outstandingDebt)) {
      logger.error('debt mismatch', {
        chainId,
        contractAddress,
        outstandingDebt,
        totalOriginOutstandingDebt,
      })
    }
  }
}
