/**
 * Vault Snapshot Handler
 *
 * This interval handler captures periodic snapshots of both the vault's share price and the
 * associated base yield pool's share price. For each vault (relay pool), it:
 * 1. Retrieves the vault's share price by reading the decimals and computing the share unit
 *    from the vault's contract.
 * 2. Retrieves the yield pool's share price via its contract address stored in the vault record.
 * 3. Creates a unique snapshot ID by combining the vault address, chain ID, and block number.
 * 4. Stores the snapshot with block metadata in the vaultSnapshot table.
 */

import { eq } from 'ponder'
import { ponder } from 'ponder:registry'
import { vaultSnapshot, relayPool, yieldPool } from 'ponder:schema'
import { erc4626Abi, erc20Abi } from 'viem'

ponder.on('VaultSnapshot:block', async ({ event, context }) => {
  // Helper function to calculate APY from price data
  function calculateAPY(
    currentPrice: number,
    startingPrice: number,
    currentTimestamp: number,
    startingTimestamp: number
  ): string | null {
    if (startingPrice <= 0 || currentPrice === startingPrice) return null

    const deltaTime = currentTimestamp - startingTimestamp
    if (deltaTime <= 0) return null

    const secondsPerYear = 365 * 24 * 3600
    const growthFactor = currentPrice / startingPrice
    const apyValue = Math.pow(growthFactor, secondsPerYear / deltaTime) - 1
    const apyPercentage = apyValue * 100

    return apyPercentage.toFixed(2)
  }

  // Helper function to extract snapshot data
  function extractSnapshotData(snapshot: any, priceField: string) {
    return {
      price: Number(snapshot[priceField]),
      timestamp: Number(snapshot.timestamp),
    }
  }

  // Helper function to fetch share price using a contract's address
  async function fetchSharePrice(contractAddress: string) {
    // Retrieve the contract's decimals
    const decimals = await context.client.readContract({
      abi: erc20Abi,
      address: contractAddress,
      functionName: 'decimals',
    })

    // Calculate the share unit using the contract's decimals
    const shareUnit = BigInt(10) ** BigInt(decimals)

    // Query the current share price from convertToAssets with the calculated share unit
    const sharePrice = await context.client.readContract({
      abi: erc4626Abi,
      address: contractAddress,
      args: [shareUnit],
      functionName: 'convertToAssets',
    })

    return sharePrice
  }

  // Retrieve all vaults from the relayPool table
  const vaults = await context.db.sql
    .select()
    .from(relayPool)
    .where(eq(relayPool.chainId, context.network.chainId))
    .execute()

  // Skip operation if no vaults exist yet
  if (vaults.length === 0) {
    return
  }

  for (const vault of vaults) {
    // Skip if the vault has no yield pool
    if (!vault.yieldPool) {
      console.warn(
        `Vault ${vault.contractAddress} has no valid yield pool, skipping...`
      )
      continue
    }

    // Fetch vault and yield pool share prices concurrently (they are independent)
    const [vaultSharePrice, yieldPoolSharePrice] = await Promise.all([
      fetchSharePrice(vault.contractAddress), // vault's own share price
      fetchSharePrice(vault.yieldPool), // yield pool's share price
    ])

    // Create a unique snapshot ID by combining chainId, vault address (in lowercase), and block number
    const id = `${vault.chainId}-${vault.contractAddress.toLowerCase()}-${event.block.number}`

    const snapshot = {
      sharePrice: vaultSharePrice.toString(),
      timestamp: event.block.timestamp,
      yieldPool: vault.yieldPool,
      yieldPoolSharePrice: yieldPoolSharePrice.toString(),
    }

    await context.db
      .insert(vaultSnapshot)
      .values({
        ...snapshot,
        blockNumber: event.block.number,
        chainId: vault.chainId,
        id,
        vault: vault.contractAddress,
      })
      .onConflictDoUpdate(snapshot)

    // vault apy computation
    try {
      // Fetch the earliest snapshot for this vault **and yield pool** as reference.
      const historicalSnapshots = await context.db.sql
        .select()
        .from(vaultSnapshot)
        .where(eq(vaultSnapshot.vault, vault.contractAddress))
        .where(eq(vaultSnapshot.chainId, vault.chainId))
        .where(eq(vaultSnapshot.yieldPool, vault.yieldPool))
        .execute()

      if (historicalSnapshots.length > 0) {
        const vaultData = extractSnapshotData(
          historicalSnapshots[0],
          'sharePrice'
        )
        const vaultAPY = calculateAPY(
          Number(vaultSharePrice),
          vaultData.price,
          Number(event.block.timestamp),
          vaultData.timestamp
        )

        if (vaultAPY) {
          // Update the relayPool table with the newly calculated apy
          await context.db
            .update(relayPool, {
              chainId: vault.chainId,
              contractAddress: vault.contractAddress,
            })
            .set({
              apy: vaultAPY,
            })
        }
      }
    } catch (e) {
      console.error(
        `Failed to compute APY for vault ${vault.contractAddress} on chain ${vault.chainId}:`,
        e
      )
    }

    // base yield apy computation
    try {
      // Fetch earliest snapshot for this yield pool (chainId + yieldPool match)
      const historicalYieldSnapshots = await context.db.sql
        .select()
        .from(vaultSnapshot)
        .where(eq(vaultSnapshot.yieldPool, vault.yieldPool))
        .where(eq(vaultSnapshot.chainId, vault.chainId))
        .execute()

      if (historicalYieldSnapshots.length > 0) {
        const yieldData = extractSnapshotData(
          historicalYieldSnapshots[0],
          'yieldPoolSharePrice'
        )
        const baseYieldAPY = calculateAPY(
          Number(yieldPoolSharePrice),
          yieldData.price,
          Number(event.block.timestamp),
          yieldData.timestamp
        )

        if (baseYieldAPY) {
          // Upsert the yieldPool table with the newly calculated apy
          await context.db
            .insert(yieldPool)
            .values({
              apy: baseYieldAPY,
              asset: vault.asset, // required field
              chainId: vault.chainId,
              contractAddress: vault.yieldPool,
              lastUpdated: event.block.timestamp,
              name: 'Unknown', // placeholder - will be updated by event handlers
            })
            .onConflictDoUpdate({
              apy: baseYieldAPY,
              lastUpdated: event.block.timestamp,
            })
        }
      }
    } catch (e) {
      console.error(
        `Failed to compute base yield APY for yield pool ${vault.yieldPool} on chain ${vault.chainId}:`,
        e
      )
    }
  }
})
