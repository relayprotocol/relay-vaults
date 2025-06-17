/**
 * Handler: OutstandingDebtChanged
 *
 * This handler listens for the `OutstandingDebtChanged` event emitted by the RelayPool contract.
 * On receiving the event, it updates the corresponding relay pool record in the database with the new outstanding debt.
 * Additionally, it updates the per-origin outstanding debt values by:
 * 1. Fetching all poolOrigin records associated with this pool
 * 2. For each origin, querying the on-chain authorizedOrigins mapping
 * 3. Updating the poolOrigin record with the current outstanding debt for that origin
 *
 * The event parameters include:
 *   - newDebt: The updated outstanding debt value.
 *
 * The pool is identified using the contract address found in the event log.
 *
 * This ensures that the backend state remains synchronized with the on-chain debt updates,
 * both at the pool level and for individual origins.
 */

import { Context, Event } from 'ponder:registry'
import { relayPool, poolOrigin } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:OutstandingDebtChanged'>
  context: Context<'RelayPool:OutstandingDebtChanged'>
}) {
  // Extract the new debt value from the event arguments.
  const { newDebt, origin, newOriginDebt } = event.args

  // Retrieve the pool using the contract address from the event log.
  const poolAddress = event.log.address

  // Update the relay pool record with the new outstanding debt.
  await context.db
    .update(relayPool, {
      chainId: context.chain.id,
      contractAddress: poolAddress,
    })
    .set({
      outstandingDebt: newDebt,
    })

  await context.db
    .update(poolOrigin, {
      chainId: context.chain.id,
      originBridge: origin.bridge,
      originChainId: origin.chainId,
      pool: poolAddress,
    })
    .set({
      currentOutstandingDebt: newOriginDebt,
    })
}
