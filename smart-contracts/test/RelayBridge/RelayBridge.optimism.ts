import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import { mintUSDC, stealERC20 } from '../utils/hardhat'
import { getBalance, getEvent } from '@relay-protocol/helpers'

import {
  Mailbox,
  ERC20,
  L2ToL1MessagePasser,
  L2CrossDomainMessenger,
  L2StandardBridge,
} from '@relay-protocol/helpers/abis'
import { ContractTransactionReceipt, Log } from 'ethers'

import { networks } from '@relay-protocol/networks'
import RelayBridgeModule from '../../ignition/modules/RelayBridgeModule'
import OPStackNativeBridgeProxyModule from '../../ignition/modules/OPStackNativeBridgeProxyModule'
import CCTPBridgeProxyModule from '../../ignition/modules/CCTPBridgeProxyModule'
import { RelayBridge } from '../../typechain-types'

const {
  hyperlaneMailbox: HYPERLANE_MAILBOX_ON_OPTIMISM,
  bridges: {
    cctp: { transmitter, messenger },
  },
  assets,
} = networks[10]

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

describe('RelayBridge', function () {
  let bridge: RelayBridge
  let opProxyBridgeAddress: string
  before(async () => {
    const { bridge: opProxyBridge } = await ignition.deploy(
      OPStackNativeBridgeProxyModule,
      {
        parameters: {
          OPStackNativeBridgeProxy: {
            portalProxy: ethers.ZeroAddress,
            relayPoolChainId: 1,
            relayPool,
            l1BridgeProxy,
          },
        },
      }
    )
    opProxyBridgeAddress = await opProxyBridge.getAddress()

    const parameters = {
      RelayBridge: {
        asset: ethers.ZeroAddress,
        bridgeProxy: opProxyBridgeAddress,
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

      const bridgeAddress = await bridge.getAddress()
      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const nonce = await bridge.transferNonce()
      const balanceBefore = await getBalance(recipient, ethers.provider)
      const tx = await bridge.bridge(amount, recipient, ethers.ZeroAddress, {
        value: amount * 2n,
      })
      const receipt = await tx.wait()

      expect(receipt.logs.length).to.equal(5)
      receipt.logs.forEach((log: Log) => {
        expect(log.address).to.be.oneOf([
          HYPERLANE_MAILBOX_ON_OPTIMISM,
          '0x68eE9bec9B4dbB61f69D9D293Ae26a5AACb2e28f', // Merkle Tree Hook https://docs.hyperlane.xyz/docs/reference/contract-addresses#merkle-tree-hook
          '0xD8A76C4D91fCbB7Cc8eA795DFDF870E48368995C', // Interchain Gas Paymaster https://docs.hyperlane.xyz/docs/reference/contract-addresses#interchain-gas-paymaster-hook
          bridgeAddress,
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
          expect(event.name).to.equal('BridgeInitiated')
          expect(event.args[0]).to.equal(nonce)
          expect(event.args[1]).to.equal(recipient)
          expect(event.args[2]).to.equal(recipient)
          expect(event.args[3]).to.equal(ethers.ZeroAddress) // l2 asset
          expect(event.args[4]).to.equal(ethers.ZeroAddress) // l1 asset
          expect(event.args[5]).to.equal(amount)
          expect(event.args[6]).to.equal(opProxyBridgeAddress)
        }
      })

      // Check the transaction obect
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

      const { bridge: opProxyBridge } = await ignition.deploy(
        OPStackNativeBridgeProxyModule,
        {
          parameters: {
            OPStackNativeBridgeProxy: {
              portalProxy: ethers.ZeroAddress,
              relayPoolChainId: 1,
              relayPool,
              l1BridgeProxy,
            },
          },
        }
      )
      const opProxyBridgeAddress = await opProxyBridge.getAddress()

      const bridge = await ethers.deployContract('RelayBridge', [
        assets.udt,
        opProxyBridgeAddress,
        HYPERLANE_MAILBOX_ON_OPTIMISM,
      ])
      const bridgeAddress = await bridge.getAddress()
      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')

      // Transfer UDT to sender/recipient
      await stealERC20(
        assets.udt,
        '0x99b1348a9129ac49c6de7F11245773dE2f51fB0c',
        recipient,
        amount
      )

      // Approve
      const erc20Contract = await ethers.getContractAt(ERC20, assets.udt)
      await erc20Contract.approve(bridgeAddress, amount)

      const nonce = await bridge.transferNonce()
      const balanceBefore = await getBalance(recipient, ethers.provider)

      const value = await bridge.getFee(amount, recipient)

      const tx = await bridge.bridge(
        amount,
        recipient,
        networks[1].assets.udt,
        {
          value,
          gasLimit: 30000000,
        }
      )
      const receipt = await tx.wait()

      expect(receipt.logs.length).to.equal(7)
      receipt.logs.forEach((log: Log) => {
        expect(log.address).to.be.oneOf([
          HYPERLANE_MAILBOX_ON_OPTIMISM,
          '0x68eE9bec9B4dbB61f69D9D293Ae26a5AACb2e28f', // Merkle Tree Hook https://docs.hyperlane.xyz/docs/reference/contract-addresses#merkle-tree-hook
          '0xD8A76C4D91fCbB7Cc8eA795DFDF870E48368995C', // Interchain Gas Paymaster https://docs.hyperlane.xyz/docs/reference/contract-addresses#interchain-gas-paymaster-hook
          bridgeAddress,
          assets.udt,
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
            //   "0x13405d896bfb8534ccf928a9f654918d59f5937d938ef7179630fe721e587404"
            // );
          }
        } else if (log.address === bridgeAddress) {
          const event = bridge.interface.parseLog(log)
          expect(event.name).to.equal('BridgeInitiated')
          expect(event.args[0]).to.equal(nonce)
          expect(event.args[1]).to.equal(recipient)
          expect(event.args[2]).to.equal(recipient)
          expect(event.args[3]).to.equal(assets.udt)
          expect(event.args[4]).to.equal(networks[1].assets.udt)
          expect(event.args[5]).to.equal(amount)
          expect(event.args[6]).to.equal(opProxyBridgeAddress)
        }
      })

      // make sure excess value refund has been issued
      expect(await getBalance(recipient, ethers.provider)).to.be.greaterThan(
        balanceBefore - amount * 2n
      )
    })
  })

  describe('executeBridge', () => {
    it('should fail of if the transaction is not in the correct state', async () => {
      await expect(bridge.executeBridge(1337))
        .to.be.revertedWithCustomError(bridge, 'BridgingTransactionNotReady')
        .withArgs(1337)
    })

    it('should update the transaction state and emit the bridge executed event', async () => {
      const [user] = await ethers.getSigners()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const bridgeTx = await bridge.bridge(
        amount,
        recipient,
        ethers.ZeroAddress,
        {
          value: amount * 2n,
        }
      )
      await bridgeTx.wait()
      // Let's get the nonce!
      const nonce = await bridge.transferNonce()
      const transaction = await bridge.transactions(nonce - 1n)
      expect(transaction.status).to.equal(1)

      // Let's now issue the executeBridge
      const tx = await bridge.executeBridge(transaction.nonce)
      const receipt = await tx.wait()
      const updatedTransaction = await bridge.transactions(transaction.nonce)
      expect(updatedTransaction.status).to.equal(2)
      const event = await getEvent(receipt, 'BridgeExecuted', bridge.interface)
      expect(event.args.nonce).to.equal(transaction.nonce)
    })

    it('should have called the native bridge to perform the transfer with native ETH', async () => {
      const [user] = await ethers.getSigners()

      const l2ToL1MessagePasser = new ethers.Contract(
        '0x4200000000000000000000000000000000000016',
        L2ToL1MessagePasser,
        user
      )

      const l2ToL1MessagePasserNextNonce =
        await l2ToL1MessagePasser.messageNonce()

      const recipient = await user.getAddress()
      const amount = ethers.parseEther('1')
      const bridgeAddress = await bridge.getAddress()
      const nonce = await bridge.transferNonce()

      await (
        await bridge.bridge(amount, recipient, ethers.ZeroAddress, {
          value: amount * 2n,
        })
      ).wait()
      const transaction = await bridge.transactions(nonce)
      const tx = await bridge.executeBridge(nonce)
      const receipt = (await tx.wait())!

      expect(receipt.logs.length).to.equal(6)
      receipt.logs.forEach((log: Log) => {
        expect(log.address).to.be.oneOf([
          bridgeAddress,
          '0x4200000000000000000000000000000000000016', // L2ToL1MessagePasser,
          '0x4200000000000000000000000000000000000007', // L2CrossDomainMessenger,
          '0x4200000000000000000000000000000000000010', // L2StandardBridge
        ])
        if (log.address === bridgeAddress) {
          const event = bridge.interface.parseLog(log)
          expect(event.name).to.equal('BridgeExecuted')
          expect(event.args[0]).to.equal(nonce)
        } else if (
          log.address === '0x4200000000000000000000000000000000000016'
        ) {
          const iface = new ethers.Interface(L2ToL1MessagePasser)
          const event = iface.parseLog(log)
          expect(event.name).to.be.equal('MessagePassed')
          expect(event.args.nonce).to.be.equal(l2ToL1MessagePasserNextNonce)
          expect(event.args.sender).to.be.equal(
            '0x4200000000000000000000000000000000000007' // L2CrossDomainMessenger
          )
          expect(event.args.target).to.be.equal(
            '0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1' // L1CrossDomainMessengerProxy
          )
          expect(event.args.value).to.be.equal(amount)
          expect(event.args.gasLimit).to.be.equal(492846)
          expect(event.args.withdrawalHash).to.be.not.equal(null)
        } else if (
          log.address === '0x4200000000000000000000000000000000000007'
        ) {
          const iface = new ethers.Interface(L2CrossDomainMessenger)
          const event = iface.parseLog(log)
          expect(event.name).to.be.oneOf([
            'SentMessage',
            'SentMessageExtension1',
          ])
          if (event.name === 'SentMessage') {
            expect(event.args.target).to.equal(
              '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'
            )
            expect(event.args.sender).to.equal(
              '0x4200000000000000000000000000000000000010'
            )
            // message : TODO: parse
            // expect(event.args.message).to.equal(
            //   "0x0166a07a00000000000000000000000090de74265a416e1393a450752175aed98fe11517000000000000000000000000c709c9116dbf29da9c25041b13a07a0e68ac5d2d00000000000000000000000067ad6ea566ba6b0fc52e97bc25ce46120fdac04c000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000"
            // );
            expect(event.args.messageNonce).to.greaterThan(
              '1766847064778384329583297500742918515827483896875618958121606201292642353'
            )
            expect(event.args.gasLimit).to.equal('200000')
          } else if (event.name === 'SentMessageExtension1') {
            expect(event.args.sender).to.equal(
              '0x4200000000000000000000000000000000000010'
            )
            expect(event.args.value).to.equal(amount)
          } else {
            throw new Error('Unknown event')
          }
        } else if (
          log.address === '0x4200000000000000000000000000000000000010'
        ) {
          const iface = new ethers.Interface(L2StandardBridge)
          const event = iface.parseLog(log)
          expect(event.name).to.be.oneOf([
            'WithdrawalInitiated',
            'ETHBridgeInitiated',
          ])
          if (event.name === 'WithdrawalInitiated') {
            expect(event.args.l1Token).to.equal(
              '0x0000000000000000000000000000000000000000' // Native token
            )
            expect(event.args.l2Token).to.equal(
              '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000' // ERC-20: : Ether
            )
            expect(event.args.from).to.equal(bridgeAddress)
            expect(event.args.to).to.equal(l1BridgeProxy)
            expect(event.args.amount).to.equal(amount)
            expect(event.args.extraData).to.equal(transaction.data)
          } else if (event.name === 'ETHBridgeInitiated') {
            expect(event.args.from).to.equal(bridgeAddress)
            expect(event.args.to).to.equal(l1BridgeProxy)
            expect(event.args.amount).to.equal(amount)
            expect(event.args.extraData).to.equal(transaction.data)
          }
        } else {
          throw new Error('Unknown event')
        }
      })
    })
  })
})
