import { ABIs } from '@relay-protocol/helpers'
import { eq, and } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { decodeFunctionData, keccak256 } from 'viem'

export default async function ({
  event,
  context,
}: {
  event: Event<'L1NativeTokenVault:BridgeMint'>
  context: Context<'L1NativeTokenVault:BridgeMint'>
}) {
  // we need to compute the key used by Messenger on L2
  // by fetching the 'message' param used when calling finalizeWithdrawal function
  const receipt = await context.client.getTransactionReceipt({
    hash: event.transaction.hash,
  })

  console.log(event)

  // decode finalizeWithdrawal function data
  const { functionName, args } = decodeFunctionData({
    abi: ABIs.L1NativeTokenVault,
    data: receipt.data,
  })

  // // get _message param and compute the key
  // const expectedKey = keccak256(args![4])

  // await context.db.sql
  //   .update(bridgeTransaction)
  //   .set({
  //     nativeBridgeFinalizedTxHash: event.transaction.hash,
  //     nativeBridgeStatus: 'FINALIZED',
  //   })
  //   .where(
  //     and(
  //       eq(bridgeTransaction.zksyncWithdrawalHash, expectedKey),
  //       eq(bridgeTransaction.nativeBridgeStatus, 'INITIATED')
  //     )
  //   )
}
