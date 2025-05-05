import { task } from 'hardhat/config'
import { checkAllowance, getStataToken } from '@relay-protocol/helpers'
import { Input, Select, AutoComplete } from 'enquirer'
import { getPoolsForNetwork } from './deploy/bridge-proxy'
import networks from '@relay-protocol/networks'
import { executeThruTimelock } from '../lib/multisig'
import { MaxUint256 } from 'ethers'

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

const roles = [
  'CANCELLER_ROLE',
  'PROPOSER_ROLE',
  'EXECUTOR_ROLE',
  // 'DEFAULT_ADMIN_ROLE', // We should avoid granting this role... as it can let folks with it the ability to change the timelock duration
]

task(
  'pool:grant-role',
  'Grant a role to the pool contract (thru the timelock!)'
)
  .addOptionalParam('pool', 'The relay vault address')
  .addOptionalParam('role', 'The role')
  .addParam('recipient', 'The address of the new owner')
  .setAction(async ({ pool: poolAddress, recipient, role }, { ethers }) => {
    const [user] = await ethers.getSigners()
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

    if (!role || !roles.includes(role)) {
      role = await new Select({
        choices: roles.map((role) => {
          return {
            message: role,
            value: role,
          }
        }),
        message: 'Please choose the role to grant:',
        name: 'role',
      }).run()
    }

    const pool = await ethers.getContractAt('RelayPool', poolAddress)
    const timelockAddress = await pool.owner()

    const timelock = await ethers.getContractAt(
      'TimelockControllerUpgradeable',
      timelockAddress
    )
    const roleHash = await timelock[role]()

    if (!(await timelock.hasRole(roleHash, recipient))) {
      console.log(`Granting ${role} to recipient`)
      const tx = await timelock.grantRole.populateTransaction(
        roleHash,
        recipient
      )
      await executeThruTimelock(ethers, timelockAddress, tx.data, tx.to, 0n)
    }
  })

task(
  'pool:revoke-role',
  'Revoke a role from the pool contract (thru the timelock!)'
)
  .addOptionalParam('pool', 'The relay vault address')
  .addOptionalParam('role', 'The role')
  .addOptionalParam('recipient', 'The address of the new owner')
  .setAction(async ({ pool: poolAddress, recipient, role }, { ethers }) => {
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

    if (!recipient) {
      recipient = await new Input({
        default: userAddress,
        message: 'Please enter the recipient address (default is yours):',
        name: 'recipient',
      }).run()
    }

    const pool = await ethers.getContractAt('RelayPool', poolAddress)
    const timelockAddress = await pool.owner()

    const timelock = await ethers.getContractAt(
      'TimelockControllerUpgradeable',
      timelockAddress
    )
    const roleHashes: { [role: string]: string } = {}
    for (const role of roles) {
      roleHashes[role] = await timelock[role]()
    }

    const hasRoles: { [role: string]: boolean } = {}
    for (const role of roles) {
      hasRoles[role] = await timelock.hasRole(roleHashes[role], recipient)
    }
    const choices = Object.entries(hasRoles).reduce((choices, role) => {
      if (role[1]) {
        return [
          ...choices,
          {
            message: role[0],
            value: role[0],
          },
        ]
      }
      return choices
    }, [])
    if (!role || !roles.includes(role)) {
      role = await new Select({
        choices,
        message: 'Please choose the role to revoke:',
        name: 'role',
      }).run()
    }

    const roleHash = await timelock[role]()

    console.log(`Revoking ${role} from recipient`)
    const tx = await timelock.revokeRole.populateTransaction(
      roleHash,
      recipient
    )
    await executeThruTimelock(ethers, timelockAddress, tx.data, tx.to, 0n)
  })

task(
  'pool:update-yield-pool',
  'Update the yield pool contract (thru the timelock!)'
)
  .addOptionalParam('pool', 'The relay vault address')
  .addOptionalParam('newYieldPool', 'The new yield pool address')
  .setAction(
    async (
      { pool: poolAddress, newYieldPool: newYieldPoolAddress },
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

      const [asset, oldYieldPoolAddress, timelockAddress] = await Promise.all([
        pool.asset(),
        pool.yieldPool(),
        pool.owner(),
      ])

      if (!newYieldPoolAddress) {
        const yieldPoolName = await new AutoComplete({
          choices: ['aave', 'other'],
          message: 'Please choose the new yield pool type:',
          name: 'yieldPoolName',
        }).run()
        if (yieldPoolName === 'aave') {
          newYieldPoolAddress = await getStataToken(asset, chainId)
        } else {
          // We need to deploy a dummy yield pool
          newYieldPoolAddress = await new Input({
            default: userAddress,
            message: 'Please enter the address of the new yield pool:',
            name: 'newYieldPoolAddress',
          }).run()
        }
      }

      // Old yield pool
      const oldYieldPool = await ethers.getContractAt(
        'ERC4626',
        oldYieldPoolAddress
      )
      const [totalAssetsOldPool, totalSupplyOldPool, oldPoolDecimals] =
        await Promise.all([
          oldYieldPool.totalAssets(),
          oldYieldPool.totalSupply(),
          oldYieldPool.decimals(),
        ])
      const currentSharePriceFromOldPool =
        (totalAssetsOldPool * 10n ** oldPoolDecimals) / totalSupplyOldPool

      // New yield pool
      const newYieldPool = await ethers.getContractAt(
        'ERC4626',
        newYieldPoolAddress
      )
      const [totalAssetsNewPool, totalSupplyNewPool, newPoolDecimals] =
        await Promise.all([
          newYieldPool.totalAssets(),
          newYieldPool.totalSupply(),
          newYieldPool.decimals(),
        ])
      const currentSharePricePriceFromNewPool =
        (totalAssetsNewPool * 10n ** newPoolDecimals) / totalSupplyNewPool


      // We allow a 0.01% slippage
      // Encode the function call to updateYieldPool
      const encodedCall = pool.interface.encodeFunctionData('updateYieldPool', [
        newYieldPoolAddress,
        (currentSharePriceFromOldPool * 9999n) / 10000n,
        (currentSharePricePriceFromNewPool * 10001n) / 10000n,
      ])

      await executeThruTimelock(
        ethers,
        timelockAddress,
        encodedCall,
        poolAddress,
        0n
      )
    }
  )
