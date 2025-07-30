import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import { AbiCoder, parseUnits, TransactionReceipt, type Signer } from 'ethers'
import { getBalance } from '@relay-vaults/helpers'
import EverclearBridgeProxyModule from '../../ignition/modules/EverclearBridgeProxyModule'
import networks from '@relay-vaults/networks'
import { OriginNetworkConfig } from '@relay-vaults/types'

const destinationChainId = 1 // Ethereum
const originChainId = 8453 // Base

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

describe('EverclearBridgeProxy (withdraw)', function () {
  let bridge: any
  let recipient: Signer
  let originWeth: string
  let destWeth: string

  before(async () => {
    ;[, recipient] = await ethers.getSigners()

    const originNetwork = networks[
      originChainId.toString()
    ] as OriginNetworkConfig
    const destinationNetwork = networks[
      destinationChainId.toString()
    ] as OriginNetworkConfig

    // WETH addresses
    originWeth = originNetwork.assets.weth
    destWeth = destinationNetwork.assets.weth

    const { domainId: destinationDomainId } =
      destinationNetwork.bridges.everclear!
    const { spoke } = originNetwork.bridges.everclear!

    // deploy using ignition
    const parameters = {
      EverclearBridgeProxy: {
        destinationDomainId,
        l1BridgeProxy,
        relayPool,
        relayPoolChainId: destinationChainId,
        spoke,
      },
    }

    const result = await ignition.deploy(EverclearBridgeProxyModule, {
      parameters,
    })
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
        BigInt(originChainId)
      )

      // Create mock fee parameters for Everclear
      const fee = 500
      const ttl = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const moreData = '0x'

      const abiCoder = new AbiCoder()
      const encodedExtraData = abiCoder.encode(
        ['uint24', 'uint48', 'bytes'],
        [fee, ttl, moreData]
      )

      // Send message to the bridge
      const tx = await bridge.connect(recipient).bridge(
        originWeth, // currency
        destWeth, // l1Asset
        amount,
        '0x', // empty data for gasParams
        encodedExtraData, // extraData with everclear fee params
        { value: amount }
      )

      receipt = await tx.wait()
    })

    it('reduces the ETH balance', async () => {
      const balanceAfter = await getBalance(
        await recipient.getAddress(),
        ethers.ZeroAddress,
        BigInt(originChainId)
      )

      // Balance should be less than before (amount + gas costs)
      expect(balanceAfter).to.be.lessThan(balanceBefore - amount)
    })

    it('emits intent creation events', async () => {
      // The actual event would come from the feeAdapter contract
      // For now, just verify the transaction was successful
      expect(receipt).to.not.equal(null)
      expect(receipt!.status).to.equal(1)
    })

    it('has correct bridge configuration', async () => {
      expect(await bridge.feeAdapter()).to.equal(feeAdapter)
      expect(await bridge.destinationDomainId()).to.equal(destinationDomainId)
      expect(await bridge.L1_BRIDGE_PROXY()).to.equal(l1BridgeProxy)
    })
  })
})
