import networks from '@relay-vaults/networks'
import { eq, and } from 'ponder'
import { ABIs } from '@relay-vaults/helpers'
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
            finalizationTimestamp: event.block.timestamp,
            nativeBridgeFinalizedTxHash: event.transaction.hash,
            nativeBridgeStatus: 'FINALIZED',
            updatedAt: new Date(),
          })
          .where(and(eq(bridgeTransaction.zksyncWithdrawalHash, expectedKey)))
      }
    }
  }
}
