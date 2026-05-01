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
import { computeNativeBridgeStatus } from '../../utils/nativeBridgeStatus.js'

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
  const loanEmittedTxHash = event.transaction.hash

  // The record may not exist yet if L2 indexing is slower than L1, hence the upsert.
  // Status is derived from the union of existing on-chain evidence and the new loan hash,
  // so a late-arriving Hyperlane handle can never regress a row that was already PROVEN/FINALIZED.
  const existing = await context.db.find(bridgeTransaction, {
    nonce,
    originBridgeAddress: bridge,
    originChainId,
  })
  const nativeBridgeStatus = computeNativeBridgeStatus({
    finalizationTimestamp: existing?.finalizationTimestamp,
    loanEmittedTxHash,
    nativeBridgeFinalizedTxHash: existing?.nativeBridgeFinalizedTxHash,
    opProofTxHash: existing?.opProofTxHash,
  })

  await context.db
    .insert(bridgeTransaction)
    .values({
      createdAt: new Date(),
      loanEmittedTxHash,
      nativeBridgeStatus,
      nonce,
      originBridgeAddress: bridge,
      originChainId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      loanEmittedTxHash,
      nativeBridgeStatus,
      updatedAt: new Date(),
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
    .set({
      totalBridgeFees: updatedTotalBridgeFees,
      updatedAt: new Date(),
    })
}
