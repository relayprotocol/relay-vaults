import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { Forwarder } from '../../typechain-types'
import { deployContract, deployMockSafe } from '../utils/deploy'
import { BaseContract } from 'ethers'

interface MockSafe {
  owner(): Promise<string>
  isOwner(account: string): Promise<boolean>
  getAddress(): Promise<string>
}

async function deployContract<T extends BaseContract>(
  name: string,
  args: any[] = []
): Promise<T> {
  const Contract = await ethers.getContractFactory(name)
  const contract = await Contract.deploy(...args)
  await contract.waitForDeployment()
  return contract as unknown as T
}

async function deployMockSafe(owners: string[]): Promise<BaseContract> {
  const MockSafe = await ethers.getContractFactory('MockSafe')
  const mockSafe = await MockSafe.deploy(owners)
  await mockSafe.waitForDeployment()
  return mockSafe
}

describe('Forwarder', function () {
  let forwarder: Forwarder
  let mockSafe: MockSafe
  let owner1: SignerWithAddress
  let owner2: SignerWithAddress
  let owner3: SignerWithAddress
  let user: SignerWithAddress
  let target: SignerWithAddress

  before(async function () {
    ;[owner1, owner2, owner3, user, target] = await ethers.getSigners()

    // Deploy mock SAFE contract with multiple owners
    mockSafe = (await deployMockSafe([
      owner1.address,
      owner2.address,
      owner3.address,
    ])) as unknown as MockSafe

    // Deploy forwarder contract
    forwarder = await deployContract<Forwarder>('Forwarder', [
      await mockSafe.getAddress(),
    ])
  })

  describe('Initialization', function () {
    it('should set the correct SAFE address', async function () {
      expect(await forwarder.safeAddress()).to.equal(
        await mockSafe.getAddress()
      )
    })

    it('should set the owner correctly', async function () {
      expect(await forwarder.owner()).to.equal(await mockSafe.getAddress())
    })
  })

  describe('Forwarding', function () {
    const testData = '0x12345678'
    const testValue = ethers.parseEther('1')

    it('should forward calls from any SAFE owner', async function () {
      const targetBalanceBefore = await ethers.provider.getBalance(
        target.address
      )

      // Test forwarding from owner1
      await forwarder
        .connect(owner1)
        .forward(target.address, testData, testValue, { value: testValue })

      // Test forwarding from owner2
      await forwarder
        .connect(owner2)
        .forward(target.address, testData, testValue, { value: testValue })

      // Test forwarding from owner3
      await forwarder
        .connect(owner3)
        .forward(target.address, testData, testValue, { value: testValue })

      const targetBalanceAfter = await ethers.provider.getBalance(
        target.address
      )
      expect(targetBalanceAfter - targetBalanceBefore).to.equal(testValue * 3n)
    })

    it('should revert if caller is not a SAFE owner', async function () {
      await expect(
        forwarder
          .connect(user)
          .forward(target.address, testData, testValue, { value: testValue })
      ).to.be.revertedWithCustomError(forwarder, 'NotMultisigOwner')
    })

    it('should revert if target address is zero', async function () {
      await expect(
        forwarder
          .connect(owner1)
          .forward(ethers.ZeroAddress, testData, testValue, {
            value: testValue,
          })
      ).to.be.revertedWithCustomError(forwarder, 'InvalidTargetAddress')
    })

    it('should revert if insufficient value sent', async function () {
      await expect(
        forwarder.connect(owner1).forward(target.address, testData, testValue, {
          value: testValue - 1n,
        })
      ).to.be.revertedWithCustomError(forwarder, 'InsufficientValueSent')
    })

    it('should refund excess value', async function () {
      const excessValue = ethers.parseEther('0.5')
      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner1.address
      )

      const tx = await forwarder
        .connect(owner1)
        .forward(target.address, testData, testValue, {
          value: testValue + excessValue,
        })

      const receipt = await tx.wait()
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice

      const ownerBalanceAfter = await ethers.provider.getBalance(owner1.address)
      // Account for exact gas costs
      expect(ownerBalanceAfter).to.equal(
        ownerBalanceBefore - testValue - gasUsed
      )
    })

    it('should emit Forwarded event for each owner', async function () {
      // Test event emission for owner1
      const tx1 = await forwarder
        .connect(owner1)
        .forward(target.address, testData, testValue, { value: testValue })

      await expect(tx1)
        .to.emit(forwarder, 'Forwarded')
        .withArgs(target.address, testData, testValue)

      // Test event emission for owner2
      const tx2 = await forwarder
        .connect(owner2)
        .forward(target.address, testData, testValue, { value: testValue })

      await expect(tx2)
        .to.emit(forwarder, 'Forwarded')
        .withArgs(target.address, testData, testValue)

      // Test event emission for owner3
      const tx3 = await forwarder
        .connect(owner3)
        .forward(target.address, testData, testValue, { value: testValue })

      await expect(tx3)
        .to.emit(forwarder, 'Forwarded')
        .withArgs(target.address, testData, testValue)
    })
  })

  describe('Receive function', function () {
    it('should accept ETH', async function () {
      const value = ethers.parseEther('1')
      await expect(
        owner1.sendTransaction({
          to: await forwarder.getAddress(),
          value: value,
        })
      ).to.not.be.reverted
    })
  })
})
