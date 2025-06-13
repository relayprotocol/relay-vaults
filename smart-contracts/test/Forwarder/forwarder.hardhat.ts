import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { Forwarder, MockSafe, MockTarget } from '../../typechain-types'

describe('Forwarder', function () {
  let forwarder: Forwarder
  let mockSafe: MockSafe
  let mockTarget: MockTarget
  let testData: string
  let owner1: SignerWithAddress
  let owner2: SignerWithAddress
  let owner3: SignerWithAddress
  let attacker: SignerWithAddress

  before(async function () {
    ;[owner1, owner2, owner3, attacker] = await ethers.getSigners()

    // Deploy mock SAFE contract with multiple owners
    const MockSafe = await ethers.getContractFactory('MockSafe')
    mockSafe = await MockSafe.deploy([
      owner1.address,
      owner2.address,
      owner3.address,
    ])
    await mockSafe.waitForDeployment()

    // Deploy forwarder contract
    const Forwarder = await ethers.getContractFactory('Forwarder')
    forwarder = await Forwarder.deploy(await mockSafe.getAddress())
    await forwarder.waitForDeployment()

    // Deploy mock target contract
    const MockTarget = await ethers.getContractFactory('MockTarget')
    mockTarget = await MockTarget.deploy()
    await mockTarget.waitForDeployment()

    testData = mockTarget.interface.encodeFunctionData('receiveCall', [
      '0x12345678',
    ])
  })

  describe('Initialization', function () {
    it('should set the correct SAFE address', async function () {
      expect(await forwarder.safeAddress()).to.equal(
        await mockSafe.getAddress()
      )
    })
  })

  describe('Forwarding', function () {
    const testValue = ethers.parseEther('1')

    it('should forward calls from any SAFE owner', async function () {
      const targetBalanceBefore = await ethers.provider.getBalance(
        await mockTarget.getAddress()
      )

      // Test forwarding from owner1
      await forwarder
        .connect(owner1)
        .forward(await mockTarget.getAddress(), testData, testValue, {
          value: testValue,
        })

      // Test forwarding from owner2
      await forwarder
        .connect(owner2)
        .forward(await mockTarget.getAddress(), testData, testValue, {
          value: testValue,
        })

      const targetBalanceAfter = await ethers.provider.getBalance(
        await mockTarget.getAddress()
      )
      expect(targetBalanceAfter - targetBalanceBefore).to.equal(testValue * 2n)
    })

    it('should execute forwarded calls correctly', async function () {
      const callData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string'],
        ['test']
      )

      // Forward a call to receiveCall
      const tx = await forwarder
        .connect(owner1)
        .forward(
          await mockTarget.getAddress(),
          mockTarget.interface.encodeFunctionData('receiveCall', [callData]),
          testValue,
          { value: testValue }
        )

      // Verify the call was executed correctly
      await expect(tx)
        .to.emit(mockTarget, 'CallReceived')
        .withArgs(await forwarder.getAddress(), callData, testValue)
    })

    it('should handle failed forwarded calls', async function () {
      // Forward a call to failCall
      await expect(
        forwarder
          .connect(owner1)
          .forward(
            await mockTarget.getAddress(),
            mockTarget.interface.encodeFunctionData('failCall'),
            testValue,
            { value: testValue }
          )
      ).to.be.revertedWithCustomError(forwarder, 'ForwardFailed')
    })

    it('should revert if caller is not a SAFE owner', async function () {
      await expect(
        forwarder
          .connect(attacker)
          .forward(await mockTarget.getAddress(), testData, testValue, {
            value: testValue,
          })
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
        forwarder
          .connect(owner1)
          .forward(await mockTarget.getAddress(), testData, testValue, {
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
        .forward(await mockTarget.getAddress(), testData, testValue, {
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

    it('should emit Forwarded event when called', async function () {
      // Test event emission for owner1
      const tx1 = await forwarder
        .connect(owner1)
        .forward(await mockTarget.getAddress(), testData, testValue, {
          value: testValue,
        })

      await expect(tx1)
        .to.emit(forwarder, 'Forwarded')
        .withArgs(await mockTarget.getAddress(), testData, testValue)
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
