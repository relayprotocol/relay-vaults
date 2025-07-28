import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import {
  AbiCoder,
  parseUnits,
  TransactionReceipt,
  ZeroAddress,
  type Signer,
} from 'ethers'
import { getBalance, getEvent, getProvider } from '@relay-vaults/helpers'
import { networks } from '@relay-vaults/networks'
import ArbitrumOrbitNativeDepositBridgeProxyModule from '../../../ignition/modules/ArbitrumOrbitNativeDepositBridgeProxyModule'

import { OriginNetworkConfig } from '@relay-vaults/types'
import { ArbitrumOrbitNativeDepositBridgeProxy } from '../../../typechain-types'
import { stealERC20 } from '../../utils/hardhat'

const originChainId = 1
const destinationChainId = 42161 // arb one
// const chainId = 42170 // TODO: Arbitrum Nova mainnet

const { routerGateway, inbox } = (
  networks[destinationChainId] as OriginNetworkConfig
).bridges.arbitrum!.parent

const {
  assets: { udt: UDT_ETHEREUM },
} = networks[originChainId]
const UDT_WHALE = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35'

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

function hexDataLength(hexString: string) {
  if (hexString.startsWith('0x')) hexString = hexString.slice(2)
  if (hexString.length % 2 !== 0) throw new Error('Invalid hex string')
  return hexString.length / 2
}

const estimateRetryableFee = async (destinationChainId, data = '0x') => {
  const destProvider = await getProvider(destinationChainId)

  // 2. Get current L2 gas price
  const blockDest = await destProvider.getBlock('latest')
  const maxFeePerGas = blockDest!.baseFeePerGas

  // 3. Estimate the submission fee for calldata size
  const callDataSize = hexDataLength(data)
  const block = await ethers.provider.getBlock('latest')
  const parentBaseFee = block!.baseFeePerGas

  // get submission cost
  const inboxContract = await ethers.getContractAt('IInbox', inbox)
  const maxSubmissionCost = await inboxContract.calculateRetryableSubmissionFee(
    callDataSize,
    parentBaseFee
  )

  return {
    maxFeePerGas,
    maxSubmissionCost,
  }
}

const estimateNativeBridgeTicketCost = async (
  bridge: ArbitrumOrbitNativeDepositBridgeProxy,
  amount: bigint,
  data: string
) => {
  const destProvider = await getProvider(destinationChainId)

  // You will need to implement these contract ABIs and addresses yourself
  const { interface: NodeInterface } = await ethers.getContractAt(
    'INodeInterface',
    ZeroAddress
  )
  const nodeInterface = new ethers.Contract(
    '0x00000000000000000000000000000000000000C8',
    NodeInterface,
    destProvider
  )

  // 1. Estimate gasLimit for the retryable ticket
  const [signer] = await ethers.getSigners()
  const gasLimit = await nodeInterface.estimateRetryableTicket.estimateGas(
    await signer.getAddress(), // from,
    amount + ethers.parseEther('1'), // senderDeposit, // can be a dummy value (e.g., l2CallValue + 1 ether)
    await bridge.L1_BRIDGE_PROXY(), // to
    amount, // l2CallValue
    await bridge.getAddress(), // excessFeeRefundAddress
    await bridge.getAddress(), // callValueRefundAddress (receives msg.value on l2)
    data // data
  )

  const { maxFeePerGas, maxSubmissionCost } =
    await estimateRetryableFee(destinationChainId)

  // 4. Compute deposit (sum of all costs, plus l2CallValue)
  const deposit = gasLimit * maxFeePerGas! + maxSubmissionCost + amount

  // 5. Return all values as an object (in BN/BigInt/string as needed)
  return {
    deposit,
    gasLimit,
    maxFeePerGas,
    maxSubmissionCost,
  }
}

describe('ArbitrumOrbitNativeBridgeProxy (deposit)', function () {
  let bridge: any
  let recipient: Signer

  before(async () => {
    ;[, recipient] = await ethers.getSigners()

    // deploy using ignition
    const parameters = {
      ArbitrumOrbitNativeDepositBridgeProxy: {
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
  })

  describe('sending ERC20', () => {
    let balanceBefore: bigint
    const amount = parseUnits('0.1', 18)
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

      // TODO: clarify how to calculate / simualte this calldata
      // and compute gaslimit
      const gasLimit = 6000000n
      const calldataLength = 1652
      const fakeCalldata = Array(calldataLength).fill(0).join('')

      const { maxFeePerGas, maxSubmissionCost } = await estimateRetryableFee(
        destinationChainId,
        fakeCalldata
      )

      const deposit = gasLimit * maxFeePerGas! + maxSubmissionCost

      const abiCoder = new AbiCoder()
      const encodedGasEstimate = abiCoder.encode(
        ['uint', 'uint', 'uint', 'bytes'],
        [maxFeePerGas, gasLimit, maxSubmissionCost, '0x']
      )
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
        encodedGasEstimate, // extraData
        {
          value: deposit,
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
    const amount = parseUnits('0.1', 18)
    let receipt: TransactionReceipt | null

    before(async () => {
      // Get initial balance
      balanceBefore = await getBalance(
        await recipient.getAddress(),
        ethers.ZeroAddress,
        ethers.provider
      )

      const gasEstimate = await estimateNativeBridgeTicketCost(
        bridge,
        amount,
        '0x'
      )

      const abiCoder = new AbiCoder()
      const encodedGasEstimate = abiCoder.encode(
        ['uint', 'uint', 'uint', 'bytes'],
        [
          gasEstimate.maxFeePerGas,
          gasEstimate.gasLimit,
          gasEstimate.maxSubmissionCost,
          '0x',
        ]
      )

      const bridgeParams = [
        ethers.ZeroAddress, // native token
        ethers.ZeroAddress, // l1 native token
        amount,
        '0x', // empty hyperlane gas data
        encodedGasEstimate, // use extraData
      ]

      // Send message to the bridge
      const tx = await bridge
        .connect(recipient)
        .bridge(...bridgeParams, { value: gasEstimate.deposit })

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
