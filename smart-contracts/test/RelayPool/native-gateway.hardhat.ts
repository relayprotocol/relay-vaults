import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'

import { IWETH, RelayPool, RelayPoolNativeGateway } from '../../typechain-types'
import { getBalance } from '@relay-protocol/helpers'
import { reverts } from '../utils/errors'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { ZeroAddress } from 'ethers'

let weth: IWETH
let relayPool: RelayPool
let nativeGateway: RelayPoolNativeGateway
let relayPoolAddress: string
let thirdPartyPoolAddress: string

// Broken
describe('RelayPoolNativeGateway', () => {
  before(async () => {
    weth = await ethers.deployContract('MyWeth')
  })

  describe('when using the native token', () => {
    before(async () => {
      const [user] = await ethers.getSigners()
      const userAddress = await user.getAddress()
      // deploy 3rd party pool
      const thirdPartyPool = await ethers.deployContract('MyYieldPool', [
        await weth.getAddress(),
        'My Yield Pool',
        'YIELD',
      ])
      thirdPartyPoolAddress = await thirdPartyPool.getAddress()

      // deploy the WETH pool
      const parameters = {
        RelayPool: {
          asset: await weth.getAddress(),
          curator: userAddress,
          hyperlaneMailbox: userAddress, // Not used
          name: 'WETH RELAY POOL',
          symbol: 'WETH-REL',
          thirdPartyPool: thirdPartyPoolAddress,
          weth: await weth.getAddress(),
        },
      }
      ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
        parameters,
      }))
      relayPoolAddress = await relayPool.getAddress()

      // deploy native wrapper
      nativeGateway = await ethers.deployContract('RelayPoolNativeGateway', [
        await weth.getAddress(),
      ])
    })

    it('should let user initiate the pool by using the wrapped native token', async () => {
      expect(await relayPool.decimals()).to.equal(18)
      expect(await relayPool.name()).to.equal('WETH RELAY POOL')
      expect(await relayPool.symbol()).to.equal('WETH-REL')
      expect(await relayPool.asset()).to.equal(await weth.getAddress())
      expect(await relayPool.totalAssets()).to.equal(0)
      expect(await relayPool.totalSupply()).to.equal(0)
    })

    it('should let user deposit funds and receive shares', async () => {
      const [user] = await ethers.getSigners()
      const amount = ethers.parseUnits('1', 18)

      const userAddress = await user.getAddress()
      const totalAssets = await relayPool.totalAssets()
      const totalSupply = await relayPool.totalSupply()
      const sharesBalance = await relayPool.balanceOf(userAddress)
      const tokenBalance = await getBalance(
        await relayPool.getAddress(),
        await weth.getAddress(),
        ethers.provider
      )

      // Preview the deposit
      const newShares = await relayPool.previewDeposit(amount)
      expect(newShares).to.equal(ethers.parseUnits('1', 18)) // 1 for 1

      // Deposit tokens to the RelayPool via the gateway with slippage protection
      await nativeGateway
        .connect(user)
        .deposit(relayPoolAddress, userAddress, newShares, { value: amount })

      // Total assets should have increased
      expect(await relayPool.totalAssets()).to.equal(totalAssets + amount)
      // Total supply should have increased
      expect(await relayPool.totalSupply()).to.equal(totalSupply + newShares)
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares
      )
      // Balance of assets for the pool should be correct!
      expect(
        await getBalance(
          thirdPartyPoolAddress,
          await weth.getAddress(),
          ethers.provider
        )
      ).to.equal(tokenBalance + amount)
    })

    it('should revert deposit when slippage is exceeded', async () => {
      const [user] = await ethers.getSigners()
      const amount = ethers.parseUnits('1', 18)
      const userAddress = await user.getAddress()

      // Set minimum shares higher than expected output
      const minSharesOut = ethers.parseUnits('1.1', 18) // Expecting 1:1, so this should fail

      // Attempt deposit with too high minSharesOut
      await reverts(
        nativeGateway
          .connect(user)
          .deposit(relayPoolAddress, userAddress, minSharesOut, {
            value: amount,
          }),
        'SlippageExceeded()'
      )
    })

    it('should let user mint shares (by approving assets first)', async () => {
      const [user] = await ethers.getSigners()
      const newShares = ethers.parseUnits('1', 18)

      const userAddress = await user.getAddress()
      const totalAssets = await relayPool.totalAssets()
      const totalSupply = await relayPool.totalSupply()
      const sharesBalance = await relayPool.balanceOf(userAddress)

      // Preview the mint
      const amount = await relayPool.previewMint(newShares)
      expect(amount).to.equal(ethers.parseUnits('1', 18)) // 1 for 1!

      // Mint shares with slippage protection
      await nativeGateway
        .connect(user)
        .mint(relayPoolAddress, userAddress, newShares, { value: amount })

      // Total assets should have increased
      expect(await relayPool.totalAssets()).to.equal(totalAssets + amount)
      // Total supply should have increased
      expect(await relayPool.totalSupply()).to.equal(totalSupply + newShares)
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares
      )
      // Balance of assets for the pool should be correct!
      expect(await weth.balanceOf(thirdPartyPoolAddress)).to.equal(
        totalAssets + amount
      )
    })

    it('should revert mint when slippage is exceeded', async () => {
      const [user] = await ethers.getSigners()
      const amount = ethers.parseUnits('1', 18)
      const userAddress = await user.getAddress()

      // Set minimum shares higher than expected output
      const minSharesOut = ethers.parseUnits('1.1', 18) // Expecting 1:1, so this should fail

      // Attempt mint with too high minSharesOut
      await reverts(
        nativeGateway
          .connect(user)
          .mint(relayPoolAddress, userAddress, minSharesOut, { value: amount }),
        'SlippageExceeded()'
      )
    })

    it('should let user redeem shares they received after a deposit', async () => {
      const [, secondUser] = await ethers.getSigners()
      const amount = ethers.parseUnits('1', 18)
      const userAddress = await secondUser.getAddress()
      const totalAssets = await relayPool.totalAssets()
      const totalSupply = await relayPool.totalSupply()
      const sharesBalance = await relayPool.balanceOf(userAddress)

      // Preview the deposit
      const newShares = await relayPool.previewDeposit(amount)
      expect(newShares).to.equal(ethers.parseUnits('1', 18)) // 1 for 1

      // Deposit tokens to the RelayPool
      await nativeGateway
        .connect(secondUser)
        .deposit(relayPoolAddress, userAddress, newShares, { value: amount })

      // Total assets should have increased
      expect(await relayPool.totalAssets()).to.equal(totalAssets + amount)
      // Total supply should have increased
      expect(await relayPool.totalSupply()).to.equal(totalSupply + newShares)
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares
      )

      // Burn shares (only half!)
      const sharesToBurn = ethers.parseUnits('0.5', 18)
      // Preview the redeem
      const assetsToReceive = await relayPool.previewRedeem(sharesToBurn)
      expect(assetsToReceive).to.equal(ethers.parseUnits('0.5', 18))

      // Approve shares to be withdraw by the Gateway
      await relayPool
        .connect(secondUser)
        .approve(await nativeGateway.getAddress(), amount)

      // redeem with slippage protection
      await nativeGateway
        .connect(secondUser)
        .redeem(relayPoolAddress, sharesToBurn, userAddress, assetsToReceive)

      // Total assets should have decreased
      expect(await relayPool.totalAssets()).to.equal(
        totalAssets + amount - assetsToReceive
      )
      // Total supply should have decreased
      expect(await relayPool.totalSupply()).to.equal(
        totalSupply + newShares - sharesToBurn
      )
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares - sharesToBurn
      )
    })

    it('should revert redeem when slippage is exceeded', async () => {
      const [, secondUser] = await ethers.getSigners()
      const amount = ethers.parseUnits('1', 18)
      const userAddress = await secondUser.getAddress()

      // Deposit first
      const newShares = await relayPool.previewDeposit(amount)
      await nativeGateway
        .connect(secondUser)
        .deposit(relayPoolAddress, userAddress, newShares, { value: amount })

      // Approve shares
      await relayPool
        .connect(secondUser)
        .approve(await nativeGateway.getAddress(), amount)

      const sharesToBurn = ethers.parseUnits('0.5', 18)
      // Set minimum assets higher than expected output
      const minAssetsOut = ethers.parseUnits('0.6', 18) // Expecting 0.5, so this should fail

      // Attempt redeem with too high minAssetsOut
      await reverts(
        nativeGateway
          .connect(secondUser)
          .redeem(relayPoolAddress, sharesToBurn, userAddress, minAssetsOut),
        'SlippageExceeded()'
      )
    })

    it('should let user redeem shares they minted', async () => {
      const [, secondUser] = await ethers.getSigners()
      const userAddress = await secondUser.getAddress()
      const totalAssets = await relayPool.totalAssets()
      const totalSupply = await relayPool.totalSupply()
      const sharesBalance = await relayPool.balanceOf(userAddress)

      const newShares = ethers.parseUnits('0.4', 18)

      // Preview the mint
      const amount = await relayPool.previewMint(newShares)
      expect(amount).to.equal(ethers.parseUnits('0.4', 18)) // 1 for 1

      // Deposit tokens to the RelayPool
      await nativeGateway
        .connect(secondUser)
        .mint(relayPoolAddress, userAddress, ethers.parseUnits('0.4', 18), {
          value: amount,
        })

      // Total assets should have increased
      expect(await relayPool.totalAssets()).to.equal(totalAssets + amount)
      // Total supply should have increased
      expect(await relayPool.totalSupply()).to.equal(totalSupply + newShares)
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares
      )

      // Burn shares (half of them!)
      const sharesToBurn = ethers.parseUnits('0.2', 18)

      // Preview the redeem
      const assetsToReceive = await relayPool.previewRedeem(sharesToBurn)
      expect(assetsToReceive).to.equal(ethers.parseUnits('0.2', 18))

      // Approve shares to be withdraw by the Gateway
      await (
        await relayPool
          .connect(secondUser)
          .approve(await nativeGateway.getAddress(), assetsToReceive)
      ).wait()

      await nativeGateway
        .connect(secondUser)
        .redeem(
          relayPoolAddress,
          sharesToBurn,
          userAddress,
          ethers.parseUnits('0.2', 18)
        )

      // Total assets should have increased
      expect(await relayPool.totalAssets()).to.equal(
        totalAssets + amount - assetsToReceive
      )
      // Total supply should have increased
      expect(await relayPool.totalSupply()).to.equal(
        totalSupply + newShares - sharesToBurn
      )
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares - sharesToBurn
      )
    })

    it('should let user withdraw assets they deposited', async () => {
      const [, secondUser] = await ethers.getSigners()
      const amount = ethers.parseUnits('1', 18)
      const userAddress = await secondUser.getAddress()
      const totalAssets = await relayPool.totalAssets()
      const totalSupply = await relayPool.totalSupply()
      const sharesBalance = await relayPool.balanceOf(userAddress)

      // Preview the deposit
      const newShares = await relayPool.previewDeposit(amount)
      expect(newShares).to.equal(ethers.parseUnits('1', 18)) // 1 for 1

      // Deposit tokens to the RelayPool
      await nativeGateway
        .connect(secondUser)
        .deposit(relayPoolAddress, userAddress, newShares, { value: amount })

      // Total assets should have increased
      expect(await relayPool.totalAssets()).to.equal(totalAssets + amount)
      // Total supply should have increased
      expect(await relayPool.totalSupply()).to.equal(totalSupply + newShares)
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares
      )

      const assetsToReceive = ethers.parseUnits('0.5', 18)

      // Preview the withdrawal
      const sharesToBeBurnt = await relayPool.previewWithdraw(assetsToReceive)
      expect(sharesToBeBurnt).to.equal(ethers.parseUnits('0.5', 18))

      // Approve shares to be withdraw by the Gateway
      await relayPool
        .connect(secondUser)
        .approve(await nativeGateway.getAddress(), amount)

      // withdraw with slippage protection
      await nativeGateway
        .connect(secondUser)
        .withdraw(
          relayPoolAddress,
          assetsToReceive,
          userAddress,
          sharesToBeBurnt
        )

      expect(await relayPool.totalAssets()).to.equal(
        totalAssets + amount - assetsToReceive
      )
      expect(await relayPool.totalSupply()).to.equal(
        totalSupply + newShares - sharesToBeBurnt
      )
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares - sharesToBeBurnt
      )
    })

    it('should revert withdraw when slippage is exceeded', async () => {
      const [, secondUser] = await ethers.getSigners()
      const amount = ethers.parseUnits('1', 18)
      const userAddress = await secondUser.getAddress()

      // Deposit first
      const newShares = await relayPool.previewDeposit(amount)
      await nativeGateway
        .connect(secondUser)
        .deposit(relayPoolAddress, userAddress, newShares, { value: amount })

      // Approve shares
      await relayPool
        .connect(secondUser)
        .approve(await nativeGateway.getAddress(), amount)

      const assetsToReceive = ethers.parseUnits('0.5', 18)
      // Set maximum shares lower than required
      const maxSharesIn = ethers.parseUnits('0.4', 18) // Expecting 0.5, so this should fail

      // Attempt withdraw with too low maxSharesIn
      await reverts(
        nativeGateway
          .connect(secondUser)
          .withdraw(
            relayPoolAddress,
            assetsToReceive,
            userAddress,
            maxSharesIn
          ),
        'SlippageExceeded()'
      )
    })

    it('should let user withdraw assets they deposited thru a mint', async () => {
      const [, secondUser] = await ethers.getSigners()
      const userAddress = await secondUser.getAddress()
      const totalAssets = await relayPool.totalAssets()
      const totalSupply = await relayPool.totalSupply()
      const sharesBalance = await relayPool.balanceOf(userAddress)

      const newShares = ethers.parseUnits('0.4', 18)

      // Preview the mint
      const amount = await relayPool.previewMint(newShares)
      expect(amount).to.equal(ethers.parseUnits('0.4', 18)) // 1 for 1

      // Deposit tokens to the RelayPool
      await nativeGateway
        .connect(secondUser)
        .mint(relayPoolAddress, userAddress, ethers.parseUnits('0.4', 18), {
          value: amount,
        })

      // Total assets should have increased
      expect(await relayPool.totalAssets()).to.equal(totalAssets + amount)
      // Total supply should have increased
      expect(await relayPool.totalSupply()).to.equal(totalSupply + newShares)
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares
      )

      const assetsToReceive = ethers.parseUnits('0.1', 18)

      // Preview the withdrawal
      const sharesToBeBurnt = await relayPool.previewWithdraw(assetsToReceive)

      expect(sharesToBeBurnt).to.equal(ethers.parseUnits('0.1', 18))

      // Approve shares to be withdraw by the Gateway
      await (
        await relayPool
          .connect(secondUser)
          .approve(await nativeGateway.getAddress(), amount)
      ).wait()

      await nativeGateway
        .connect(secondUser)
        .withdraw(
          relayPoolAddress,
          assetsToReceive,
          userAddress,
          ethers.parseUnits('0.1', 18)
        )

      expect(await relayPool.totalAssets()).to.equal(
        totalAssets + amount - assetsToReceive
      )
      expect(await relayPool.totalSupply()).to.equal(
        totalSupply + newShares - sharesToBeBurnt
      )
      // Balance of shares for user should be correct
      expect(await relayPool.balanceOf(userAddress)).to.equal(
        sharesBalance + newShares - sharesToBeBurnt
      )
    })

    it('should reject new assets being added to the pool through receive', async () => {
      const [user] = await ethers.getSigners()

      // send native tokens to the gateway
      await reverts(
        user.sendTransaction({
          to: await nativeGateway.getAddress(),
          value: ethers.parseUnits('1', 18),
        }),
        'OnlyWethCanSendEth()'
      )
    })

    it('should not allow any balance to get locked in the contract', async () => {
      const [, secondUser] = await ethers.getSigners()
      const userAddress = await secondUser.getAddress()

      const amount = ethers.parseUnits('1', 18)

      // Deposit tokens to the RelayPool
      await nativeGateway
        .connect(secondUser)
        .mint(relayPoolAddress, userAddress, amount, { value: amount })

      // redeem the shares
      const shares = await relayPool.balanceOf(userAddress)
      await (
        await relayPool
          .connect(secondUser)
          .approve(await nativeGateway.getAddress(), shares)
      ).wait()
      await nativeGateway
        .connect(secondUser)
        .redeem(relayPoolAddress, shares, userAddress, amount)

      expect(await weth.balanceOf(await nativeGateway.getAddress())).to.equal(0)
    })

    it('should make sure assets deposited directly dont break redeem', async () => {
      const [, secondUser] = await ethers.getSigners()
      const userAddress = await secondUser.getAddress()
      const amount = ethers.parseUnits('0.1', 18)
      const initAmount = ethers.parseUnits('0.0001', 18)

      const getGatewayBalance = async () =>
        await getBalance(
          await nativeGateway.getAddress(),
          ZeroAddress,
          ethers.provider
        )

      // send funds to gateway contract
      await ethers.deployContract(
        'SelfDestructible',
        [await nativeGateway.getAddress()],
        {
          value: initAmount,
        }
      )
      const initBalance = await getGatewayBalance()
      expect(initBalance).to.equal(initAmount)

      // Deposit tokens to the RelayPool
      await nativeGateway
        .connect(secondUser)
        .mint(relayPoolAddress, userAddress, amount, { value: amount })

      // redeem the shares
      const shares = await relayPool.balanceOf(userAddress)
      await (
        await relayPool
          .connect(secondUser)
          .approve(await nativeGateway.getAddress(), shares)
      ).wait()
      await nativeGateway
        .connect(secondUser)
        .redeem(relayPoolAddress, shares, userAddress, amount)
      expect(await getGatewayBalance()).to.equal(initAmount)
    })
  })
})
