import { task } from 'hardhat/config'
import { checkAllowance } from '@relay-protocol/helpers'
import { Input } from 'enquirer'

task('pool:deposit', 'Deposit ERC20 tokens in a relay vault')
  // .addParam('asset', 'The ERC20 asset to deposit')
  .addParam('pool', 'The relay vault address')
  .addParam('amount', 'the amount of tokens to deposit')
  .setAction(async ({ pool: poolAddress, amount }, { ethers }) => {
    const pool = await ethers.getContractAt('RelayPool', poolAddress)
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()

    // get underlying asset
    const assetAddress = await pool.asset()
    const asset = await ethers.getContractAt('MyToken', assetAddress)
    console.log(`${await pool.name()} - (asset: ${assetAddress})`)

    // check balance
    const balance = await asset.balanceOf(userAddress)
    if (balance < amount) {
      throw Error(
        `Insufficient balance (actual: ${balance}, expected: ${amount})`
      )
    }

    // check allowance
    await checkAllowance(asset, poolAddress, amount, userAddress)

    // make deposit
    const tx = await pool.deposit(amount, userAddress)

    // parse results
    const receipt = await tx.wait()
    console.log(receipt?.logs)
    // TODO: check for AssetsDepositedIntoYieldPool or similar
    // const event = await getEvent(receipt, 'MessagePassed')
  })

task('pool:withdraw', 'Withdraw ERC20 tokens from a relay vault')
  .addParam('pool', 'The relay vault address')
  .addOptionalParam('amount', 'the amount of tokens to deposit')
  .addOptionalParam(
    'timelock',
    'the address of the timelock contract to withdraw from (you must be a proposer on the timelock)'
  )
  .setAction(
    async (
      { pool: poolAddress, amount, timelock: timelockAddress },
      { ethers }
    ) => {
      const [user] = await ethers.getSigners()
      const userAddress = await user.getAddress()

      const pool = await ethers.getContractAt('RelayPool', poolAddress)

      // get underlying asset
      const assetAddress = await pool.asset()
      const asset = await ethers.getContractAt('MyToken', assetAddress)
      console.log(`${await pool.name()} - (asset: ${assetAddress})`)
      const decimals = await asset.decimals()

      const withdrawingAddress = timelockAddress || userAddress

      const maxWithdraw = await pool.maxWithdraw(withdrawingAddress)

      if (maxWithdraw === 0n) {
        throw Error('No funds available for withdrawal')
      }

      if (!amount) {
        const amountInDecimals = await new Input({
          default: 'all',
          message: `How much do you want to withdraw (enter all if you want to withdraw \`all\`)? Your current maximum is ${ethers.formatUnits(maxWithdraw, decimals)}`,
          name: 'amount',
        }).run()
        if (amountInDecimals === 'all') {
          amount = 'all'
        } else {
          amount = ethers.parseUnits(amountInDecimals, decimals)
        }
      }

      let encodedCall
      if (amount === 'all') {
        // We must use redeem!
        const sharesBalance = await pool.balanceOf(withdrawingAddress)
        encodedCall = pool.interface.encodeFunctionData('redeem', [
          sharesBalance,
          userAddress,
          userAddress,
        ])
      } else {
        // use withdraw
        encodedCall = pool.interface.encodeFunctionData('withdraw', [
          amount,
          userAddress,
          userAddress,
        ])
      }

      if (timelockAddress) {
        // TODO: check that the user is a proposer on the timelock?
      } else {
        // parse results
        const receipt = await tx.wait()
        console.log(receipt?.logs)
      }

      // TODO: check for AssetsDepositedIntoYieldPool or similar
      // const event = await getEvent(receipt, 'MessagePassed')
    }
  )
