import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import {
  parseUnits,
  TransactionReceipt,
  ZeroAddress,
  type Signer,
} from 'ethers'
import { getBalance, getProvider } from '@relay-vaults/helpers'
import { networks } from '@relay-vaults/networks'
import ArbitrumOrbitNativeDepositBridgeProxyModule from '../../ignition/modules/ArbitrumOrbitNativeDepositBridgeProxyModule'

import { OriginNetworkConfig } from '@relay-vaults/types'
import { ArbitrumOrbitNativeDepositBridgeProxy } from '../../typechain-types'

const originChainId = 1 // Ethereum mainnet
const destinationChainId = 42161 // arb one
// const chainId = 42170 // TODO: Arbitrum Nova mainnet

const { routerGateway, inbox } = (
  networks[destinationChainId] as OriginNetworkConfig
).bridges.arbitrum!.parent

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

function hexDataLength(hexString: string) {
  if (hexString.startsWith('0x')) hexString = hexString.slice(2)
  if (hexString.length % 2 !== 0) throw new Error('Invalid hex string')
  return hexString.length / 2
}

const estimateTicketCost = async (
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
  const inboxContract = await ethers.getContractAt('IInbox', inbox)

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

  // 2. Get current L2 gas price
  const blockDest = await destProvider.getBlock('latest')
  const maxFeePerGas = blockDest!.baseFeePerGas

  // 3. Estimate the submission fee for calldata size
  const callDataSize = hexDataLength(data)
  const block = await ethers.provider.getBlock('latest')
  const parentBaseFee = block!.baseFeePerGas
  const maxSubmissionCost = await inboxContract.calculateRetryableSubmissionFee(
    callDataSize,
    parentBaseFee
  )

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

      const params = [
        ethers.ZeroAddress, // native token
        ethers.ZeroAddress, // l1 native token
        amount,
        '0x', // empty data
        '0x', // empty extraData
      ]

      const gasEstimate = await estimateTicketCost(bridge, amount, '0x')
      console.log(gasEstimate)

      // Send message to the bridge
      const tx = await bridge.connect(recipient).bridge(
        ethers.ZeroAddress, // native token
        ethers.ZeroAddress, // l1 native token
        amount,
        '0x', // empty data
        '0x', // empty extraData
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
        // slightly less because of gas
      ).to.be.lessThan(balanceBefore - amount)
    })

    it('emits L2ToL1Tx event from ArbSys', async () => {
      // Check for L2ToL1Tx event from ArbSys precompile
      const arbSysInterface = new ethers.Interface([
        'event L2ToL1Tx(address indexed sender, address indexed destination, uint256 indexed uniqueId, uint256 indexed batchNumber, uint256 indexInBatch, uint256 arbBlockNum, uint256 ethBlockNum, uint256 timestamp, uint256 callvalue, bytes data)',
      ])

      const l2ToL1TxEvent =
        receipt &&
        receipt.logs.find((log) => {
          try {
            const parsed = arbSysInterface.parseLog(log)
            return parsed && parsed.name === 'L2ToL1Tx'
          } catch {
            return false
          }
        })

      expect(l2ToL1TxEvent).to.not.be.undefined

      if (l2ToL1TxEvent) {
        let parsed = null
        try {
          parsed = arbSysInterface.parseLog(l2ToL1TxEvent)
        } catch {
          parsed = null
        }
        expect(parsed).to.not.be.null
        if (parsed) {
          expect(parsed.args.sender).to.equal(await bridge.getAddress())
          expect(parsed.args.destination).to.equal(l1BridgeProxy)
          expect(parsed.args.callvalue).to.equal(amount)
        }
      }
    })
  })
})
