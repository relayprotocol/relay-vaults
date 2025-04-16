import { ABIs } from '@relay-protocol/helpers'
import { eq, and } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { decodeFunctionData, keccak256 } from 'viem'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayBridge:BridgeMint'>
  context: Context<'RelayBridge:BridgeMint'>
}) {
  // we need to compute the key used by Messenger on L2
  // by fetching the 'message' param used when calling finalizeWithdrawal function
  const receipt = await context.client.getTransactionReceipt({
    hash: event.transaction.hash,
  })

  // decode finalizeWithdrawal function data
  const { functionName, args } = decodeFunctionData({
    abi: ABIs.IL1SharedBridge,
    data: receipt.data,
  })

  if (functionName != 'finalizeWithdrawal') {
    // TODO: raise an error for wrong function call
  }

  // get _message param and compute the key
  const expectedKey = keccak256(args![4])

  await context.db.sql
    .update(bridgeTransaction)
    .set({
      nativeBridgeFinalizedTxHash: event.transaction.hash,
      nativeBridgeStatus: 'FINALIZED',
    })
    .where(
      and(
        eq(bridgeTransaction.zksyncWithdrawalHash, expectedKey),
        eq(bridgeTransaction.nativeBridgeStatus, 'INITIATED')
      )
    )
}
