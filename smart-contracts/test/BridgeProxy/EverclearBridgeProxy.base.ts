import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import {
  AbiCoder,
  parseUnits,
  TransactionReceipt,
  ZeroAddress,
  type Signer,
} from 'ethers'
import { getBalance, getEvent } from '@relay-vaults/helpers'
import EverclearBridgeProxyModule from '../../ignition/modules/EverclearBridgeProxyModule'
import networks from '@relay-vaults/networks'
import { OriginNetworkConfig } from '@relay-vaults/types'

import { getNewEverclearIntent } from '@relay-vaults/helpers'

const destinationChainId = 1 // Ethereum
const originChainId = 8453 // Base

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

describe('EverclearBridgeProxy (withdraw)', function () {
  let bridge: any
  let recipient: Signer
  let originWeth: string
  let destWeth: string
  let feeAdapter: string

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
    ;({ feeAdapter } = originNetwork.bridges.everclear!)

    // deploy using ignition
    const parameters = {
      EverclearBridgeProxy: {
        destinationDomainId,
        feeAdapter,
        l1BridgeProxy,
        relayPool,
        relayPoolChainId: destinationChainId,
      },
    }

    const result = await ignition.deploy(EverclearBridgeProxyModule, {
      parameters,
    })
    bridge = result.bridge
  })

  describe('sending wrapped token (WETH)', () => {
    let balanceBefore: bigint
    const amount = parseUnits('0.1', 18)
    let receipt: TransactionReceipt | null

    before(async () => {
      // Wrap some ether
      const weth = await ethers.getContractAt('IWETH', originWeth, recipient)
      await weth.deposit({ value: amount })
      await weth.approve(await bridge.getAddress(), amount)

      // Get initial balance
      balanceBefore = await getBalance(
        await recipient.getAddress(),
        originWeth,
        ethers.provider
      )

      const intentParams = {
        amount,
        callData: '0x',
        destinations: [destinationChainId.toString()],
        inputAsset: originWeth,
        maxFee: 500n,
        origin: originChainId.toString(),
        to: await bridge.L1_BRIDGE_PROXY(),
      }

      // get intent from API
      const everclearIntent = await getNewEverclearIntent(intentParams)

      // encode tuple
      const abiCoder = new AbiCoder()
      const extraData = abiCoder.encode(
        ['address', 'uint', 'bytes'],
        [everclearIntent.to, everclearIntent.value, everclearIntent.data]
      )

      // Send message to the bridge
      const tx = await bridge.connect(recipient).bridge(
        originWeth, // currency
        destWeth, // l1Asset
        amount,
        '0x', // empty data for gasParams
        extraData, // extraData with everclear fee params
        { value: amount }
      )

      receipt = await tx.wait()
    })

    it('has correct bridge configuration', async () => {
      expect(await bridge.FEE_ADAPTER()).to.equal(feeAdapter)
      expect(await bridge.L1_BRIDGE_PROXY()).to.equal(l1BridgeProxy)
    })

    it('reduces the WETH balance', async () => {
      const balanceAfter = await getBalance(
        await recipient.getAddress(),
        originWeth,
        ethers.provider
      )
      expect(balanceAfter).to.equal(balanceBefore - amount)
    })

    it('emits intent creation events', async () => {
      const { interface: IFeeAdapter } = await ethers.getContractAt(
        'IFeeAdapter',
        ZeroAddress
      )
      const { event } = await getEvent(
        receipt!,
        'IntentWithFeesAdded',
        IFeeAdapter
      )
      expect(event._initiator).to.not.equal(await recipient.getAddress())
    })
  })
})
