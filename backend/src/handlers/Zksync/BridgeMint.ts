import networks from '@relay-protocol/networks'
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
  const originNetwork = networks[event.args.chainId]
  if (originNetwork?.bridges?.zksync?.parent.nativeTokenVault) {
    // Get the transaction
    const tx = await context.client.getTransaction({
      hash: event.transaction.hash,
    })

    // If it was sent to the sharedDefaultBridge
    if (
      tx.to.toLowerCase() ==
      originNetwork?.bridges?.zksync?.parent.sharedDefaultBridge.toLowerCase()
    ) {
      // decode finalizeWithdrawal function data
      const { functionName, args } = decodeFunctionData({
        abi: [
          {
            inputs: [
              { internalType: 'uint256', name: '_chainId', type: 'uint256' },
              {
                internalType: 'uint256',
                name: '_l2BatchNumber',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_l2MessageIndex',
                type: 'uint256',
              },
              {
                internalType: 'uint16',
                name: '_l2TxNumberInBatch',
                type: 'uint16',
              },
              { internalType: 'bytes', name: '_message', type: 'bytes' },
              {
                internalType: 'bytes32[]',
                name: '_merkleProof',
                type: 'bytes32[]',
              },
            ],
            name: 'finalizeWithdrawal',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        data: tx.input,
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
