import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'

import { getBalance } from '@relay-protocol/helpers'

import { Log } from 'ethers'

import { networks } from '@relay-protocol/networks'
import RelayBridgeModule from '../../ignition/modules/RelayBridgeModule'
import { MyWeth, RelayBridge } from '../../typechain-types'

const { hyperlaneMailbox: HYPERLANE_MAILBOX_ON_OPTIMISM } = networks[10]

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'
const l1Gas = '500000'

// This runs in an OP fork because we need Hyperlane to work, but we don't actually use the OPStack native bridge.
describe('RelayBridge', function () {
  let bridge: RelayBridge
  let bridgeProxyAddress: string

  describe('with ETH', () => {
    before(async () => {
      const bridgeProxy = await ethers.deployContract('FakeBridgeProxy', [
        1,
        relayPool,
        l1BridgeProxy,
      ])

      bridgeProxyAddress = await bridgeProxy.getAddress()

      const parameters = {
        RelayBridge: {
          asset: ethers.ZeroAddress,
          bridgeProxy: bridgeProxyAddress,
          hyperlaneMailbox: HYPERLANE_MAILBOX_ON_OPTIMISM,
        },
      }
      const deployment = await ignition.deploy(RelayBridgeModule, {
        parameters,
      })
      bridge = deployment.bridge
    })

    it('should work for the base sequence using ETH', async () => {
      const [user] = await ethers.getSigners()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const nonce = await bridge.transferNonce()
      const balanceBefore = await getBalance(recipient, ethers.provider)
      const fee = await bridge.getFee(amount, recipient, l1Gas)
      const tx = await bridge.bridge(
        amount,
        recipient,
        ethers.ZeroAddress,
        l1Gas,
        {
          value: amount + fee,
        }
      )
      const receipt = await tx.wait()

      const bridgeAddress = await bridge.getAddress()
      expect(receipt.logs.length).to.equal(5)
      receipt.logs.forEach((log: Log) => {
        expect(log.address).to.be.oneOf([
          bridgeAddress,
          HYPERLANE_MAILBOX_ON_OPTIMISM,
          '0x68eE9bec9B4dbB61f69D9D293Ae26a5AACb2e28f', // Merkle Tree Hook https://docs.hyperlane.xyz/docs/reference/contract-addresses#merkle-tree-hook
          '0xD8A76C4D91fCbB7Cc8eA795DFDF870E48368995C', // Interchain Gas Paymaster https://docs.hyperlane.xyz/docs/reference/contract-addresses#interchain-gas-paymaster-hook
        ])
        if (log.address === bridgeAddress) {
          const event = bridge.interface.parseLog(log)
          expect(event.name).to.equal('BridgeInitiated')
          expect(event.args[0]).to.equal(nonce)
          expect(event.args[1]).to.equal(recipient)
          expect(event.args[2]).to.equal(recipient)
          expect(event.args[3]).to.equal(ethers.ZeroAddress)
          expect(event.args[4]).to.equal(ethers.ZeroAddress)
          expect(event.args[5]).to.equal(amount)
          expect(event.args[6]).to.equal(bridgeProxyAddress)
        }
      })

      const balanceAfter = await getBalance(recipient, ethers.provider)

      expect(balanceAfter).to.be.equal(
        balanceBefore - amount - fee - receipt!.gasUsed * receipt!.gasPrice
      )
    })

    it('should fail if the msg.value does not match the amount for an ETH bridge', async () => {
      const [user] = await ethers.getSigners()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const fee = await bridge.getFee(amount, recipient, l1Gas)

      await expect(
        bridge.bridge(amount, recipient, ethers.ZeroAddress, l1Gas, {
          value: amount / 2n,
        })
      )
        .to.be.revertedWithCustomError(bridge, 'InsufficientValue')
        .withArgs(amount / 2n, amount + fee)
    })

    it('should fail if the bridgeProxy fails', async () => {
      const [user] = await ethers.getSigners()
      const recipient = await user.getAddress()
      const amount = 13371337133713371337n

      const fee = await bridge.getFee(amount, recipient, l1Gas)
      const wethAddressOnL1 = ethers.ZeroAddress

      await expect(
        bridge.bridge(amount, recipient, wethAddressOnL1, l1Gas, {
          value: amount + fee,
        })
      ).to.be.revertedWithCustomError(bridge, 'BridgingFailed')
    })

    it('should refund the extra value sent', async () => {
      const [user] = await ethers.getSigners()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const balanceBefore = await getBalance(recipient, ethers.provider)
      const fee = await bridge.getFee(amount, recipient, l1Gas)

      const value = (amount + fee) * 10n
      const expectedBalanceAfter = balanceBefore - value

      await bridge.bridge(amount, recipient, ethers.ZeroAddress, l1Gas, {
        value,
      })

      const balanceOfEthAfter = await getBalance(recipient, ethers.provider)

      expect(balanceOfEthAfter).to.be.greaterThan(expectedBalanceAfter)
    })
  })

  describe('with an ERC20', () => {
    let weth: MyWeth

    before(async () => {
      const bridgeProxy = await ethers.deployContract('FakeBridgeProxy', [
        1,
        relayPool,
        l1BridgeProxy,
      ])

      bridgeProxyAddress = await bridgeProxy.getAddress()
      weth = await ethers.deployContract('MyWeth')
      await weth.deposit({ value: ethers.parseEther('3') })

      const parameters = {
        RelayBridge: {
          asset: await weth.getAddress(),
          bridgeProxy: bridgeProxyAddress,
          hyperlaneMailbox: HYPERLANE_MAILBOX_ON_OPTIMISM,
        },
      }
      const deployment = await ignition.deploy(RelayBridgeModule, {
        parameters,
      })
      bridge = deployment.bridge
    })

    it('should work for the base sequence using an ERC20', async () => {
      const [user] = await ethers.getSigners()
      const bridgeAddress = await bridge.getAddress()
      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')

      // Approve
      await weth.approve(bridgeAddress, amount)

      const nonce = await bridge.transferNonce()
      const balanceBefore = await weth.balanceOf(recipient)

      const fee = await bridge.getFee(amount, recipient, l1Gas)
      const wethAddress = await weth.getAddress()
      const wethAddressOnL1 = ethers.ZeroAddress

      const tx = await bridge.bridge(
        amount,
        recipient,
        wethAddressOnL1,
        l1Gas,
        {
          value: fee,
        }
      )
      const receipt = await tx.wait()

      expect(receipt.logs.length).to.equal(6)
      receipt.logs.forEach((log: Log) => {
        expect(log.address).to.be.oneOf([
          wethAddress,
          bridgeAddress,
          HYPERLANE_MAILBOX_ON_OPTIMISM,
          '0x68eE9bec9B4dbB61f69D9D293Ae26a5AACb2e28f', // Merkle Tree Hook https://docs.hyperlane.xyz/docs/reference/contract-addresses#merkle-tree-hook
          '0xD8A76C4D91fCbB7Cc8eA795DFDF870E48368995C', // Interchain Gas Paymaster https://docs.hyperlane.xyz/docs/reference/contract-addresses#interchain-gas-paymaster-hook
        ])
        if (log.address === wethAddress) {
          const event = weth.interface.parseLog(log)
          expect(event.name).to.equal('Transfer')
          expect(event.args[0]).to.equal(recipient)
          expect(event.args[1]).to.equal(bridgeAddress)
          expect(event.args[2]).to.equal(amount)
        } else if (log.address === bridgeAddress) {
          const event = bridge.interface.parseLog(log)
          expect(event.name).to.equal('BridgeInitiated')
          expect(event.args[0]).to.equal(nonce)
          expect(event.args[1]).to.equal(recipient)
          expect(event.args[2]).to.equal(recipient)
          expect(event.args[3]).to.equal(wethAddress)
          expect(event.args[4]).to.equal(wethAddressOnL1)
          expect(event.args[5]).to.equal(amount)
          expect(event.args[6]).to.equal(bridgeProxyAddress)
        }
      })

      // make sure excess value refund has been issued
      expect(await weth.balanceOf(recipient)).to.be.equal(
        balanceBefore - amount
      )
    })

    it('should fail if the user has not approved the ERC20 bridge with the right amount', async () => {
      const [user] = await ethers.getSigners()
      const bridgeAddress = await bridge.getAddress()
      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')

      // Approve
      await weth.approve(bridgeAddress, amount / 2n)

      const fee = await bridge.getFee(amount, recipient, l1Gas)
      const wethAddressOnL1 = ethers.ZeroAddress

      await expect(
        bridge.bridge(amount, recipient, wethAddressOnL1, l1Gas, {
          value: fee / 2n,
        })
      ).to.be.reverted
    })

    it('should fail if the msg.value does not match the amount for an ERC20 bridge', async () => {
      const [user] = await ethers.getSigners()
      const bridgeAddress = await bridge.getAddress()
      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')

      // Approve
      await weth.approve(bridgeAddress, amount)

      const fee = await bridge.getFee(amount, recipient, l1Gas)
      const wethAddressOnL1 = ethers.ZeroAddress

      await expect(
        bridge.bridge(amount, recipient, wethAddressOnL1, l1Gas, {
          value: fee / 2n,
        })
      )
        .to.be.revertedWithCustomError(bridge, 'InsufficientValue')
        .withArgs(fee / 2n, fee)
    })

    it('should fail if the bridgeProxy fails', async () => {
      const [user] = await ethers.getSigners()
      const bridgeAddress = await bridge.getAddress()
      const recipient = await user.getAddress()
      const amount = 13371337133713371337n
      await weth.deposit({ value: amount })

      // Approve
      await weth.approve(bridgeAddress, amount)

      const fee = await bridge.getFee(amount, recipient, l1Gas)
      const wethAddressOnL1 = ethers.ZeroAddress

      await expect(
        bridge.bridge(amount, recipient, wethAddressOnL1, l1Gas, {
          value: fee,
        })
      ).to.be.revertedWithCustomError(bridge, 'BridgingFailed')
    })

    it('should refund the extra value sent', async () => {
      const [user] = await ethers.getSigners()
      const bridgeAddress = await bridge.getAddress()
      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const balanceOfEthBefore = await getBalance(recipient, ethers.provider)

      // Approve
      await weth.approve(bridgeAddress, amount)

      const fee = await bridge.getFee(amount, recipient, l1Gas)
      const wethAddressOnL1 = ethers.ZeroAddress
      const value = fee * 10n
      const expectedBalanceAfter = balanceOfEthBefore - value
      await bridge.bridge(amount, recipient, wethAddressOnL1, l1Gas, {
        value,
      })

      const balanceOfEthAfter = await getBalance(recipient, ethers.provider)

      expect(balanceOfEthAfter).to.be.greaterThan(expectedBalanceAfter)
    })
  })
})
