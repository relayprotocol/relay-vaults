import { defineChain } from 'viem'
import { createPublicClient, http, type PublicClient } from 'viem'
import { mainnet, redstone } from 'viem/chains'
import { publicActionsL1, publicActionsL2 } from 'viem/op-stack'
import { networks } from '@relay-protocol/networks'
import { chainConfig } from 'viem/op-stack'

console.log(redstone)
import {
  L1NetworkConfig,
  ChildNetworkConfig,
  NetworkConfig,
} from '@relay-protocol/types'

interface ProveTxParams {
  txHash: string
  chainId: number
  contractAddress: string
}

// // Optimism contract ABIs
// const L2ToL1MessagePasserAbi = parseAbi([
//   'function sentMessages(bytes32) view returns (bool)',
//   'function messageNonce() view returns (uint256)',
// ])

// const L1CrossDomainMessengerAbi = parseAbi([
//   'function proveMessage(bytes32 _stateRoot, address _target, address _sender, bytes memory _message, uint256 _messageNonce, bytes32[] memory _proof)',
// ])

// only mainnet
const L1_CHAIN_ID = 1

export async function proveTransaction({
  txHash,
  chainId,
  contractAddress,
}: ProveTxParams): Promise<void> {
  // Get networks config
  const l1Network = networks[L1_CHAIN_ID]
  const network = networks[chainId] as ChildNetworkConfig

  console.log(`${l1Network.name} > ${network.name}`)
  const l1Client = createPublicClient({
    chain: mainnet,
    transport: http(),
  }).extend(publicActionsL1())

  const l2Client = createPublicClient({
    chain: redstone,
    transport: http(),
  }).extend(publicActionsL2())

  // Get the L2 transaction receipt
  const receipt = await l2Client.getTransactionReceipt({
    hash: txHash as `0x${string}`,
  })
  if (!receipt) {
    throw new Error('Transaction not found')
  }

  // Check if withdrawal is ready to be proven
  const status = await l1Client.getWithdrawalStatus({
    receipt,
    targetChain: l2Client.chain,
  })
  console.log(status)

  // check remaining time
  const { seconds, timestamp } = await l1Client.getTimeToProve({
    receipt,
    targetChain: l2Client.chain,
  })

  console.log(seconds, timestamp, `${new Date(seconds)}`)

  //   if (status === 'ready-to-prove') {
  //     // Wait until the withdrawal is ready to prove
  //     const { output, withdrawal } = await l1Client.waitToProve({
  //       receipt,
  //       targetChain: l2Client.chain,
  //     })
  // try {

  //     // Build parameters to prove the withdrawal
  //     const args = await l2Client.buildProveWithdrawal({
  //       output,
  //       withdrawal,
  //     })

  //     // Prove the withdrawal on L1
  //     const hash = await l1Client.proveWithdrawal(args)

  //     // Wait for the prove transaction to be processed
  //     const proveReceipt = await l1Client.waitForTransactionReceipt({
  //       hash,
  //     })

  //     console.log('Transaction proved successfully!')
  //     console.log('Prove transaction hash:', proveReceipt.transactionHash)
  //   } else {
  //     console.log('Withdrawal status:', status)
  //     if (status === 'waiting-to-prove') {
  //       console.log('Withdrawal is waiting to be proven. Please wait.')
  //     } else if (status === 'ready-to-finalize') {
  //       console.log('Withdrawal has already been proven.')
  //     } else if (status === 'finalized') {
  //       console.log('Withdrawal has already been finalized.')
  //     } else {
  //       console.log('Withdrawal cannot be proved in its current state.')
  //     }
  //   }
  // } catch (error) {
  //   console.error('Error proving transaction:', error)
  //   throw error
  // }
}

// Example usage
if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.length !== 3) {
    console.error('Usage: node index.js <txHash> <chainId> <contractAddress>')
    process.exit(1)
  }

  const [txHash, chainId, contractAddress] = args

  proveTransaction({
    txHash,
    chainId: parseInt(chainId),
    contractAddress,
  }).catch(console.error)
}
