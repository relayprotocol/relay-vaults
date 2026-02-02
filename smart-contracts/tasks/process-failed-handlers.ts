import { ABIs } from '@relay-vaults/helpers'
import { RelayPool } from '@relay-vaults/abis'
import { task } from 'hardhat/config'
import { networks } from '@relay-vaults/networks'
import { AbiCoder, Contract } from 'ethers'
import {
  MAINNET_SAFE_ADDRESS,
  submitBatchedScheduleTransactionsViaMultisig,
} from '../lib/multisig'

const ZERO_NETWORK_CHAIN_ID = 543210
const ZERO_NETWORK_BRIDGE_ADDRESS = '0xb17F41bCb06Bf95805932a7881Bb37f1D43e3dAC'

const HYPERLANE_MAILBOX_ADDRESS = '0xd7b351D2dE3495eA259DD10ab4b9300A378Afbf3'
const POOL_ADDRESS = '0x57B68c4EA221ee8Da6eb14ebdfcCEE5177567771'
const POOL_CHAIN_ID = 1 // Ethereum mainnet

// Transaction IDs from Zero network
const TX_IDS = [
  '0xbe0edd9cad76e17c16a92adc3b060072eeb82334d1e576a5fed88f027320b3b2',
  '0x71192acc62d17e614e6120d92d37ae174d7c98d990018431be1c0bbddd35045a',
  '0xe179972961598ca921a1b8a93f84140634a97f0d41772300d4088a76363801df',
  '0x9e90cc842f020a0eae641c799bf476ab9dd58630ed9314bf1d179b046aecdecc',
  '0x38952f6d9097b48b38b44d52eb4d085fc4f28171f1a643d42268d4136bbeac72',
  '0xa632c4600c320d2998a7a65132d2ab0723498d81fc3471526cc966594f35f764',
  '0xa1e55f141c9c3446f91b334a67b7d30c179e1f5479210ca6b2284cb47984c272',
  '0xaf789f9aa4f3328aab2dc0ce4db2144aafed965cd1d4d9085ec7931716074223',
  '0x847d360821203e0e949222d9286b6804d36d14139c4ad61d1f9c2ec37fbad7e9',
  '0x3ed204775f93268a8d1df26abe1e04eaa69b634a9c76be45f87b303ba6e26b1e',
]

interface ProcessFailedHandlerCall {
  chainId: number
  bridge: string
  data: string
  amount: bigint
  dispatchId: string
}

task(
  'process-failed-handlers',
  'Process failed Hyperlane handlers from Zero network transactions'
)
  .addOptionalParam('safe', 'Safe multisig address')
  .setAction(async ({ safe: safeAddress }, { ethers }) => {
    const zeroNetwork = networks[ZERO_NETWORK_CHAIN_ID.toString()]
    if (!zeroNetwork) {
      throw new Error(
        `Network configuration not found for chain ${ZERO_NETWORK_CHAIN_ID}`
      )
    }

    // Connect to Zero network
    const provider = new ethers.JsonRpcProvider(zeroNetwork.rpc[0])

    console.log(
      `Processing ${TX_IDS.length} transactions from Zero network...\n`
    )

    const calls: ProcessFailedHandlerCall[] = []
    let totalAmountSent = 0n

    // Process each transaction
    for (let i = 0; i < TX_IDS.length; i++) {
      const txHash = TX_IDS[i]
      console.log(`[${i + 1}/${TX_IDS.length}] Processing ${txHash}...`)

      try {
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash)
        if (!receipt) {
          console.error('  ❌ Transaction receipt not found')
          continue
        }

        // Get transaction to extract value
        const tx = await provider.getTransaction(txHash)
        if (!tx) {
          console.error('  ❌ Transaction not found')
          continue
        }
        const txValue = tx.value
        totalAmountSent += txValue
        console.log(`  Value: ${ethers.formatEther(txValue)} ETH`)

        // Find DispatchId and Dispatch events from Hyperlane Mailbox
        let dispatchId: string | null = null
        let dispatchMessage: string | null = null

        const mailboxInterface = new ethers.Interface(ABIs.Mailbox)
        for (const log of receipt.logs) {
          if (
            log.address.toLowerCase() !==
            HYPERLANE_MAILBOX_ADDRESS.toLowerCase()
          ) {
            continue
          }

          try {
            const parsed = mailboxInterface.parseLog({
              data: log.data,
              topics: log.topics,
            })

            if (parsed && parsed.name === 'DispatchId') {
              dispatchId = parsed.args.messageId
              console.log(`  DispatchId: ${dispatchId}`)
            } else if (parsed && parsed.name === 'Dispatch') {
              dispatchMessage = parsed.args.message
            }
          } catch (e) {
            // Not a Mailbox event
          }
        }

        if (!dispatchId) {
          console.error('  ❌ DispatchId event not found')
          continue
        }

        if (!dispatchMessage) {
          console.error('  ❌ Dispatch event not found')
          continue
        }

        // Decode HyperlaneMessage from dispatchMessage
        // From RelayBridge: abi.encode(nonce, recipient, amount, block.timestamp)
        const abiCoder = new AbiCoder()

        // Extract the last 128 bytes which contain the ABI-encoded HyperlaneMessage
        // 4 * 32 bytes for (uint256, address, uint256, uint256)
        const expectedBodyLength = 128
        let message: ReturnType<typeof abiCoder.decode>

        const hexLength = expectedBodyLength * 2 // 2 hex chars per byte
        const messageBody = '0x' + dispatchMessage.slice(-hexLength)

        try {
          message = abiCoder.decode(
            ['uint256', 'address', 'uint256', 'uint256'],
            messageBody
          )
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          console.error(`  ❌ Failed to decode message body: ${errorMessage}`)
          console.error(`  Message body: ${messageBody}`)
          continue
        }

        // Decode and validate the message
        const msg = message as unknown as [bigint, string, bigint, bigint]
        console.log('  Decoded HyperlaneMessage:')
        console.log(`    Nonce: ${msg[0]}`)
        console.log(`    Recipient: ${msg[1]}`)
        console.log(`    Amount: ${ethers.formatEther(msg[2])} ETH`)
        console.log(
          `    Timestamp: ${new Date(Number(msg[3]) * 1000).toISOString()}`
        )

        // Use the extracted messageBody for processFailedHandler
        // This is the ABI-encoded HyperlaneMessage struct that processFailedHandler expects
        calls.push({
          amount: msg[2],
          bridge: ZERO_NETWORK_BRIDGE_ADDRESS,
          chainId: ZERO_NETWORK_CHAIN_ID,
          data: messageBody, // ABI-encoded (uint256, address, uint256, uint256)
          dispatchId,
        })

        console.log('  ✅ Processed successfully\n')
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        console.error(`  ❌ Error processing transaction: ${errorMessage}\n`)
      }
    }
    const totalAmount = calls.reduce((acc, { amount }) => acc + amount, 0n)
    console.log('\n=== Summary ===')
    console.log(
      `Total transactions processed: ${calls.length}/${TX_IDS.length}`
    )
    console.log(
      `Total amount sent from Zero: ${ethers.formatEther(totalAmountSent)} ETH`
    )
    console.log(`\nPrepared ${calls.length} processFailedHandler calls`)
    console.log(
      `Total amount prepared for processFailedHandler: ${ethers.formatEther(totalAmount)} ETH`
    )
    if (calls.length === 0) {
      console.error('No valid calls to process. Exiting.')
      return
    }

    const poolNetwork = networks[POOL_CHAIN_ID.toString()]
    console.log(`Pool address: ${POOL_ADDRESS}`)

    // Get timelock address from pool owner
    console.log('\n=== Getting timelock address ===')
    const mainnetProvider = new ethers.JsonRpcProvider(poolNetwork.rpc[0])
    const mainnetSignerForRead = new ethers.Wallet(
      ethers.Wallet.createRandom().privateKey,
      mainnetProvider
    )
    const pool = new Contract(POOL_ADDRESS, RelayPool, mainnetSignerForRead)
    const timelockAddress = await pool.owner()
    console.log(`Timelock address: ${timelockAddress}`)

    // Prepare processFailedHandler payloads
    console.log(
      `\n=== Preparing processFailedHandler calls for pool ${POOL_ADDRESS} ===`
    )

    const relayPoolInterface = new ethers.Interface(RelayPool)
    const transactionsToSubmit = calls.map((call, index) => {
      // Encode processFailedHandler call
      const payload = relayPoolInterface.encodeFunctionData(
        'processFailedHandler',
        [call.chainId, call.bridge, call.data]
      )

      // Generate unique salt for timelock calls
      const salt = ethers.id(
        `processFailedHandler_${call.dispatchId}_${index}_${Date.now()}`
      )

      return {
        payload,
        salt,
        target: POOL_ADDRESS,
        value: 0n,
      }
    })

    console.log(
      `Prepared ${transactionsToSubmit.length} processFailedHandler calls for batched submission`
    )

    // Submit all transactions as a batched multicall through Safe
    console.log('\n=== Submitting batched transactions through timelock ===')

    // Get Safe address
    const safe = MAINNET_SAFE_ADDRESS
    console.log(`Using Safe: ${safe}`)

    // Submit all schedule transactions as a single multicall
    await submitBatchedScheduleTransactionsViaMultisig(
      mainnetProvider,
      timelockAddress,
      safe,
      transactionsToSubmit
    )
    console.log('\n✅ All transactions submitted as batched multicall!')
  })
