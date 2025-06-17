/*
  Handles the LoanEmitted event for the RelayPool.
  This event is intended only to update the loanEmittedTxHash field in an existing
  bridge_transaction record. It is expected that a prior event (e.g. a bridge initiation)
  created a complete record.

  Additionally, we update the RelayPool record with the fees accumulated.
  The fee is computed as (amount * bridgeFee) / 10000.
  If the corresponding poolOrigin record is found, its bridgeFee is used to calculate the fee.
  If not found, a warning is logged.
*/
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction, relayPool, poolOrigin } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:LoanEmitted'>
  context: Context<'RelayPool:LoanEmitted'>
}) {
  const { nonce, origin, amount } = event.args
  const { bridge, chainId: bridgeChainId } = origin

  // Update the corresponding bridgeTransaction record with loanEmittedTxHash
  // We use upsert (insert with onConflictDoUpdate) here because the record may not exist yet if the L2 indexing is slower.
  await context.db
    .insert(bridgeTransaction)
    .values({
      loanEmittedTxHash: event.transaction.hash,
      nativeBridgeStatus: 'INITIATED',
      nonce,
      originBridgeAddress: bridge,
      originChainId: bridgeChainId,
    })
    .onConflictDoUpdate({ loanEmittedTxHash: event.transaction.hash })

  // Update the RelayPool's totalBridgeFees field with the fee amount calculated
  // Retrieve the RelayPool record based on the contract address that emitted the event
  const poolRecord = await context.db.find(relayPool, {
    chainId: context.chain.id,
    contractAddress: event.log.address,
  })
  if (!poolRecord) {
    console.warn(`RelayPool record not found for address ${event.log.address}.`)
    return
  }

  // Retrieve the corresponding poolOrigin record to obtain the bridgeFee
  const originRecord = await context.db.find(poolOrigin, {
    chainId: poolRecord.chainId,
    originBridge: bridge,
    originChainId: bridgeChainId,
    pool: event.log.address,
  })
  if (!originRecord) {
    console.warn(
      `PoolOrigin record not found for pool ${event.log.address} with originChainId ${bridgeChainId} and originBridge ${bridge}.`
    )
    return
  }

  // Compute fee amount: fee = (amount * bridgeFee) / 10000
  const fee = (BigInt(amount) * BigInt(originRecord.bridgeFee)) / 10000n

  // Update totalBridgeFees pool's total bridge fees
  const updatedTotalBridgeFees = BigInt(poolRecord.totalBridgeFees) + fee

  await context.db
    .update(relayPool, {
      chainId: context.chain.id,
      contractAddress: event.log.address,
    })
    .set({ totalBridgeFees: updatedTotalBridgeFees.toString() })
}
