import { TimelockControllerUpgradeable } from '@relay-vaults/abis'
import { and, eq } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { timelock } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPoolTimelock:RoleRevoked'>
  context: Context<'RelayPoolTimelock:RoleRevoked'>
}) {
  // Make sure the timelock already exists in the database (create it if not!)
  await context.db
    .insert(timelock)
    .values({
      chainId: context.chain.id,
      contractAddress: event.log.address as `0x${string}`,
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
      updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    })
    .onConflictDoNothing()

  const roles = TimelockControllerUpgradeable.filter((item) =>
    item.name?.match(/_ROLE/)
  ).map((item) => item.name!)

  const rolesByHash: { [key: string]: string } = {}
  await Promise.all(
    roles.map(async (role) => {
      const roleHash: string = await context.client.readContract({
        abi: TimelockControllerUpgradeable,
        address: event.log.address,
        functionName: role,
      })
      if (roleHash) {
        rolesByHash[roleHash] = role
      }
    })
  )

  const t = await context.db.find(timelock, {
    chainId: context.chain.id,
    contractAddress: event.log.address,
  })

  if (rolesByHash[event.args.role] === 'CANCELLER_ROLE') {
    // Get all the cancellers, remove that one and update!
    const cancellersSet = new Set(t.cancellers)
    cancellersSet.delete(event.args.account)
    await context.db.sql
      .update(timelock)
      .set({
        cancellers: Array.from(cancellersSet),
        updatedAt: BigInt(Math.floor(Date.now() / 1000)),
      })
      .where(
        and(
          eq(timelock.chainId, context.chain.id),
          eq(timelock.contractAddress, event.log.address)
        )
      )
  } else if (rolesByHash[event.args.role] === 'EXECUTOR_ROLE') {
    const executorsSet = new Set(t.executors)
    executorsSet.delete(event.args.account)
    await context.db.sql
      .update(timelock)
      .set({
        executors: Array.from(executorsSet),
        updatedAt: BigInt(Math.floor(Date.now() / 1000)),
      })
      .where(
        and(
          eq(timelock.chainId, context.chain.id),
          eq(timelock.contractAddress, event.log.address)
        )
      )
  } else if (rolesByHash[event.args.role] === 'PROPOSER_ROLE') {
    const proposersSet = new Set(t.proposers)
    proposersSet.delete(event.args.account)
    await context.db.sql
      .update(timelock)
      .set({
        proposers: Array.from(proposersSet),
        updatedAt: BigInt(Math.floor(Date.now() / 1000)),
      })
      .where(
        and(
          eq(timelock.chainId, context.chain.id),
          eq(timelock.contractAddress, event.log.address)
        )
      )
  }
}
