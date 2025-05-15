import { RelayVaultService } from '@relay-protocol/client'
import { gql } from 'graphql-request'
import networks from '@relay-protocol/networks'
import { ethers } from 'ethers'
import { claimFunds } from './relay'

const GET_POOLS_AND_PROXY_BRIDGES = gql`
  query {
    relayPools {
      items {
        chainId
        contractAddress
        asset
        origins {
          items {
            originChainId
            originBridge
            proxyBridge
            currentOutstandingDebt
          }
        }
      }
    }
  }
`

// Checks a balance of ETH or ERC20
const getBalance = async (chainId: number, wallet: string, asset: string) => {
  const network = networks[chainId]
  const provider = new ethers.JsonRpcProvider(network.rpc[0])
  if (asset.toLowerCase() == network.assets.weth.toLowerCase()) {
    return provider.getBalance(wallet)
  } else {
    const erc20 = new ethers.Contract(
      asset,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    )
    return await erc20.balanceOf(wallet)
  }
}

// List all origins and check their balances
export const claimTransactions = async ({
  vaultService,
}: {
  vaultService: RelayVaultService
}) => {
  const { relayPools } = await vaultService.query(GET_POOLS_AND_PROXY_BRIDGES)
  for (const relayPool of relayPools.items) {
    for (const origin of relayPool.origins.items) {
      // Check if there is an oustanding balance for the origin!
      const balance = await getBalance(
        relayPool.chainId,
        origin.proxyBridge,
        relayPool.asset
      )

      if (balance >= 0 && BigInt(origin.currentOutstandingDebt) > 0) {
        console.log(
          `Claim funds (${BigInt(origin.currentOutstandingDebt)}) for ${relayPool.contractAddress} on ${origin.proxyBridge} from ${origin.originChainId} ${origin.originBridge}`
        )
        await claimFunds(
          relayPool.chainId,
          relayPool.contractAddress,
          origin.originChainId,
          origin.originBridge
        )
      }
    }
  }
}
