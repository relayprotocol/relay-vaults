import { createWalletClient, defineChain } from 'viem'
import { createPublicClient, http, type PublicClient } from 'viem'
import { mainnet, redstone, sepolia, optimismSepolia } from 'viem/chains'
import { writeContract } from 'viem/actions'
import { publicActionsL1, publicActionsL2 } from 'viem/op-stack'
import { networks } from '@relay-protocol/networks'
import { l1StandardBridgeAbi } from './abis'
import { privateKeyToAccount } from 'viem/accounts'
import { parseAbi } from 'viem'

// console.log(redstone)
import {
  L1NetworkConfig,
  ChildNetworkConfig,
  NetworkConfig,
} from '@relay-protocol/types'

interface ProveTxParams {
  txHash: `0x${string}`
  chainId: number
  contractAddress: string
}

interface BridgeTokensParams {
  l1TokenAddress: `0x${string}`
  l2TokenAddress: `0x${string}`
  amount: bigint
  gasLimit?: number
}

// // Optimism contract ABIs
// const L2ToL1MessagePasserAbi = parseAbi([
//   'function sentMessages(bytes32) view returns (bool)',
//   'function messageNonce() view returns (uint256)',
// ])

const L1CrossDomainMessengerAbi = parseAbi([
  'function proveMessage(bytes32 _stateRoot, address _target, address _sender, bytes memory _message, uint256 _messageNonce, bytes32[] memory _proof)',
])

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
    chain: sepolia,
    transport: http(),
  }).extend(publicActionsL1())

  const l2Client = createPublicClient({
    chain: optimismSepolia,
    transport: http(),
  }).extend(publicActionsL2())

  const account = privateKeyToAccount(`0x${process.env.DEPLOYER_PRIVATE_KEY}`)
  const l1WalletClient = createWalletClient({
    chain: sepolia,
    transport: http(),
    account,
  })

  // Get the L2 transaction receipt
  const receipt = await l2Client.getTransactionReceipt({
    hash: txHash,
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

  if (status === 'ready-to-prove') {
    // Wait until the withdrawal is ready to prove
    const { output, withdrawal } = await l1Client.waitToProve({
      receipt,
      targetChain: l2Client.chain,
    })

    try {
      // Build parameters to prove the withdrawal
      const proof = await l2Client.buildProveWithdrawal({
        output,
        withdrawal,
      })

      // Prove the withdrawal on L1
      const hash = await writeContract(l1WalletClient, {
        abi: L1CrossDomainMessengerAbi,
        address: contractAddress as `0x${string}`,
        functionName: 'proveMessage',
        args: [
          proof.outputRootProof.stateRoot,
          proof.withdrawal.target,
          proof.withdrawal.sender,
          proof.withdrawal.data,
          proof.withdrawal.nonce,
          proof.withdrawalProof,
        ],
        chain: l1Client.chain,
      })

      // Wait for the prove transaction to be processed
      const proveReceipt = await l1Client.waitForTransactionReceipt({
        hash,
      })

      console.log('Transaction proved successfully!')
      console.log('Prove transaction hash:', proveReceipt.transactionHash)
    } catch (error) {
      console.error('Error proving transaction:', error)
      throw error
    }
  } else {
    console.log('Withdrawal status:', status)
    if (status === 'waiting-to-prove') {
      console.log('Withdrawal is waiting to be proven. Please wait.')
    } else if (status === 'ready-to-finalize') {
      console.log('Withdrawal has already been proven.')
    } else if (status === 'finalized') {
      console.log('Withdrawal has already been finalized.')
    } else {
      console.log('Withdrawal cannot be proved in its current state.')
    }
  }
}

export async function bridgeTokens({
  l1TokenAddress,
  l2TokenAddress,
  amount,
  gasLimit = 200_000,
}: BridgeTokensParams): Promise<`0x${string}`> {
  const account = privateKeyToAccount(`0x${process.env.DEPLOYER_PRIVATE_KEY}`)

  const l1WalletClient = createWalletClient({
    chain: sepolia,
    transport: http(),
    account,
  })

  const l1StandardBridge = '0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1'
  const depositHash = await writeContract(l1WalletClient, {
    abi: l1StandardBridgeAbi,
    address: l1StandardBridge,
    args: [l1TokenAddress, l2TokenAddress, amount, gasLimit, '0x'],
    chain: sepolia,
    functionName: 'depositERC20',
  })

  console.log('Token bridging initiated with hash:', depositHash)
  return depositHash
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
    txHash: txHash as `0x${string}`,
    chainId: parseInt(chainId),
    contractAddress,
  }).catch(console.error)
}
