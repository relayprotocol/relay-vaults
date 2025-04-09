import { ZeroAddress } from 'ethers'
import networks from '@relay-protocol/networks'
import { L2NetworkConfig } from '@relay-protocol/types'

const ENDPOINT = 'https://api.relay.link/admin/execute-withdrawal'
const TESTNETS_ENDPOINT =
  'https://api.testnets.relay.link/admin/execute-withdrawal'

interface BridgeTransaction {
  amount: string
  asset: string
  originChainId: string
  originTxHash: string
  destinationPoolChainId: string
}

const sendRequest = async (endpoint: string, body: any) => {
  return fetch(endpoint, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-vault-api-key': process.env.RELAY_VAULTS_CLAIMER_TOKEN!,
    },
    method: 'POST',
  })
}

// Submits a proof (OP stack only)
export const submitProof = async (bridgeTransaction: BridgeTransaction) => {
  const network = networks[bridgeTransaction.destinationPoolChainId]
  await sendRequest(network.isTestnet ? TESTNETS_ENDPOINT : ENDPOINT, {
    amount: bridgeTransaction.amount,
    currencyId: bridgeTransaction.asset === ZeroAddress ? 'eth' : 'erc20',
    needsProving: true,
    originChainId: bridgeTransaction.originChainId,
    stack: 'optimism',
    txHash: bridgeTransaction.originTxHash,
  })
}

// Finalize the withdrawal (after 7 days)
export const finalizeWithdrawal = async (
  bridgeTransaction: BridgeTransaction
) => {
  const stack = (networks[bridgeTransaction.originChainId] as L2NetworkConfig)
    .stack
  const network = networks[bridgeTransaction.destinationPoolChainId]
  await sendRequest(network.isTestnet ? TESTNETS_ENDPOINT : ENDPOINT, {
    amount: bridgeTransaction.amount,
    currencyId: bridgeTransaction.asset === ZeroAddress ? 'eth' : 'erc20',
    needsProving: false,
    originChainId: bridgeTransaction.originChainId,
    stack: stack,
    txHash: bridgeTransaction.originTxHash,
  })
}

export const claimFunds = async (
  chainId: number,
  poolAddress: string,
  originChainId: number,
  originBridgeAddress: string
) => {
  const network = networks[chainId]
  await sendRequest(network.isTestnet ? TESTNETS_ENDPOINT : ENDPOINT, {
    chainId,
    originBridgeAddress,
    originChainId,
    poolAddress,
  })
}
