import { expect } from 'chai'
import { ethers } from 'hardhat'
import { DrainableVault, IWETH } from '../../typechain-types'

import { impersonate } from '../utils/hardhat'

describe.only('RelayBridge: drainable vault', () => {
  let drainableVault: DrainableVault
  let userAddress: string
  let weth: IWETH
  before(async () => {
    const [user] = await ethers.getSigners()
    userAddress = await user.getAddress()
    const poolAddress = '0x19426e122E0988e1f6ad246Af9B6553492C6D446'
    const drainableVaultAddress = '0x617a7cF939F4Ba469b7822a4578A15C232F43b43'
    const pool = await ethers.getContractAt('RelayPool', poolAddress)
    const wethAddress = await pool.asset()
    weth = await ethers.getContractAt('IWETH', wethAddress)

    // Deploy drainable vault
    drainableVault = await ethers.getContractAt(
      'DrainableVault',
      drainableVaultAddress
    )

    // Make a deposit to avoid inflation attack!
    const drainableDepositAmount = ethers.parseEther('0.01')
    expect(await weth.balanceOf(drainableVaultAddress)).to.equal(
      drainableDepositAmount
    )

    // Impersonate the timelock and change the yield pool address
    const timelockAddress = await pool.owner()
    const signer = await impersonate(timelockAddress)
    await pool.connect(signer).updateYieldPool(
      drainableVaultAddress,
      0, // minSharePriceFromOldPool - setting to 0 to accept any price
      ethers.MaxUint256 // maxSharePricePriceFromNewPool - setting high to accept any price
    )

    // At this point, the drainable vault should have received the assets from the RelayPool
    expect(await weth.balanceOf(drainableVaultAddress)).to.be.greaterThan(
      drainableDepositAmount
    )
  })

  it('should not let a random user drain the vault', async () => {
    const [, another] = await ethers.getSigners()
    await expect(drainableVault.connect(another).drain(userAddress)).to.be
      .reverted
  })

  it('should let the user pool from the drainable vault', async () => {
    const drainableVaultAddress = await drainableVault.getAddress()
    const wethBalanceInDrainableVault = await weth.balanceOf(
      drainableVaultAddress
    )
    const ownerAddress = await drainableVault.owner()
    const owner = await impersonate(ownerAddress)

    expect(await weth.balanceOf(userAddress)).to.equal(0n)
    await drainableVault.connect(owner).drain(userAddress)

    // The user has WETH
    expect(await weth.balanceOf(userAddress)).to.equal(
      wethBalanceInDrainableVault
    )
    // The drainable vault is empty
    expect(await weth.balanceOf(drainableVaultAddress)).to.equal(0)
  })
})
