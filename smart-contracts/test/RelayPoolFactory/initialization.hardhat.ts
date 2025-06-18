import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import {
  MyToken,
  MyYieldPool,
  RelayPoolFactory,
  TimelockControllerUpgradeable,
} from '../../typechain-types'
import RelayPoolFactoryModule from '../../ignition/modules/RelayPoolFactoryModule'
import { getEvent } from '@relay-vaults/helpers'

describe('RelayPoolFactory: deployment', () => {
  let userAddress
  let relayPoolFactory: RelayPoolFactory
  let myToken: MyToken
  let timelockTemplate: TimelockControllerUpgradeable
  const hyperlaneMailbox = '0x1000000000000000000000000000000000000000'
  const weth = '0x2000000000000000000000000000000000000000'
  let thirdPartyPool: MyYieldPool

  before(async () => {
    const [user] = await ethers.getSigners()
    userAddress = await user.getAddress()
    myToken = await ethers.deployContract('MyToken', ['My Token', 'TOKEN'])
    expect(await myToken.totalSupply()).to.equal(1000000000000000000000000000n)
    // deploy 3rd party pool
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])

    // Deposit in the third party pool
    const initialDepositThirdPartyPool = ethers.parseUnits(
      '100',
      await myToken.decimals()
    )
    await myToken
      .connect(user)
      .approve(await thirdPartyPool.getAddress(), initialDepositThirdPartyPool)
    await thirdPartyPool
      .connect(user)
      .deposit(initialDepositThirdPartyPool, userAddress)
    // Check that there are shares!
    expect(await myToken.totalSupply()).to.equal('1000000000000000000000000000')

    // Deploy the factory
    ;({ relayPoolFactory, timelockTemplate } = await ignition.deploy(
      RelayPoolFactoryModule,
      {
        deploymentId: 'RelayPoolFactory',
        parameters: {
          RelayPoolFactory: {
            hyperlaneMailbox,
            timelockDelay: 60 * 60 * 24 * 7,
            weth,
          },
        },
      }
    ))
  })

  it('should have deployed the factory', async () => {
    expect(await relayPoolFactory.HYPERLANE_MAILBOX()).to.equal(
      hyperlaneMailbox
    )
    expect(await relayPoolFactory.WETH()).to.equal(weth)
    expect(await relayPoolFactory.TIMELOCK_TEMPLATE()).to.equal(
      await timelockTemplate.getAddress()
    )
  })

  it('should fail to deploy a pool with an insufficient deposit', async () => {
    const initialDeposit = ethers.parseUnits('0.9', await myToken.decimals())

    await myToken.mint(initialDeposit)
    await myToken.approve(await relayPoolFactory.getAddress(), initialDeposit)

    await expect(
      relayPoolFactory.deployPool(
        await myToken.getAddress(),
        'Test Vault',
        'RELAY',
        await thirdPartyPool.getAddress(),
        60 * 60 * 24 * 7,
        initialDeposit,
        userAddress
      )
    )
      .to.be.revertedWithCustomError(
        relayPoolFactory,
        'InsufficientInitialDeposit'
      )
      .withArgs('900000000000000000')
  })

  it('should fail to deploy from an unauthorized user while there is an owner', async () => {
    const [, anotherUser] = await ethers.getSigners()
    const initialDeposit = ethers.parseUnits('10', await myToken.decimals())
    const userAddress = await anotherUser.getAddress()

    await myToken.mint(initialDeposit)
    await myToken.approve(await relayPoolFactory.getAddress(), initialDeposit)

    await expect(
      relayPoolFactory
        .connect(anotherUser)
        .deployPool(
          await myToken.getAddress(),
          'Test Vault',
          'RELAY',
          await thirdPartyPool.getAddress(),
          1,
          initialDeposit,
          userAddress
        )
    )
      .to.be.revertedWithCustomError(relayPoolFactory, 'UnauthorizedCaller')
      .withArgs(userAddress)
  })

  it('should fail to deploy a pool with the timelock delay', async () => {
    const [user] = await ethers.getSigners()
    const initialDeposit = ethers.parseUnits('10', await myToken.decimals())
    const userAddress = await user.getAddress()

    // We need to renounce the ownership of the factory
    await relayPoolFactory.renounceOwnership()

    await myToken.mint(initialDeposit)
    await myToken.approve(await relayPoolFactory.getAddress(), initialDeposit)

    await expect(
      relayPoolFactory.deployPool(
        await myToken.getAddress(),
        'Test Vault',
        'RELAY',
        await thirdPartyPool.getAddress(),
        1,
        initialDeposit,
        userAddress
      )
    )
      .to.be.revertedWithCustomError(
        relayPoolFactory,
        'InsufficientTimelockDelay'
      )
      .withArgs(1)
  })

  it('should let user deploy a pool', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const initialDeposit = ethers.parseUnits('10', await myToken.decimals())

    await myToken.mint(initialDeposit)
    await myToken.approve(await relayPoolFactory.getAddress(), initialDeposit)

    const tx = await relayPoolFactory.deployPool(
      await myToken.getAddress(),
      'Test Vault',
      'RELAY',
      await thirdPartyPool.getAddress(),
      60 * 60 * 24 * 7,
      initialDeposit,
      userAddress
    )
    const receipt = await tx.wait()
    const event = await getEvent(
      receipt!,
      'PoolDeployed',
      relayPoolFactory.interface
    )
    const poolAddress = event.args.pool
    const pool = await ethers.getContractAt('RelayPool', poolAddress)
    expect(await pool.asset()).to.equal(await myToken.getAddress())
    expect(event.args.asset).to.equal(await myToken.getAddress())

    // Check that the pool is owned by the timelock
    expect(await pool.owner()).to.equal(event.args.timelock)
    const timelock = await ethers.getContractAt(
      'TimelockControllerUpgradeable',
      event.args.timelock
    )
    // No admin role
    expect(
      await timelock.hasRole(await timelock.DEFAULT_ADMIN_ROLE(), userAddress)
    ).to.be.equal(false)
    // But proposer, executor and canceller roles
    expect(
      await timelock.hasRole(await timelock.PROPOSER_ROLE(), userAddress)
    ).to.be.equal(true)
    expect(
      await timelock.hasRole(await timelock.EXECUTOR_ROLE(), userAddress)
    ).to.be.equal(true)
    expect(
      await timelock.hasRole(await timelock.CANCELLER_ROLE(), userAddress)
    ).to.be.equal(true)
  })

  it('should not let a random user update the delay on the timelock', async () => {
    const [user, another] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const initialDeposit = ethers.parseUnits('10', await myToken.decimals())

    await myToken.mint(initialDeposit)
    await myToken.approve(await relayPoolFactory.getAddress(), initialDeposit)
    const defaultDelay = 60 * 60 * 24 * 7
    const newDelay = 60

    const tx = await relayPoolFactory.deployPool(
      await myToken.getAddress(),
      'Test Vault',
      'RELAY',
      await thirdPartyPool.getAddress(),
      defaultDelay,
      initialDeposit,
      userAddress
    )
    const receipt = await tx.wait()
    const event = await getEvent(
      receipt!,
      'PoolDeployed',
      relayPoolFactory.interface
    )

    const timelock = await ethers.getContractAt(
      'TimelockControllerUpgradeable',
      event.args.timelock
    )

    // schedule the tx through the timelock
    await expect(
      timelock
        .connect(another)
        .schedule(
          event.args.timelock,
          0n,
          timelock.interface.encodeFunctionData('updateDelay', [newDelay]),
          ethers.ZeroHash,
          ethers.id('UPDATE_DELAY'),
          defaultDelay
        )
    ).to.be.revertedWithCustomError(
      timelock,
      'AccessControlUnauthorizedAccount'
    )
  })

  it('should let the owner update the delay on the timelock', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const initialDeposit = ethers.parseUnits('10', await myToken.decimals())

    await myToken.mint(initialDeposit)
    await myToken.approve(await relayPoolFactory.getAddress(), initialDeposit)
    const defaultDelay = 60 * 60 * 24 * 7
    const newDelay = 60

    const tx = await relayPoolFactory.deployPool(
      await myToken.getAddress(),
      'Test Vault',
      'RELAY',
      await thirdPartyPool.getAddress(),
      defaultDelay,
      initialDeposit,
      userAddress
    )
    const receipt = await tx.wait()
    const event = await getEvent(
      receipt!,
      'PoolDeployed',
      relayPoolFactory.interface
    )

    const timelock = await ethers.getContractAt(
      'TimelockControllerUpgradeable',
      event.args.timelock
    )
    // check the delay now!
    expect(await timelock.getMinDelay()).to.equal(defaultDelay)

    // update the delay, thru a timelocked operation
    const target = event.args.timelock
    const value = 0n
    const payload = timelock.interface.encodeFunctionData('updateDelay', [
      newDelay,
    ])
    const predecessor = ethers.ZeroHash
    const salt = ethers.id('UPDATE_DELAY')

    // schedule the tx through the timelock
    await (
      await timelock.schedule(
        target,
        value,
        payload,
        predecessor,
        salt,
        defaultDelay
      )
    ).wait()
    // Advance the time
    await ethers.provider.send('evm_increaseTime', [defaultDelay + 1])

    // execute the timelocked tx!
    await (
      await timelock.execute(target, value, payload, predecessor, salt)
    ).wait()

    expect(await timelock.getMinDelay()).to.equal(newDelay)
  })
})
