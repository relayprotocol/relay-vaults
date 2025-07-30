import networks from '@relay-vaults/networks'
import SafeApiKit from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'
import { Confirm, Select } from 'enquirer'

const MAINNET_SAFE_ADDRESS = '0x1f06b7dd281Ca4D19d3E0f74281dAfDeC3D43963'

export const executeThruTimelock = async (
  ethers: any,
  timelockAddress: string,
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
  const [user] = await ethers.getSigners()
  const userAddress = await user.getAddress()

  // Check if the user is a submitter on the timelock!
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE()
  const isProposer = await timelock.hasRole(PROPOSER_ROLE, userAddress)

  const useMultisig = await new Confirm({
    message: 'Do you want to use a multisig?',
    name: 'confirm',
  }).run()

  if (!isProposer || useMultisig) {
    const { chainId } = await ethers.provider.getNetwork()

    const apiKit = new SafeApiKit({
      chainId,
    })

    // We probably need to go thru a multisig!
    console.info(
      `User ${userAddress} is not a proposer on the timelock ${timelockAddress}. Can we go thru a multisig?`
    )
    const { safes: userSafes } = await apiKit.getSafesByOwner(userAddress)
    const safes = userSafes.includes(MAINNET_SAFE_ADDRESS)
      ? [...userSafes]
      : [...userSafes, MAINNET_SAFE_ADDRESS]
    let safe = safes[0]
    if (safes.length > 1) {
      const safeAddress = await new Select({
        choices: safes.map((safe) => {
          return {
            message:
              safe === MAINNET_SAFE_ADDRESS
                ? `Relay Vault Team Safe ${MAINNET_SAFE_ADDRESS}`
                : safe,
            value: safe,
          }
        }),
        message: 'Please choose the SAFE address:',
        name: 'safeAddress',
      }).run()
      safe = safeAddress
    }
    await submitTransactionsViaMultisig(
      ethers,
      timelockAddress,
      safe,
      payload,
      target,
      value
    )
  } else {
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

    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE()
    const isExecutor = await timelock.hasRole(EXECUTOR_ROLE, userAddress)

    const executeTx = await timelock.execute.populateTransaction(
      target,
      value,
      payload,
      predecessor,
      salt
    )
    if (!isExecutor) {
      console.log(
        `User ${userAddress} is not an executor on the timelock ${timelockAddress}. `
      )
      console.log(
        `Transaction can be executed after by an executor after ${eta}`
      )
      console.log('To execute this transaction use the following params:')
      console.log(executeTx)
    } else {
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
  }
}

const submitTxToSafe = async (
  ethers: any,
  safeAddress: string,
  tx: { data: string; to: string; value: string },
  nonceOffset: number
) => {
  const [user] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()
  const userAddress = await user.getAddress()

  const apiKit = new SafeApiKit({
    chainId,
  })

  const safe = await Safe.init({
    provider: networks[chainId].rpc[0],
    safeAddress,
    signer: process.env.DEPLOYER_PRIVATE_KEY,
  })
  const currentNonce = await safe.getNonce()
  const nextNonce = currentNonce + 1

  // Create a Safe transaction
  const scheduleTansactionFromSafe = await safe.createTransaction({
    options: {
      nonce: nextNonce + nonceOffset,
    },
    transactions: [
      {
        data: tx.data,
        to: tx.to,
        value: tx.value || '0',
      },
    ],
  })
  const safeTxHash = await safe.getTransactionHash(scheduleTansactionFromSafe)
  const signature = await safe.signHash(safeTxHash)

  // Propose transaction to the service
  await apiKit.proposeTransaction({
    safeAddress,
    safeTransactionData: scheduleTansactionFromSafe.data,
    safeTxHash,
    senderAddress: userAddress,
    senderSignature: signature.data,
  })
  return nonce + nonceOffset
}

export const submitTransactionsViaMultisig = async (
  ethers: any,
  timelockAddress: string,
  safeAddress: string,
  payload: string,
  target: string,
  value: bigint
) => {
  const timelock = await ethers.getContractAt(
    'TimelockControllerUpgradeable',
    timelockAddress
  )

  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE()
  const isProposer = await timelock.hasRole(PROPOSER_ROLE, safeAddress)
  if (!isProposer) {
    throw Error(`Multisig ${safeAddress} is not a proposer on the timelock!`)
  }
  // schedule the tx through the timelock
  const predecessor = ethers.ZeroHash // predecessor
  const salt = ethers.id(`OP_${payload}_${Date.now()}`) //salt
  const delay = await timelock.getMinDelay() // delay

  // And now, prepare the scheduling tx
  const scheduleTx = await timelock.schedule.populateTransaction(
    target,
    value,
    payload,
    predecessor,
    salt,
    delay
  )
  const scheduleTxNonce = await submitTxToSafe(
    ethers,
    safeAddress,
    scheduleTx,
    0
  )
  console.info(
    `Submitted scheduling transaction to multisig ${safeAddress} as tx #${scheduleTxNonce}.`
  )

  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE()
  const isExecutor = await timelock.hasRole(EXECUTOR_ROLE, safeAddress)
  if (!isExecutor) {
    throw Error(`Multisig ${safeAddress} is not an executor on the timelock!`)
  }
  // Note: this one is only executable after the delay!
  const executeTx = await timelock.execute.populateTransaction(
    target,
    value,
    payload,
    predecessor,
    salt
  )
  const executeTxNonce = await submitTxToSafe(ethers, safeAddress, executeTx, 1)
  console.info(
    `Submitted execution transaction to multisig ${safeAddress} as tx #${executeTxNonce}. This will become executable after the timelock delay, once the scheduling tx is executed!`
  )
}
