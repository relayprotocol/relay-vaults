import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { ABIs } from '@relay-protocol/helpers'
import { BridgeProxy } from '@relay-protocol/abis'
import networks from '@relay-protocol/networks'
import { decodeEventLog } from 'viem'
import { ChildNetworkConfig } from '@relay-protocol/types'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayBridge:BridgeInitiated'>
  context: Context<'RelayBridge:BridgeInitiated'>
}) {
  const networkConfig = networks[context.network.chainId] as ChildNetworkConfig
  const { nonce, sender, recipient, ASSET, amount, BRIDGE_PROXY } = event.args

  // Parse logs to find the DispatchId event and extract hyperlaneMessageId
  let hyperlaneMessageId
  let opWithdrawalHash
  let arbTransactionIndex
  let zksyncWithdrawalHash
  const receipt = await context.client.getTransactionReceipt({
    hash: event.transaction.hash,
  })
  for (const log of receipt.logs) {
    if (
      // Hyperlane event
      log.address.toLowerCase() === networkConfig.hyperlaneMailbox.toLowerCase()
    ) {
      const event = decodeEventLog({
        abi: ABIs.Mailbox,
        data: log.data,
        topics: log.topics,
      })

      if (event.eventName === 'DispatchId') {
        hyperlaneMessageId = event.args.messageId
      }
    } else if (
      // OP event
      networkConfig.bridges.optimism?.child.messagePasser &&
      log.address.toLowerCase() ===
        networkConfig.bridges.optimism?.child.messagePasser.toLowerCase()
    ) {
      const event = decodeEventLog({
        abi: ABIs.L2ToL1MessagePasser,
        data: log.data,
        topics: log.topics,
      })

      if (event.eventName === 'MessagePassed') {
        opWithdrawalHash = event.args.withdrawalHash
      }
    } else if (
      // ARB event
      networkConfig.bridges.arbitrum?.child.arbSys &&
      log.address.toLowerCase() ===
        networkConfig.bridges.arbitrum?.child.arbSys.toLowerCase()
    ) {
      const event = decodeEventLog({
        abi: ABIs.IArbSys,
        data: log.data,
        topics: log.topics,
      })

      if (event.eventName === 'L2ToL1Tx') {
        arbTransactionIndex = event.args.position
      }
    } else if (
      // Zksync event
      networkConfig.bridges.zksync?.child.sharedDefaultBridge &&
      log.address.toLowerCase() ===
        networkConfig.bridges.zksync?.child.sharedDefaultBridge.toLowerCase()
    ) {
      const eventLog = decodeEventLog({
        abi: ABIs.IL1SharedBridge,
        data: log.data,
        topics: log.topics,
      })
      if (eventLog.eventName === 'L1MessageSent') {
        zksyncWithdrawalHash = eventLog.args._hash
      }
    }
  }

  // Find the destination pool address and chain ID using BRIDGE_PROXY
  const [pool, poolChainId] = await Promise.all([
    context.client.readContract({
      abi: BridgeProxy,
      address: BRIDGE_PROXY,
      functionName: 'RELAY_POOL',
    }),
    context.client.readContract({
      abi: BridgeProxy,
      address: BRIDGE_PROXY,
      functionName: 'RELAY_POOL_CHAIN_ID',
    }),
  ])

  // Record bridge initiation
  await context.db.insert(bridgeTransaction).values({
    amount,
    // ARB Specifics
    arbTransactionIndex,

    // Asset details
    asset: ASSET,
    destinationPoolAddress: pool,
    destinationPoolChainId: poolChainId,

    destinationRecipient: recipient,

    // Hyperlane
    hyperlaneMessageId,
    // Instant loan tracking
    loanEmittedTxHash: null as any,

    nativeBridgeFinalizedTxHash: null as any,
    // Bridge status
    nativeBridgeStatus: 'INITIATED',

    nonce,

    opProofTxHash: null as any,

    // OP Specifics
    opWithdrawalHash,

    // Bridge identification
    originBridgeAddress: event.log.address,

    // Chain information
    originChainId: context.network.chainId,
    // Transaction participants
    originSender: sender,

    // Origin transaction details
    originTimestamp: event.block.timestamp,

    originTxHash: event.transaction.hash,

    // ZKsync specifics
    zksyncWithdrawalHash,
  })
}
