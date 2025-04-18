import networks from '@relay-protocol/networks'
import { eq, and } from 'ponder'
import { ABIs } from '@relay-protocol/helpers'
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
  const originNetwork = networks[event.args.chainId]
  if (originNetwork?.bridges?.zksync?.parent.sharedDefaultBridge) {
    // If it was sent to the sharedDefaultBridge
    if (
      event.transaction.to.toLowerCase() ==
      originNetwork?.bridges?.zksync?.parent.sharedDefaultBridge.toLowerCase()
    ) {
      // decode finalizeWithdrawal function data
      const { functionName, args } = decodeFunctionData({
        abi: ABIs.L1Nullifier,
        data: event.transaction.input,
      })
      if (functionName == 'finalizeWithdrawal') {
        // get _message param and compute the key
        const expectedKey = keccak256(args![4])
        await context.db.sql
          .update(bridgeTransaction)
          .set({
            nativeBridgeFinalizedTxHash: event.transaction.hash,
            nativeBridgeStatus: 'FINALIZED',
          })
          .where(and(eq(bridgeTransaction.zksyncWithdrawalHash, expectedKey)))
      }
    }
  }
}
