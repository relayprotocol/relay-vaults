import { ZeroAddress } from 'ethers'
import networks from '@relay-vaults/networks'
import { OriginNetworkConfig } from '@relay-vaults/types'
import { logger } from './logger'

if (!process.env.RELAY_API_ENDPOINT) {
  throw new Error('RELAY_API_ENDPOINT environment variable is not set')
}

interface BridgeTransaction {
  amount: string
  asset: string
  originChainId: string
  originTxHash: string
  destinationPoolChainId: string
  originTimestamp: number
}

const sendRequest = async (endpoint: string, body: any) => {
  const response = await fetch(endpoint, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-vault-api-key': process.env.RELAY_VAULTS_CLAIMER_TOKEN!,
    },
    method: 'POST',
  })
  if (response.status !== 200) {
    const text = await response.text()
    logger.error(`Relay API returned ${response.status}: ${text}`)
  }

  return
}

const after = (timestamp: number) => {
  const now = Math.floor(new Date().getTime() / 1000)
  const diff = now - timestamp // in seconds
  if (diff < 60 * 60) {
    const minutes = Math.floor(diff / 60)
    return `${minutes} minutes`
  }
  if (diff < 60 * 60 * 24) {
    const hours = Math.floor(diff / (60 * 60))
    return `${hours} hours`
  }
  const days = Math.floor(diff / (60 * 60 * 24))
  return `${days} days`
}

// Submits a proof (OP stack only)
export const submitProof = async (bridgeTransaction: BridgeTransaction) => {
  const originNetwork = networks[
    bridgeTransaction.originChainId
  ] as OriginNetworkConfig
  logger.info(
    `Submitting proof after ${after(bridgeTransaction.originTimestamp)} for ${bridgeTransaction.originTxHash} on ${originNetwork.name}`
  )
  await sendRequest(
    `${process.env.RELAY_API_ENDPOINT}/admin/execute-withdrawal`,
    {
      amount: bridgeTransaction.amount,
      currencyId: bridgeTransaction.asset === ZeroAddress ? 'eth' : 'erc20',
      needsProving: true,
      originChainId: bridgeTransaction.originChainId,
      stack: originNetwork.stack,
      txHash: bridgeTransaction.originTxHash,
    }
  )
}

// Finalize the withdrawal (after 7 days)
export const finalizeWithdrawal = async (
  bridgeTransaction: BridgeTransaction
) => {
  const stack = (
    networks[bridgeTransaction.originChainId] as OriginNetworkConfig
  ).stack
  logger.info(
    `Finalizing ${bridgeTransaction.originTxHash} on ${stack} after ${after(bridgeTransaction.originTimestamp)}`
  )
  await sendRequest(
    `${process.env.RELAY_API_ENDPOINT}/admin/execute-withdrawal`,
    {
      amount: bridgeTransaction.amount,
      currencyId: bridgeTransaction.asset === ZeroAddress ? 'eth' : 'erc20',
      needsProving: false,
      originChainId: bridgeTransaction.originChainId,
      proveTxHash: bridgeTransaction.opProofTxHash,
      stack: stack,
      txHash: bridgeTransaction.originTxHash,
    }
  )
}

export const claimFunds = async (
  chainId: number,
  poolAddress: string,
  originChainId: number,
  originBridgeAddress: string
) => {
  await sendRequest(`${process.env.RELAY_API_ENDPOINT}/admin/vault-claim`, {
    chainId,
    originBridgeAddress,
    originChainId,
    poolAddress,
  })
}
