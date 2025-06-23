import { ethers } from 'hardhat'
import { expect } from 'chai'
import { USDCBridgedStandardBridgeProxy } from '../../typechain-types'
import { ZeroAddress } from 'ethers'

// USDC.e on zksync
const USDCe = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'

describe('USDCBridgedStandardBridgeProxy', function () {
  let bridge: USDCBridgedStandardBridgeProxy
  let relayPool: string
  let l1BridgeProxy: string
  let relayPoolChainId: number

  before(async () => {
    const [deployer] = await ethers.getSigners()

    // Test parameters
    relayPoolChainId = 1 // Ethereum mainnet
    relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

    // Deploy the contract
    const USDCBridgedStandardBridgeProxyFactory =
      await ethers.getContractFactory('USDCBridgedStandardBridgeProxy')
    bridge = await USDCBridgedStandardBridgeProxyFactory.deploy(
      relayPoolChainId,
      relayPool,
      l1BridgeProxy,
      USDCe
    )

    // TODO: get USDC.e
    const tx = await bridge.bridge(ZeroAddress, ZeroAddress, 1000n, '0x', '0x')
    const receipt = await tx.wait()
  })

  describe('Constructor', function () {
    it('should set the correct relay pool chain ID', async () => {
      expect(await bridge.RELAY_POOL_CHAIN_ID()).to.equal(relayPoolChainId)
      expect(await bridge.RELAY_POOL()).to.equal(relayPool)
      expect(await bridge.L1_BRIDGE_PROXY()).to.equal(l1BridgeProxy)
      expect(await bridge.USDCe()).to.equal(USDCe)
    })
  })

  describe.skip('Bridge function', function () {
    it('should fire events correctly', async () => {})
  })
})
