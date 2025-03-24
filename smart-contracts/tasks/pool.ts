import { task } from 'hardhat/config'
import { checkAllowance } from '@relay-protocol/helpers'
import { Input, Select } from 'enquirer'
import { executeThruTimelock } from './origins/add'
import { getPoolsForNetwork } from './deploy/bridge-proxy'
import networks from '@relay-protocol/networks'

task('pool:deposit', 'Deposit ERC20 tokens in a relay vault')
  // .addParam('asset', 'The ERC20 asset to deposit')
  .addOptionalParam('pool', 'The relay vault address')
  .addOptionalParam('amount', 'the amount of tokens to deposit')
  .setAction(async ({ pool: poolAddress, amount }, { ethers }) => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const { chainId } = await ethers.provider.getNetwork()
    const { assets } = networks[chainId.toString()]

    if (!poolAddress) {
      const pools = await getPoolsForNetwork(Number(chainId))
      poolAddress = await new Select({
        choices: pools.map((pool) => {
          return {
            message: pool.params.name,
            value: pool.address,
          }
        }),
        message: 'Please choose the relay vault address:',
        name: 'poolAddress',
      }).run()
    }

    const pool = await ethers.getContractAt('RelayPool', poolAddress)

    // get underlying asset
    const assetAddress = await pool.asset()
    const asset = await ethers.getContractAt('MyToken', assetAddress)
    console.log(`${await pool.name()} - (asset: ${assetAddress})`)

    let decimals = 18n
    if (assetAddress !== ethers.ZeroAddress) {
      const asset = await ethers.getContractAt('MyToken', assetAddress)
      decimals = await asset.decimals()
    }

    if (!amount) {
      const amountInDecimals = await new Input({
        default: '0.1',
        message: 'How much liquidity do you want to add?',
        name: 'amount',
      }).run()
      amount = ethers.parseUnits(amountInDecimals, decimals)
    }

    // check balance
    const balance = await asset.balanceOf(userAddress)
    if (balance < amount) {
      if (assetAddress === assets.weth) {
        console.log('Wrapping WETH...')
        // Wrap WETH!
        const tx = await user.sendTransaction({
          to: asset,
          value: amount,
        })
        await tx.wait()
      } else {
        throw Error(
          `Insufficient balance (actual: ${balance}, expected: ${amount})`
        )
      }
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
  .addOptionalParam('pool', 'The relay vault address')
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
      const { chainId } = await ethers.provider.getNetwork()

      if (!poolAddress) {
        const pools = await getPoolsForNetwork(Number(chainId))
        poolAddress = await new Select({
          choices: pools.map((pool) => {
            return {
              message: pool.params.name,
              value: pool.address,
            }
          }),
          message: 'Please choose the relay vault address:',
          name: 'poolAddress',
        }).run()
      }

      const pool = await ethers.getContractAt('RelayPool', poolAddress)

      // get underlying asset
      const assetAddress = await pool.asset()
      const asset = await ethers.getContractAt('MyToken', assetAddress)
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
          withdrawingAddress,
        ])
      } else {
        // use withdraw
        encodedCall = pool.interface.encodeFunctionData('withdraw', [
          amount,
          userAddress,
          withdrawingAddress,
        ])
      }

      if (timelockAddress) {
        const target = poolAddress
        const value = 0
        const payload = encodedCall
        await executeThruTimelock(
          ethers,
          timelockAddress,
          user,
          payload,
          target,
          value
        )
      } else {
        const tx = await user.sendTransaction({
          data: encodedCall,
          to: poolAddress,
          value: 0,
        })
        await tx.wait()
        console.log(
          `Withdrawn ${amount == 'all' ? 'all' : ethers.formatUnits(amount, decimals)} from ${poolAddress}`
        )
      }
    }
  )
