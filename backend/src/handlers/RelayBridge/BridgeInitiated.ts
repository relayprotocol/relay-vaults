import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { ABIs } from '@relay-vaults/helpers'
import { BridgeProxy } from '@relay-vaults/abis'
import networks from '@relay-vaults/networks'
import { decodeEventLog } from 'viem'
import { OriginNetworkConfig } from '@relay-vaults/types'
import { SEVEN_DAYS } from '../../constants'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayBridge:BridgeInitiated'>
  context: Context<'RelayBridge:BridgeInitiated'>
}) {
  const networkConfig = networks[context.chain.id] as OriginNetworkConfig
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
      const decodedEvent = decodeEventLog({
        abi: ABIs.Mailbox,
        data: log.data,
        topics: log.topics,
      })

      if (decodedEvent.eventName === 'DispatchId') {
        hyperlaneMessageId = decodedEvent.args.messageId
      }
    } else if (
      // OP event
      networkConfig.bridges.optimism?.child.messagePasser &&
      log.address.toLowerCase() ===
        networkConfig.bridges.optimism?.child.messagePasser.toLowerCase()
    ) {
      const decodedEvent = decodeEventLog({
        abi: ABIs.L2ToL1MessagePasser,
        data: log.data,
        topics: log.topics,
      })

      if (decodedEvent.eventName === 'MessagePassed') {
        opWithdrawalHash = decodedEvent.args.withdrawalHash
      }
    } else if (
      // ARB event
      networkConfig.bridges.arbitrum?.child.arbSys &&
      log.address.toLowerCase() ===
        networkConfig.bridges.arbitrum?.child.arbSys.toLowerCase()
    ) {
      const decodedEvent = decodeEventLog({
        abi: ABIs.IArbSys,
        data: log.data,
        topics: log.topics,
      })
      if (decodedEvent.eventName === 'L2ToL1Tx') {
        arbTransactionIndex = decodedEvent.args.position
      }
    } else if (
      // Zksync event
      networkConfig.bridges.zksync?.child.l1Messenger &&
      log.address.toLowerCase() ===
        networkConfig.bridges.zksync?.child.l1Messenger.toLowerCase()
    ) {
      const eventLog = decodeEventLog({
        abi: ABIs.L1Messenger,
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

  // Use the delay from the network config or default to 7 days
  const delay = BigInt(networkConfig.withdrawalDelay || SEVEN_DAYS)

  // Record bridge initiation
  // We use upsert (insert with onConflictDoUpdate) here because the record may already exist if the L1 indexing was faster than L2.
  const values = {
    amount,
    arbTransactionIndex,
    asset: ASSET,
    destinationPoolAddress: pool,
    destinationPoolChainId: poolChainId,
    destinationRecipient: recipient,
    expectedFinalizationTimestamp: event.block.timestamp + delay,
    hyperlaneMessageId,
    nativeBridgeStatus: 'INITIATED',
    opWithdrawalHash,
    originSender: sender,
    originTimestamp: event.block.timestamp,
    originTxHash: event.transaction.hash,
    zksyncWithdrawalHash,
  }

  await context.db
    .insert(bridgeTransaction)
    .values({
      nonce,
      originBridgeAddress: event.log.address,
      originChainId: context.chain.id,
      ...values,
    })
    .onConflictDoUpdate(values)
}
