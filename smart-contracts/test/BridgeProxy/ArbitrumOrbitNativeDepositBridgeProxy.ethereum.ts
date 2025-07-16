import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import { parseUnits, TransactionReceipt, type Signer } from 'ethers'
import { getBalance } from '@relay-vaults/helpers'
import { networks } from '@relay-vaults/networks'
import ArbitrumOrbitNativeDepositBridgeProxyModule from '../../ignition/modules/ArbitrumOrbitNativeDepositBridgeProxyModule'

import { OriginNetworkConfig } from '@relay-vaults/types'

const chainId = 42170 // Arbitrum Nova mainnet
const destinationChainId = 1 // Ethereum mainnet
const arbitrumBridge = (networks[chainId] as OriginNetworkConfig).bridges
  .arbitrum!
const { routerGateway } = arbitrumBridge.parent // l1GatewayRouter

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

describe('ArbitrumOrbitNativeBridgeProxy (deposit)', function () {
  let bridge: any
  let recipient: Signer

  before(async () => {
    ;[, recipient] = await ethers.getSigners()

    // deploy using ignition
    const parameters = {
      ArbitrumOrbitNativeDepositBridgeProxy: {
        l1BridgeProxy,
        relayPool,
        relayPoolChainId: destinationChainId,
        routerGateway,
      },
    }

    console.log(parameters)

    const result = await ignition.deploy(
      ArbitrumOrbitNativeDepositBridgeProxyModule,
      {
        parameters,
      }
    )
    console.log(result)
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
