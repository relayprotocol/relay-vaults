import { Context, Event } from 'ponder:registry'
import { poolAction, userBalance } from 'ponder:schema'
import { zeroAddress } from 'viem'

export default async function ({
  event,
  context,
}: {
  event: Event<'RelayPool:Transfer'>
  context: Context<'RelayPool:Transfer'>
}) {
  const { from, to, amount } = event.args
  const timestamp = event.block.timestamp

  // ignore mint and burn
  if (from !== zeroAddress && to !== zeroAddress) {
    const userFrom = await context.db.find(userBalance, {
      chainId: context.network.chainId,
      relayPool: event.log.address,
      wallet: from,
    })

    const userTo = await context.db.find(userBalance, {
      chainId: context.network.chainId,
      relayPool: event.log.address,
      wallet: to,
    })

    console.log({ from, to, userFrom, userTo })

    // Update existing user balance
    await context.db
      .update(userBalance, {
        chainId: context.network.chainId,
        relayPool: event.log.address,
        wallet: from,
      })
      .set({
        lastUpdated: timestamp,
        shareBalance: userFrom.shareBalance - amount,
        totalWithdrawn: userFrom.totalWithdrawn - amount,
      })

    // if user is receiving tokens for the first time, create it
    if (!userTo) {
      console.log('insert')
      await context.db.insert(userBalance).values({
        chainId: context.network.chainId,
        lastUpdated: timestamp,
        relayPool: event.log.address,
        shareBalance: amount,
        totalDeposited: 0n,
        totalWithdrawn: 0n,
        wallet: to,
      })
    } else {
      console.log('update')
      await context.db
        .update(userBalance, {
          chainId: context.network.chainId,
          relayPool: event.log.address,
          wallet: to,
        })
        .set({
          lastUpdated: timestamp,
          shareBalance: userTo ? userTo.shareBalance - amount : amount,
          totalWithdrawn: userTo ? userTo.totalWithdrawn - amount : amount,
        })
    }
  }
}
