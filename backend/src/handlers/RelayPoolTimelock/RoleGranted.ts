import { TimelockControllerUpgradeable } from '@relay-protocol/abis'
import { and, eq } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { timelock } from 'ponder:schema'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPoolTimelock:RoleGranted'>
  context: Context<'RelayPoolTimelock:RoleGranted'>
}) {
  // Make sure the timelock already exists in the database (create it if not!)
  await context.db
    .insert(timelock)
    .values({
      chainId: context.chain.id,
      contractAddress: event.log.address as `0x${string}`,
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
    // Get all the cancellers, concat that one and update!
    await context.db.sql
      .update(timelock)
      .set({
        cancellers: Array.from(
          new Set(t.cancellers.concat(event.args.account))
        ),
      })
      .where(
        and(
          eq(timelock.chainId, context.chain.id),
          eq(timelock.contractAddress, event.log.address)
        )
      )
  } else if (rolesByHash[event.args.role] === 'EXECUTOR_ROLE') {
    await context.db.sql
      .update(timelock)
      .set({
        executors: Array.from(new Set(t.executors.concat(event.args.account))),
      })
      .where(
        and(
          eq(timelock.chainId, context.chain.id),
          eq(timelock.contractAddress, event.log.address)
        )
      )
  } else if (rolesByHash[event.args.role] === 'PROPOSER_ROLE') {
    await context.db.sql
      .update(timelock)
      .set({
        proposers: Array.from(new Set(t.proposers.concat(event.args.account))),
      })
      .where(
        and(
          eq(timelock.chainId, context.chain.id),
          eq(timelock.contractAddress, event.log.address)
        )
      )
  }
}
