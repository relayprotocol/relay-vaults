import { ZeroAddress } from 'ethers'
import networks from '@relay-protocol/networks'
import { L2NetworkConfig } from '@relay-protocol/types'

const ENDPOINT = 'https://api.relay.link/admin/execute-withdrawal'

interface BridgeTransaction {
  amount: string
  asset: string
  originChainId: string
  originTxHash: string
}

const relayChainStackMapping = {
  arb: 'arbitrum',
  op: 'optimism',
  zkevm: 'zkevm',
  zksync: 'zksync',
}

const sendRequest = async (body: any) => {
  return fetch(ENDPOINT, {
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
  await sendRequest({
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
  await sendRequest({
    amount: bridgeTransaction.amount,
    currencyId: bridgeTransaction.asset === ZeroAddress ? 'eth' : 'erc20',
    needsProving: false,
    originChainId: bridgeTransaction.originChainId,
    stack: relayChainStackMapping[stack],
    txHash: bridgeTransaction.originTxHash,
  })
}
