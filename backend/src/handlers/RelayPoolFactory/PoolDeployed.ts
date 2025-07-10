import { RelayPool, TimelockControllerUpgradeable } from '@relay-vaults/abis'
import { Context, Event } from 'ponder:registry'
import { relayPool, yieldPool } from 'ponder:schema'
import { erc20Abi, hexToBigInt } from 'viem'
import networks from '@relay-vaults/networks'
import { logger } from '../../logger.js'

export default async function ({
  event,
  context,
}: {
  // @ts-expect-error - Ponder event types are not properly exported
  event: Event<'RelayPoolFactory:PoolDeployed'>
  // @ts-expect-error - Ponder context types are not properly exported
  context: Context<'RelayPoolFactory:PoolDeployed'>
}) {
  // @ts-expect-error - event.args is not properly typed
  const { pool, asset, thirdPartyPool, timelock } = event.args

  // Fetch the name of the third-party yield pool,
  // and the name and symbol of the relay pool.
  const [yieldName, poolName, poolSymbol, owner, decimals] = await Promise.all([
    context.client.readContract({
      abi: erc20Abi,
      address: thirdPartyPool,
      functionName: 'name',
    }),
    context.client.readContract({
      abi: erc20Abi,
      address: pool,
      functionName: 'name',
    }),
    context.client.readContract({
      abi: erc20Abi,
      address: pool,
      functionName: 'symbol',
    }),
    context.client.readContract({
      abi: RelayPool,
      address: pool,
      args: [],
      functionName: 'owner',
    }),
    context.client.readContract({
      abi: RelayPool,
      address: pool,
      args: [],
      functionName: 'decimals',
    }),
  ])

  // Only index pools curated by our multisig or its timelock
  // @ts-expect-error - context.chain.id is not properly typed in Ponder
  const network = networks[context.chain.id]
  const multisig = network?.curator?.toLowerCase()

  if (!multisig) {
    logger.info('No curator configured. Skipping pool.')
    return
  }

  // check PROPOSER_ROLE
  const proposerRole = (await context.client.readContract({
    abi: TimelockControllerUpgradeable,
    address: timelock as `0x${string}`,
    functionName: 'PROPOSER_ROLE',
  })) as `0x${string}`

  const blockNumber = hexToBigInt(
    await context.client.request({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
    })!
  )

  const isCurated = (await context.client.readContract({
    abi: TimelockControllerUpgradeable,
    address: timelock as `0x${string}`,
    args: [proposerRole, multisig],
    blockNumber, // Use the current state to see if we need to index this pool.
    functionName: 'hasRole',
  })) as boolean

  // Skip indexing if we are not the curator of this pool
  if (!isCurated) {
    logger.info(`Pool ${pool} is not curated. Skipping.`, {
      blockNumber,
      multisig,
      proposerRole,
      timelock,
    })
    return
  }

  // Upsert yield pool using only its name.
  await context.db
    .insert(yieldPool)
    .values({
      asset: asset as `0x${string}`,
      // @ts-expect-error - context.chain.id is not properly typed in Ponder
      chainId: context.chain.id,
      contractAddress: thirdPartyPool as `0x${string}`,
      lastUpdated: BigInt(event.block.timestamp),
      name: yieldName,
    })
    .onConflictDoUpdate({
      lastUpdated: BigInt(event.block.timestamp),
      name: yieldName,
    })

  // Create relay pool with its own name and symbol fetched from the relay pool contract.
  await context.db
    .insert(relayPool)
    .values({
      asset: asset as `0x${string}`,
      // @ts-expect-error - context.chain.id is not properly typed in Ponder
      chainId: context.chain.id,
      contractAddress: pool as `0x${string}`,
      createdAt: event.block.timestamp,
      createdAtBlock: event.block.number,
      curator: owner as `0x${string}`,
      decimals: decimals as number,
      name: poolName,
      outstandingDebt: BigInt(0),
      symbol: poolSymbol,
      totalAssets: BigInt(0),
      totalBridgeFees: BigInt(0),
      totalShares: BigInt(0),
      updatedAt: event.block.timestamp,
      yieldPool: thirdPartyPool as `0x${string}`,
    })
    .onConflictDoNothing()
}
