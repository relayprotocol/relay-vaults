import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import { AbiCoder, parseUnits, TransactionReceipt, type Signer } from 'ethers'
import {
  getBalance,
  getEvent,
  estimateRetryableFee,
  estimateNativeBridgeTicketCost,
} from '@relay-vaults/helpers'
import { networks } from '@relay-vaults/networks'
import ArbitrumOrbitNativeDepositBridgeProxyModule from '../../../ignition/modules/ArbitrumOrbitNativeDepositBridgeProxyModule'

import { OriginNetworkConfig } from '@relay-vaults/types'
import { stealERC20 } from '../../utils/hardhat'

const originChainId = 1
const destinationChainId = 42161 // arb one
// const chainId = 42170 // TODO: Arbitrum Nova mainnet

const { routerGateway, inbox, erc20Gateway } = (
  networks[originChainId] as OriginNetworkConfig
).bridges.arbitrumDeposit!.child

const {
  assets: { udt: UDT_ETHEREUM },
} = networks[originChainId]
const UDT_WHALE = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35'

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

const amount = parseUnits('0.1', 18)

describe('ArbitrumOrbitNativeBridgeProxy (deposit)', function () {
  let bridge: any
  let recipient: Signer
  let gasEstimate: any
  let extraData: string

  before(async () => {
    ;[, recipient] = await ethers.getSigners()

    // deploy using ignition
    const parameters = {
      ArbitrumOrbitNativeDepositBridgeProxy: {
        erc20Gateway,
        inbox,
        l1BridgeProxy,
        relayPool,
        relayPoolChainId: destinationChainId,
        routerGateway,
      },
    }

    const result = await ignition.deploy(
      ArbitrumOrbitNativeDepositBridgeProxyModule,
      {
        parameters,
      }
    )
    bridge = result.bridge

    const [signer] = await ethers.getSigners()
    gasEstimate = await estimateNativeBridgeTicketCost({
      amount,
      bridgeAddress: await bridge.getAddress(),
      destProxyBridgeAddress: await bridge.L1_BRIDGE_PROXY(),
      destinationChainId: BigInt(destinationChainId),
      from: await signer.getAddress(),
      originChainId: BigInt(originChainId),
    })

    const abiCoder = new AbiCoder()
    extraData = abiCoder.encode(
      ['tuple(uint,uint,uint,uint)', 'bytes'],
      [
        [
          gasEstimate.maxFeePerGas,
          gasEstimate.gasLimit,
          gasEstimate.maxSubmissionCost,
          gasEstimate.depositFee,
        ],
        '0x',
      ]
    )
  })

  describe('sending ERC20', () => {
    let balanceBefore: bigint
    let receipt: TransactionReceipt | null

    before(async () => {
      // fund assets to the bridge contract
      await stealERC20(
        UDT_ETHEREUM,
        UDT_WHALE,
        await bridge.getAddress(),
        amount
      )

      // get initial balance
      balanceBefore = await getBalance(
        await bridge.getAddress(),
        UDT_ETHEREUM,
        ethers.provider
      )

      // make sure stealing pays
      expect(balanceBefore).to.equal(amount)

      // send tx
      const gatewayRouter = await ethers.getContractAt(
        'IL1GatewayRouter',
        routerGateway
      )
      const udtArbAddress = gatewayRouter.calculateL2TokenAddress(UDT_ETHEREUM)

      // Send message to the bridge
      const tx = await bridge.bridge(
        udtArbAddress, // L2 token
        UDT_ETHEREUM, // l1 token
        amount,
        '0x', // empty hyperlane gas data
        extraData, // extraData
        {
          value: gasEstimate.depositFee,
        }
      )

      receipt = await tx.wait()
    })

    it('reduces the ERC20 balance', async () => {
      expect(
        await getBalance(
          await bridge.getAddress(),
          UDT_ETHEREUM,
          ethers.provider
        )
        // slightly less because of gas
      ).to.equal(balanceBefore - amount)
    })

    it('emits bridge events', async () => {
      // Check for events (in nitro-contracts)
      const arbBridgeEvents = new ethers.Interface([
        // from IDelayedMessageProvider
        'event InboxMessageDelivered(uint256 indexed messageNum,bytes data)',
        // IBridge
        'event MessageDelivered(uint256 indexed messageIndex,bytes32 indexed beforeInboxAcc,address inbox,uint8 kind,address sender,bytes32 messageDataHash,uint256 baseFeeL1,uint64 timestamp)',
      ])

      const inboxMessageDelivered = await getEvent(
        receipt!,
        'MessageDelivered',
        arbBridgeEvents
      )
      const messageDelivered = await getEvent(
        receipt!,
        'InboxMessageDelivered',
        arbBridgeEvents
      )
      const [signer] = await ethers.getSigners()
      expect(inboxMessageDelivered).to.not.equal(null)
      expect(messageDelivered).to.not.equal(null)
      expect(messageDelivered.args.sender).to.not.equal(
        await signer.getAddress()
      )
    })
  })

  describe('sending native token (ETH)', () => {
    let balanceBefore: bigint
    let receipt: TransactionReceipt | null

    before(async () => {
      // Get initial balance
      balanceBefore = await getBalance(
        await recipient.getAddress(),
        ethers.ZeroAddress,
        ethers.provider
      )

      const bridgeParams = [
        ethers.ZeroAddress, // native token
        ethers.ZeroAddress, // l1 native token
        amount,
        '0x', // empty hyperlane gas data
        extraData, // use extraData to pass gas params
      ]

      // Send message to the bridge
      const tx = await bridge
        .connect(recipient)
        .bridge(...bridgeParams, { value: amount })

      receipt = await tx.wait()
    })

    it('reduces the ETH balance', async () => {
      expect(
        await getBalance(
          await recipient.getAddress(),
          ethers.ZeroAddress,
          ethers.provider
        )
        // slightly less because of gas
      ).to.be.lessThan(balanceBefore - amount)
    })

    it('emits bridge events', async () => {
      // Check for events (in nitro-contracts)
      const arbBridgeEvents = new ethers.Interface([
        // from IDelayedMessageProvider
        'event InboxMessageDelivered(uint256 indexed messageNum,bytes data)',
        // IBridge
        'event MessageDelivered(uint256 indexed messageIndex,bytes32 indexed beforeInboxAcc,address inbox,uint8 kind,address sender,bytes32 messageDataHash,uint256 baseFeeL1,uint64 timestamp)',
      ])

      const inboxMessageDelivered = await getEvent(
        receipt!,
        'MessageDelivered',
        arbBridgeEvents
      )
      const messageDelivered = await getEvent(
        receipt!,
        'InboxMessageDelivered',
        arbBridgeEvents
      )

      const [signer] = await ethers.getSigners()
      expect(inboxMessageDelivered).to.not.equal(null)
      expect(messageDelivered).to.not.equal(null)
      expect(messageDelivered.args.sender).to.not.equal(
        await signer.getAddress()
      )
    })
  })
})
