import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'

import { getBalance, getEvent } from '@relay-protocol/helpers'

import { Mailbox } from '@relay-protocol/helpers/abis'
import { Log } from 'ethers'

import { networks } from '@relay-protocol/networks'
import RelayBridgeModule from '../../ignition/modules/RelayBridgeModule'
import { RelayBridge } from '../../typechain-types'

const { hyperlaneMailbox: HYPERLANE_MAILBOX_ON_OPTIMISM } = networks[10]

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

// This runs in an OP fork because we need Hyperlane to work, but we don't actually use the OPStack native bridge.
describe.only('RelayBridge', function () {
  let bridge: RelayBridge
  let bridgeProxyAddress: string
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

  describe('bridge', () => {
    it('should work for the base sequence using ETH', async () => {
      const [user] = await ethers.getSigners()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const nonce = await bridge.transferNonce()
      const balanceBefore = await getBalance(recipient, ethers.provider)
      const tx = await bridge.bridge(amount, recipient, ethers.ZeroAddress, {
        value: amount,
      })
      const receipt = await tx.wait()

      expect(receipt.logs.length).to.equal(1)
      const transaction = await bridge.transactions(nonce)

      expect(transaction.nonce).to.equal(nonce)
      expect(transaction.sender).to.equal(recipient)
      expect(transaction.recipient).to.equal(recipient)
      expect(transaction.asset).to.equal(ethers.ZeroAddress)
      expect(transaction.l1Asset).to.equal(ethers.ZeroAddress)
      expect(transaction.amount).to.equal(amount)
      const blockNumber = await ethers.provider.getBlockNumber()
      const block = await ethers.provider.getBlock(blockNumber)
      expect(Number(transaction.timestamp)).to.be.equal(block!.timestamp)
      const encoder = new ethers.AbiCoder()
      expect(transaction.data).to.equal(
        encoder.encode(
          ['uint256', 'address', 'uint256', 'uint256'],
          [nonce, recipient, amount, block!.timestamp]
        )
      )
      expect(transaction.status).to.equal(1) // Not sure how to encode Enums in Hardhat

      // make sure excess value refund has been issued
      expect(await getBalance(recipient, ethers.provider)).to.be.greaterThan(
        balanceBefore - amount * 2n
      )
    })

    it('should work for the base sequence using an ERC20', async () => {
      const [user] = await ethers.getSigners()
      const weth = await ethers.deployContract('MyWeth')
      await weth.deposit({ value: ethers.parseEther('3') })
      const wethAddress = await weth.getAddress()
      const bridge = await ethers.deployContract('RelayBridge', [
        await weth.getAddress(),
        bridgeProxyAddress,
        HYPERLANE_MAILBOX_ON_OPTIMISM,
      ])
      const bridgeAddress = await bridge.getAddress()
      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')

      // Approve
      await weth.approve(bridgeAddress, amount)

      const nonce = await bridge.transferNonce()
      const balanceBefore = await weth.balanceOf(recipient)

      const wethAddressOnL1 = ethers.ZeroAddress
      const tx = await bridge.bridge(amount, recipient, wethAddressOnL1)
      const receipt = await tx.wait()

      expect(receipt.logs.length).to.equal(2)
      receipt.logs.forEach((log: Log) => {
        expect(log.address).to.be.oneOf([wethAddress, bridgeAddress])
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

    it('should fail if the msg.value does not match the amount', async () => {
      const [user] = await ethers.getSigners()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      await expect(
        bridge.bridge(amount, recipient, ethers.ZeroAddress, {
          value: amount / 2n,
        })
      )
        .to.be.revertedWithCustomError(bridge, 'InsufficientValue')
        .withArgs(amount / 2n, amount)
    })
  })

  describe('executeBridge', () => {
    it('should fail of if the transaction is not in the correct state', async () => {
      await expect(bridge.executeBridge(1337))
        .to.be.revertedWithCustomError(bridge, 'UnexpectedTransactionState')
        .withArgs(1337, 0, 1)
    })

    it('should update the transaction state and emit the bridge executed event', async () => {
      const [user] = await ethers.getSigners()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const fee = await bridge.getFee(amount, recipient)

      const bridgeTx = await bridge.bridge(
        amount,
        recipient,
        ethers.ZeroAddress,
        {
          value: amount,
        }
      )
      await bridgeTx.wait()
      // Let's get the nonce!
      const nonce = await bridge.transferNonce()
      const transaction = await bridge.transactions(nonce - 1n)
      expect(transaction.status).to.equal(1)

      // Let's now issue the executeBridge
      const tx = await bridge.executeBridge(transaction.nonce, {
        value: fee,
      })
      const receipt = await tx.wait()
      const updatedTransaction = await bridge.transactions(transaction.nonce)
      expect(updatedTransaction.status).to.equal(2)
      const event = await getEvent(receipt, 'BridgeExecuted', bridge.interface)
      expect(event.args.nonce).to.equal(transaction.nonce)
    })

    it('should have called the native bridge to perform the transfer with native ETH', async () => {
      const [user] = await ethers.getSigners()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const bridgeAddress = await bridge.getAddress()
      const nonce = await bridge.transferNonce()
      const fee = await bridge.getFee(amount, recipient)

      await (
        await bridge.bridge(amount, recipient, ethers.ZeroAddress, {
          value: amount,
        })
      ).wait()
      await bridge.transactions(nonce)
      const bridgeExecutionTransaction = await bridge.executeBridge(nonce, {
        value: fee,
      })
      const receipt = (await bridgeExecutionTransaction.wait())!

      // Check the transaction obect
      expect(receipt.logs.length).to.equal(5)
      receipt.logs.forEach((log: Log) => {
        expect(log.address).to.be.oneOf([
          bridgeAddress,
          HYPERLANE_MAILBOX_ON_OPTIMISM,
          '0x68eE9bec9B4dbB61f69D9D293Ae26a5AACb2e28f', // Merkle Tree Hook https://docs.hyperlane.xyz/docs/reference/contract-addresses#merkle-tree-hook
          '0xD8A76C4D91fCbB7Cc8eA795DFDF870E48368995C', // Interchain Gas Paymaster https://docs.hyperlane.xyz/docs/reference/contract-addresses#interchain-gas-paymaster-hook
        ])
        if (log.address === HYPERLANE_MAILBOX_ON_OPTIMISM) {
          // L2ToL1MessagePasser
          const iface = new ethers.Interface(Mailbox)
          const event = iface.parseLog(log)

          expect(event.name).to.be.oneOf(['Dispatch', 'DispatchId'])
          if (event.name === 'Dispatch') {
            expect(event.name).to.equal('Dispatch')
            // sender
            expect(event.args[0]).to.equal(bridgeAddress)
            // destination
            expect(event.args[1]).to.equal(1) // Ethereum mainnet
            // recipient  https://docs.hyperlane.xyz/docs/reference/messaging/receive#handle
            const poolAddressPadded =
              '0x' +
              relayPool.replace(/^0x/, '').toLowerCase().padStart(64, '0')
            expect(event.args[2]).to.equal(poolAddressPadded)
            // message TODO: decode
            // expect(event.args[3]).to.equal(
            //   "0x030009ae080000000a000000000000000000000000114e375b6fcc6d6fcb68c7a1d407e652c54f25fb000000010000000000000000000000001bd1dc30f238541d4cab3ba0ab766e9eb57050eb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000de0b6b3a7640000"
            // );
          } else if (event.name === 'DispatchId') {
            expect(event.name).to.equal('DispatchId')
            // DispatchId
            // expect(event.args[0]).to.equal(
            //   "0x240ecaebb0f12af10b28a937771240b355dbc5e2c14fda63e2507ff4e9a598eb"
            // );
          }
        } else if (log.address === bridgeAddress) {
          const event = bridge.interface.parseLog(log)
          expect(event.name).to.equal('BridgeExecuted')
          expect(event.args[0]).to.equal(nonce)
        }
      })
    })

    it('should require the executeBridge transaction to be delayed from the bridge transaction', async () => {
      // We deploy a malicious contract that combibes bridge and executeBridge in a single transaction
      const malicious = await ethers.deployContract('MaliciousContract', [])
      const amount = ethers.parseEther('1')

      await expect(
        malicious.attackBridge(
          bridge.getAddress(),
          amount,
          ethers.ZeroAddress,
          { value: amount }
        )
      ).to.be.revertedWithCustomError(bridge, 'UnexpectedTransactionState')
    })

    describe('Failing scenarios', () => {
      it('should refund ETH and mark the transaction as cancelled', async () => {
        const [user] = await ethers.getSigners()

        const recipient = await user.getAddress()
        const amount = 13371337133713371337n
        const fee = await bridge.getFee(amount, recipient)

        const bridgeTx = await bridge.bridge(
          amount,
          recipient,
          ethers.ZeroAddress,
          {
            value: amount,
          }
        )
        await bridgeTx.wait()
        // Let's get the nonce!
        const nonce = await bridge.transferNonce()
        const transaction = await bridge.transactions(nonce - 1n)
        expect(transaction.status).to.equal(1)

        const balanceBefore = await getBalance(recipient, ethers.provider)
        // Let's now issue the executeBridge
        const tx = await bridge.executeBridge(transaction.nonce, {
          value: fee,
        })
        const receipt = await tx.wait()
        const updatedTransaction = await bridge.transactions(transaction.nonce)
        expect(updatedTransaction.status).to.equal(3)
        const event = await getEvent(
          receipt,
          'BridgeCancelled',
          bridge.interface
        )
        expect(event.args.nonce).to.equal(transaction.nonce)
        expect(await getBalance(recipient, ethers.provider)).to.be.greaterThan(
          balanceBefore
        )
      })
    })
  })
})
