import hre from 'hardhat'
import { ethers, zksyncEthers } from 'hardhat'
import { expect } from 'chai'
import {
  parseUnits,
  TransactionReceipt,
  ZeroAddress,
  type Signer,
} from 'ethers'
import { getBalance, getEvent } from '@relay-protocol/helpers'
import { networks } from '@relay-protocol/networks'
import { ZkSyncBridgeProxy } from '../../typechain-types'
import { stealERC20 } from '../utils/hardhat'

const chainId = 324 // zkSync Era mainnet
const destinationChainId = 1 // Ethereum mainnet
const {
  bridges: {
    zksync: { l2SharedDefaultBridge },
  },
  assets,
} = networks[chainId]

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

describe('ZkSyncBridgeProxy', function () {
  let bridge: ZkSyncBridgeProxy
  let recipient: Signer

  before(async () => {
    ;[, recipient] = await ethers.getSigners()

    // deploy using ignition
    const deployArgs = [
      l2SharedDefaultBridge,
      destinationChainId,
      relayPool,
      l1BridgeProxy,
    ]

    bridge = await zksyncEthers.deployContract('ZkSyncBridgeProxy', deployArgs)
  })

  describe('sending native token (ETH)', () => {
    let balanceBefore: bigint
    const amount = parseUnits('0.1', 18)
    let receipt: TransactionReceipt | null

    before(async () => {
      // Get initial balance
      balanceBefore = await getBalance(
        await recipient.getAddress(),
        ethers.ZeroAddress,
        zksyncEthers.provider
      )
      // Send message to the bridge
      const tx = await bridge.connect(recipient).bridge(
        ethers.ZeroAddress, // native token
        ethers.ZeroAddress, // l1 native token
        amount,
        '0x', //empty data
        { value: amount }
      )

      receipt = await tx.wait()
    })

    it('reduces the ETH balance', async () => {
      expect(
        await getBalance(
          await recipient.getAddress(),
          ethers.ZeroAddress,
          ethers.provider
        )
        // slighly less because of gas
      ).to.be.lessThan(balanceBefore - amount)
    })

    it('emits Withdrawal event', async () => {
      const { interface: iface } = await ethers.getContractAt(
        'IBaseToken',
        ethers.ZeroAddress
      )
      const { event } = await getEvent(receipt!, 'Withdrawal', iface)
      expect(event).to.not.be.equal(undefined)
      const { args } = event
      expect(args?._l2Sender).to.be.equal(await bridge.getAddress())
      expect(args?._l1Receiver).to.be.equal(l1BridgeProxy)
      expect(args?._amount).to.be.equal(amount)
    })
  })

  describe.skip('sending USDC', () => {
    let balanceBefore: bigint
    const amount = parseUnits('100', 6)
    let receipt: TransactionReceipt | null

    before(async () => {
      const usdc = await zksyncEthers.getContractAt('IUSDC', assets.usdc)

      // Get some USDC from a whale
      const whaleAddress = '0x6b6314f4f07c974600d872182dcDE092C480e57b'
      const whale = await zksyncEthers.getImpersonatedSigner(whaleAddress)
      await usdc.connect(whale).transfer(await recipient.getAddress(), amount)

      // Get initial balance
      balanceBefore = await getBalance(
        await recipient.getAddress(),
        assets.usdc,
        zksyncEthers.provider
      )

      // Approve bridge to spend USDC
      await usdc.connect(recipient).approve(await bridge.getAddress(), amount)

      // Send message to the bridge
      const tx = await bridge.bridge(
        assets.usdc,
        ZeroAddress, // L1 address, not needed here
        amount,
        '0x' //empty data
      )

      receipt = await tx.wait()
    })

    it('reduces the USDC balance', async () => {
      expect(
        await getBalance(
          await recipient.getAddress(),
          assets.usdc,
          zksyncEthers.provider
        )
      ).to.be.equal(balanceBefore - amount)
    })

    it('emits WithdrawalInitiated event', async () => {
      const { interface: iface } = await ethers.getContractAt(
        'IL2SharedBridge',
        ethers.ZeroAddress
      )
      const { event } = await getEvent(receipt!, 'WithdrawalInitiated', iface)
      expect(event).to.not.be.equal(undefined)
      const { args } = event
      expect(args?.l2Sender).to.be.equal(await bridge.getAddress())
      expect(args?.l1Receiver).to.be.equal(l1BridgeProxy)
      expect(args?.l2Token).to.be.equal(assets.usdc)
      expect(args?.amount).to.be.equal(amount)
    })
  })
})
