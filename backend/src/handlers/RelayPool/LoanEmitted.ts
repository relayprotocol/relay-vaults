/*
  Handles the LoanEmitted event for the RelayPool.
  This event is intended only to update the loanEmittedTxHash field in an existing
  bridge_transaction record. It is expected that a prior event (e.g. a bridge initiation)
  created a complete record.

  Additionally, we update the RelayPool record with the fees accumulated.
  The fee is computed as (amount * bridgeFee) / FRACTIONAL_BPS_DENOMINATOR.
  If the corresponding poolOrigin record is found, its bridgeFee is used to calculate the fee.
  If not found, a warning is logged.
*/
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction, relayPool, poolOrigin } from 'ponder:schema'
import { BPS_DIVISOR } from '../../constants.js'
import { logger } from '../../logger.js'
import { chainIdFromDomainId } from '@relay-vaults/helpers'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:LoanEmitted'>
  context: Context<'RelayPool:LoanEmitted'>
}) {
  const { nonce, origin, amount } = event.args
  const { bridge, chainId: domainId } = origin

  const originChainId = chainIdFromDomainId(domainId)
  // Update the corresponding bridgeTransaction record with loanEmittedTxHash
  // We use upsert (insert with onConflictDoUpdate) here because the record may not exist yet if the L2 indexing is slower.
  await context.db
    .insert(bridgeTransaction)
    .values({
      loanEmittedTxHash: event.transaction.hash,
      nativeBridgeStatus: 'HANDLED',
      nonce,
      originBridgeAddress: bridge,
      originChainId,
    })
    .onConflictDoUpdate({
      loanEmittedTxHash: event.transaction.hash,
      nativeBridgeStatus: 'HANDLED',
    })

  // Update the RelayPool's totalBridgeFees field with the fee amount calculated
  // Retrieve the RelayPool record based on the contract address that emitted the event
  const poolRecord = await context.db.find(relayPool, {
    chainId: context.chain.id,
    contractAddress: event.log.address,
  })
  if (!poolRecord) {
    logger.info(
      `Skipping loan emitted for non-curated pool ${event.log.address}`
    )
    return
  }

  // Retrieve the corresponding poolOrigin record to obtain the bridgeFee
  const originRecord = await context.db.find(poolOrigin, {
    chainId: poolRecord.chainId,
    originBridge: bridge,
    originChainId,
    pool: event.log.address,
  })
  if (!originRecord) {
    logger.warn(
      `PoolOrigin record not found for pool ${event.log.address} with originChainId ${originChainId} and originBridge ${bridge}.`
    )
    return
  }

  // Compute fee: fee = (amount * bridgeFeeBps) / BPS_DIVISOR
  const fee = (BigInt(amount) * BigInt(originRecord.bridgeFee)) / BPS_DIVISOR

  // Update totalBridgeFees pool's total bridge fees
  const updatedTotalBridgeFees = BigInt(poolRecord.totalBridgeFees) + fee

  await context.db
    .update(relayPool, {
      chainId: context.chain.id,
      contractAddress: event.log.address,
    })
    .set({ totalBridgeFees: updatedTotalBridgeFees })
}
