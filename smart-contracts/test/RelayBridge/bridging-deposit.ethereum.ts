import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import { networks } from '@relay-vaults/networks'

import { RelayBridge } from '../../typechain-types'
import RelayBridgeModule from '../../ignition/modules/RelayBridgeModule'
import ArbitrumOrbitNativeDepositBridgeProxyModule from '../../ignition/modules/ArbitrumOrbitNativeDepositBridgeProxyModule'
import { AbiCoder, parseUnits, Signer, TransactionReceipt } from 'ethers'
import {
  estimateNativeBridgeTicketCost,
  getBalance,
  getEvent,
} from '@relay-vaults/helpers'

const originChainId = 1
const destinationChainId = 42161 // arb one
// const chainId = 42170 // TODO: Arbitrum Nova mainnet

const { routerGateway, inbox, erc20Gateway } = (
  networks[originChainId] as OriginNetworkConfig
).bridges.arbitrumDeposit!.child

const { hyperlaneMailbox } = networks[originChainId]

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'
const l1Gas = '500000'

const arbBridgeEvents = new ethers.Interface([
  // from IDelayedMessageProvider
  'event InboxMessageDelivered(uint256 indexed messageNum,bytes data)',
  // IBridge
  'event MessageDelivered(uint256 indexed messageIndex,bytes32 indexed beforeInboxAcc,address inbox,uint8 kind,address sender,bytes32 messageDataHash,uint256 baseFeeL1,uint64 timestamp)',
])

describe('RelayBridge > ArbitrumOrbitNativeBridgeProxy (deposit)', function () {
  let bridge: RelayBridge
  let bridgeProxyAddress: string
  let recipient: Signer
  before(async () => {
    ;[recipient] = await ethers.getSigners()

    // deploy using ignition
    const bridgeProxyParameters = {
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
        parameters: bridgeProxyParameters,
      }
    )
    bridgeProxyAddress = await result.bridge.getAddress()

    const parameters = {
      RelayBridge: {
        asset: ethers.ZeroAddress,
        bridgeProxy: bridgeProxyAddress,
        hyperlaneMailbox,
      },
    }
    const deployment = await ignition.deploy(RelayBridgeModule, {
      parameters,
    })
    bridge = deployment.bridge
  })

  describe('deposit ETH to Arbitrum', () => {
    let balanceBefore: bigint
    let receipt: TransactionReceipt | null
    const amount = parseUnits('1', 18)

    before(async () => {
      const recipientAddress = await recipient.getAddress()
      balanceBefore = await getBalance(recipientAddress, ethers.provider)
      const hyperlaneFee = await bridge.getFee(amount, recipientAddress, l1Gas)

      const gasEstimate = await estimateNativeBridgeTicketCost({
        amount,
        bridgeAddress: await bridge.getAddress(),
        destProxyBridgeAddress: l1BridgeProxy,
        destinationChainId: BigInt(destinationChainId),
        from: recipientAddress,
        originChainId: BigInt(originChainId),
      })
      const abiCoder = new AbiCoder()
      const encodedGasEstimate = abiCoder.encode(
        ['tuple(uint,uint,uint,uint)', 'bytes'],
        [
          [
            gasEstimate.maxFeePerGas,
            gasEstimate.gasLimit,
            gasEstimate.maxSubmissionCost,
            gasEstimate.despositFee,
          ],
          '0x',
        ]
      )
      const data = encodedGasEstimate

      // value should account for the cost of Arb retryable ticket
      const value = hyperlaneFee + amount

      const tx = await bridge.bridge(
        amount,
        recipientAddress,
        ethers.ZeroAddress,
        l1Gas,
        data,
        {
          value,
        }
      )
      receipt = await tx.wait()
    })

    it('should emit correct events', async () => {
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
      expect(inboxMessageDelivered).to.not.equal(null)
      expect(messageDelivered).to.not.equal(null)
      expect(messageDelivered.args.sender).to.not.equal(
        await recipient.getAddress()
      )
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
  })
})
