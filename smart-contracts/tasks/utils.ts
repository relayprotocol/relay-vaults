import { Confirm } from 'enquirer'

import { Signer } from 'ethers'

export const executeThruTimelock = async (
  ethers: any,
  timelockAddress: string,
  user: Signer,
  payload: string,
  target: string,
  value: bigint
) => {
  // First: simulate!
  try {
    await ethers.provider.estimateGas({
      data: payload,
      from: timelockAddress,
      to: target,
    })
  } catch (e) {
    const confirm = await new Confirm({
      message: `Transaction reverts: ${JSON.stringify({
        data: payload,
        from: timelockAddress,
        to: target,
      })}. Are you sure you want to proceed?`,
      name: 'confirm',
    }).run()
    if (!confirm) {
      return
    }
  }

  const timelock = await ethers.getContractAt(
    'TimelockControllerUpgradeable',
    timelockAddress
  )

  const userAddress = await user.getAddress()
  // Check if the user is a submitter on the timelock!
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE()

  const isProposer = await timelock.hasRole(PROPOSER_ROLE, userAddress)
  if (!isProposer) {
    throw Error(`User ${userAddress} is not a proposer on the timelock!`)
  }

  // Get the current timestamp for the timelock
  const currentTimestamp = Date.now()
  const delaySeconds = await timelock.getMinDelay()
  const eta = new Date(
    currentTimestamp + Number(delaySeconds) * 1000
  ).toLocaleString()

  console.log(
    `Scheduling transaction through timelock with delay: ${delaySeconds} seconds. Estimated execution time: ${eta}`
  )

  // schedule the tx through the timelock
  const predecessor = ethers.ZeroHash // predecessor
  const salt = ethers.id(`OP_${payload}_${Date.now()}`) //salt
  const delay = delaySeconds // delay

  // And now, schedule it!
  const tx = await timelock.schedule(
    target,
    value,
    payload,
    predecessor,
    salt,
    delay
  )
  await tx.wait()
  console.log('✅ Transaction scheduled through timelock!')

  const executeTx = await timelock.execute.populateTransaction(
    target,
    value,
    payload,
    predecessor,
    salt
  )

  if (delaySeconds < 60 * 60) {
    console.log('Waiting...')
    await new Promise((resolve) =>
      setTimeout(resolve, (Number(delaySeconds) + 60) * 1000)
    )
    const tx = await user.sendTransaction(executeTx)
    await tx.wait()
    console.log('✅ Transaction executed!')
  } else {
    console.log(`Transaction can be executed after: ${eta}`)
    console.log('To execute this transaction use the following params:')
    console.log(executeTx)
  }
}
