import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import networks from '@relay-vaults/networks'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyToken, MyYieldPool, RelayPool } from '../../typechain-types'
import { getEvent } from '@relay-vaults/helpers'
import { Signer } from 'ethers'

describe('RelayPool: curator', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let yieldPool: MyYieldPool

  before(async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    myToken = await ethers.deployContract('MyToken', ['My Token', 'TOKEN'])
    expect(await myToken.totalSupply()).to.equal(1000000000000000000000000000n)
    // deploy 3rd party pool
    yieldPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])
    // deploy the pool using ignition
    const parameters = {
      RelayPool: {
        asset: await myToken.getAddress(),
        curator: userAddress,
        hyperlaneMailbox: networks[1].hyperlaneMailbox,
        name: `${await myToken.name()} Relay Pool`,
        symbol: `${await myToken.symbol()}-REL`,
        thirdPartyPool: await yieldPool.getAddress(),
        weth: ethers.ZeroAddress,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))
  })

  describe('updateYieldPool', () => {
    let betterYieldPool: MyYieldPool
    let user: Signer
    before(async () => {
      ;[user] = await ethers.getSigners()

      // deposit some funds in the relay pool
      await myToken.approve(
        await relayPool.getAddress(),
        ethers.parseEther('3')
      )
      await relayPool.deposit(ethers.parseEther('3'), await user.getAddress())

      // deploy a new pool!
      betterYieldPool = await ethers.deployContract('MyYieldPool', [
        await myToken.getAddress(),
        'My Better Yield Pool',
        'BETTER',
      ])
    })

    it('should only be callable by the curator', async () => {
      const [, another] = await ethers.getSigners()
      await expect(
        relayPool.connect(another).updateYieldPool(
          await yieldPool.getAddress(),
          0, // minSharePriceFromOldPool
          ethers.MaxUint256 // maxSharePricePriceFromNewPool
        )
      )
        .to.be.revertedWithCustomError(relayPool, 'OwnableUnauthorizedAccount')
        .withArgs(await another.getAddress())
    })

    it('should pull all the funds from the previous pool and deposit in the new pool', async () => {
      const newPoolAddress = await betterYieldPool.getAddress()
      const oldPoolAddress = await relayPool.yieldPool()
      const oldPoolTokenBalanceBefore = await myToken.balanceOf(oldPoolAddress)
      expect(oldPoolTokenBalanceBefore).to.be.greaterThan(0)
      expect(await myToken.balanceOf(newPoolAddress)).to.be.equal(0)

      // make a deposit into the new yield pool
      const yieldPoolDeposit = ethers.parseEther('3.1')
      await myToken.approve(
        await betterYieldPool.getAddress(),
        yieldPoolDeposit
      )
      await betterYieldPool.deposit(yieldPoolDeposit, await user.getAddress())

      const newPoolTokenBalanceBefore = await myToken.balanceOf(newPoolAddress)
      expect(newPoolTokenBalanceBefore).to.be.equal(yieldPoolDeposit)

      const receipt = await (
        await relayPool.updateYieldPool(
          newPoolAddress,
          0, // minSharePriceFromOldPool - setting to 0 to accept any price
          ethers.MaxUint256 // maxSharePricePriceFromNewPool - setting high to accept any price
        )
      ).wait()

      const oldPoolTokenBalanceAfter = await myToken.balanceOf(oldPoolAddress)
      expect(oldPoolTokenBalanceAfter).to.be.equal(0)
      const newPoolTokenBalanceAfter = await myToken.balanceOf(newPoolAddress)
      expect(newPoolTokenBalanceAfter).to.be.greaterThan(yieldPoolDeposit)
      const { event } = await getEvent(
        receipt!,
        'YieldPoolChanged',
        relayPool.interface
      )
      expect(event.args.oldPool).to.equal(oldPoolAddress)
      expect(event.args.newPool).to.equal(newPoolAddress)
    })

    it('should revert if share price from old pool is too low', async () => {
      // Deploy another pool for this test
      const anotherPool = await ethers.deployContract('MyYieldPool', [
        await myToken.getAddress(),
        'Another Yield Pool',
        'ANOTHER',
      ])

      // Set a very high minimum share price that can't be met
      const highMinSharePrice = ethers.MaxUint256
      await expect(
        relayPool.updateYieldPool(
          await anotherPool.getAddress(),
          highMinSharePrice,
          ethers.parseEther('1')
        )
      ).to.be.revertedWithCustomError(relayPool, 'SharePriceTooLow')
    })

    it('should revert if share price from new pool is too high', async () => {
      // Deploy another pool for this test
      const anotherPool = await ethers.deployContract('MyYieldPool', [
        await myToken.getAddress(),
        'Another Yield Pool',
        'ANOTHER',
      ])

      // make a deposit into the new yield pool (prevent division by zero)
      const yieldPoolDeposit = ethers.parseEther('.1')
      await myToken.approve(await anotherPool.getAddress(), yieldPoolDeposit)
      await anotherPool.deposit(yieldPoolDeposit, await user.getAddress())

      // Set a very low maximum share price that will be exceeded
      const lowMaxSharePrice = 1n // Almost 0

      await expect(
        relayPool.updateYieldPool(
          await anotherPool.getAddress(),
          0,
          lowMaxSharePrice
        )
      ).to.be.revertedWithCustomError(relayPool, 'SharePriceTooHigh')
    })
  })

  describe('addOrigin', async () => {
    const newOrigin = {
      bridge: ethers.Wallet.createRandom().address,
      bridgeFee: 5,
      chainId: 10,
      coolDown: 0,
      curator: ethers.Wallet.createRandom().address,
      maxDebt: ethers.parseEther('10'),
      proxyBridge: ethers.Wallet.createRandom().address,
    }

    it('should only be callable by the curator', async () => {
      const [, another] = await ethers.getSigners()
      await expect(relayPool.connect(another).addOrigin(newOrigin))
        .to.be.revertedWithCustomError(relayPool, 'OwnableUnauthorizedAccount')
        .withArgs(await another.getAddress())
    })

    it('should add the origin to the list of approved origins and emit an event', async () => {
      const authorizedOriginBefore = await relayPool.authorizedOrigins(
        newOrigin.chainId,
        newOrigin.bridge
      )
      expect(authorizedOriginBefore.maxDebt).to.equal(0)
      expect(authorizedOriginBefore.outstandingDebt).to.equal(0)
      expect(authorizedOriginBefore.proxyBridge).to.equal(ethers.ZeroAddress)

      const receipt = await (await relayPool.addOrigin(newOrigin)).wait()
      const { event } = await getEvent(
        receipt!,
        'OriginAdded',
        relayPool.interface
      )
      expect(event.args.origin.maxDebt).to.equal(newOrigin.maxDebt)
      expect(event.args.origin.chainId).to.equal(newOrigin.chainId)
      expect(event.args.origin.bridge).to.equal(newOrigin.bridge)
      expect(event.args.origin.proxyBridge).to.equal(newOrigin.proxyBridge)

      const authorizedOriginAfter = await relayPool.authorizedOrigins(
        newOrigin.chainId,
        newOrigin.bridge
      )
      expect(authorizedOriginAfter.maxDebt).to.equal(newOrigin.maxDebt)
      expect(authorizedOriginAfter.outstandingDebt).to.equal(0)
      expect(authorizedOriginAfter.proxyBridge).to.equal(newOrigin.proxyBridge)
    })
  })

  describe('disableOrigin', () => {
    let originToRemove: {
      chainId: number
      bridge: string
      maxDebt: bigint
      proxyBridge: string
      bridgeFee: number
      curator: string
      coolDown: number
    }
    before(async () => {
      const [user] = await ethers.getSigners()

      originToRemove = {
        bridge: ethers.Wallet.createRandom().address,
        bridgeFee: 0,
        chainId: 10,
        coolDown: 0,
        curator: await user.getAddress(),
        maxDebt: ethers.parseEther('10'),
        proxyBridge: ethers.Wallet.createRandom().address,
      }

      // Let's first add it!
      await relayPool.addOrigin(originToRemove)
    })

    it("should only be callable by the origin's curator", async () => {
      const [, another] = await ethers.getSigners()
      await expect(
        relayPool
          .connect(another)
          .disableOrigin(originToRemove.chainId, originToRemove.bridge)
      )
        .to.be.revertedWithCustomError(relayPool, 'UnauthorizedCaller')
        .withArgs(await another.getAddress())
    })

    it('should change the maximum debt on the origin and emit an event', async () => {
      const authorizedOriginBefore = await relayPool.authorizedOrigins(
        originToRemove.chainId,
        originToRemove.bridge
      )
      expect(authorizedOriginBefore.maxDebt).to.not.equal(0n)
      const receipt = await (
        await relayPool.disableOrigin(
          originToRemove.chainId,
          originToRemove.bridge
        )
      ).wait()
      const authorizedOriginAfter = await relayPool.authorizedOrigins(
        originToRemove.chainId,
        originToRemove.bridge
      )
      expect(authorizedOriginAfter.maxDebt).to.equal(0n)

      const { event } = await getEvent(
        receipt!,
        'OriginDisabled',
        relayPool.interface
      )
      expect(event.args.chainId).to.equal(originToRemove.chainId)
      expect(event.args.bridge).to.equal(originToRemove.bridge)
      expect(event.args.maxDebt).to.equal(originToRemove.maxDebt)
      expect(event.args.outstandingDebt).to.equal(
        authorizedOriginBefore.outstandingDebt
      )
      expect(event.args.proxyBridge).to.equal(originToRemove.proxyBridge)
    })
  })
})
