import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import OPStackNativeBridgeProxyModule from '../../ignition/modules/OPStackNativeBridgeProxyModule'
import {
  MyToken,
  MyWeth,
  MyYieldPool,
  OPStackNativeBridgeProxy,
  RelayPool,
} from '../../typechain-types'
import { encodeData } from './hyperlane.hardhat'

// fractionalBps denominator is 1e11. Pick a bridgeFee such that
// `amount * bridgeFee / 1e11` truncates to 0 for the per-message
// amount we send below, but produces a non-zero batch fee once those
// amounts are aggregated by the bridge.
//
// With bridgeFee = 1e9 (1%) and per-message amount = 50 wei:
//   per-message: 50 * 1e9 / 1e11 = 0   (truncated)
//   batch (1000 msgs of 50 wei): 50_000 * 1e9 / 1e11 = 500
const relayBridgeOptimism = '0x0000000000000000000000000000000000000010'
const relayBridgeBase = '0x0000000000000000000000000000000000008453'
const portalProxy = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e'

const bridgeFee = BigInt(1_000_000_000) // 1% in fractional bps
const FRACTIONAL_BPS_DENOMINATOR = BigInt(100_000_000_000)
const MESSAGE_COUNT = 1000n
const PER_MESSAGE_AMOUNT = 50n // wei — small enough to truncate to 0 fee

describe('RelayPool: per-message fee truncation does not brick claim', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let myWeth: MyWeth
  let thirdPartyPool: MyYieldPool
  let bridgeProxy: OPStackNativeBridgeProxy
  let anotherBridgeProxy: OPStackNativeBridgeProxy
  let userAddress: string

  before(async () => {
    const [user] = await ethers.getSigners()
    userAddress = await user.getAddress()

    myToken = await ethers.deployContract('MyToken', ['My Token', 'TOKEN'])
    myWeth = await ethers.deployContract('MyWeth')
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])

    const parameters = {
      RelayPool: {
        asset: await myToken.getAddress(),
        curator: userAddress,
        // user is the mailbox so we can call handle() directly
        hyperlaneMailbox: userAddress,
        name: 'ERC20 RELAY POOL',
        symbol: 'ERC20-REL',
        thirdPartyPool: await thirdPartyPool.getAddress(),
        weth: await myWeth.getAddress(),
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, { parameters }))

    const bridgeProxyParameters = {
      OPStackNativeBridgeProxy: {
        l1BridgeProxy: ethers.ZeroAddress,
        portalProxy,
        relayPool: await relayPool.getAddress(),
        relayPoolChainId: 31337,
      },
    }
    ;({ bridge: bridgeProxy } = await ignition.deploy(
      OPStackNativeBridgeProxyModule,
      { parameters: bridgeProxyParameters }
    ))
    ;({ bridge: anotherBridgeProxy } = await ignition.deploy(
      OPStackNativeBridgeProxyModule,
      { parameters: bridgeProxyParameters }
    ))

    await relayPool.addOrigin({
      bridge: relayBridgeOptimism,
      bridgeFee,
      chainId: 10,
      coolDown: 0,
      curator: userAddress,
      maxDebt: ethers.parseEther('10'),
      proxyBridge: await bridgeProxy.getAddress(),
    })

    await relayPool.addOrigin({
      bridge: relayBridgeBase,
      bridgeFee,
      chainId: 8453,
      coolDown: 0,
      curator: userAddress,
      maxDebt: ethers.parseEther('10'),
      proxyBridge: await anotherBridgeProxy.getAddress(),
    })

    // Fund the pool with enough liquidity for the dust loans
    const liquidity = ethers.parseUnits('100', 18)
    await myToken.connect(user).mint(liquidity)
    await myToken.connect(user).approve(await relayPool.getAddress(), liquidity)
    await relayPool.connect(user).deposit(liquidity, userAddress)
  })

  it('per-message fees are truncated to zero for dust amounts', async () => {
    expect((PER_MESSAGE_AMOUNT * bridgeFee) / FRACTIONAL_BPS_DENOMINATOR).to.equal(
      0n
    )
  })

  it('handles many dust messages and claim does not underflow', async () => {
    // Sanity: pendingBridgeFees starts at 0
    expect(await relayPool.pendingBridgeFees()).to.equal(0)
    expect(
      await relayPool.accumulatedFeesByOrigin(10, relayBridgeOptimism)
    ).to.equal(0)

    // Send many dust messages — per-message fee truncates to 0 each time.
    for (let nonce = 1n; nonce <= MESSAGE_COUNT; nonce++) {
      const recipient = ethers.Wallet.createRandom().address
      await relayPool.handle(
        10,
        ethers.zeroPadValue(relayBridgeOptimism, 32),
        encodeData(nonce, recipient, PER_MESSAGE_AMOUNT)
      )
    }

    // Per-message fees all truncate to 0, so both accumulators stay at 0.
    expect(await relayPool.pendingBridgeFees()).to.equal(0)
    expect(
      await relayPool.accumulatedFeesByOrigin(10, relayBridgeOptimism)
    ).to.equal(0)

    // The total outstanding debt is the sum of all dust amounts.
    const totalBridged = MESSAGE_COUNT * PER_MESSAGE_AMOUNT
    expect(await relayPool.outstandingDebt()).to.equal(totalBridged)

    // Compute what the legacy buggy code would have subtracted at claim time.
    const batchFee = (totalBridged * bridgeFee) / FRACTIONAL_BPS_DENOMINATOR
    expect(batchFee).to.be.greaterThan(0n) // batch fee IS non-zero

    // Bridge settles all the dust at once.
    await myToken.transfer(await bridgeProxy.getAddress(), totalBridged)

    // Without the fix, this call would revert with an arithmetic underflow
    // panic (0 - batchFee) inside _claim. With the fix, the subtraction is
    // bounded by accumulatedFeesByOrigin (= 0 here), so the actual fee
    // charged is 0 and the call succeeds.
    await expect(relayPool.claim(10, relayBridgeOptimism))
      .to.emit(relayPool, 'BridgeCompleted')
      .withArgs(10, relayBridgeOptimism, totalBridged, 0n)

    // No fee was actually accrued on chain; pendingBridgeFees stays at 0
    // and the outstanding debt clears to 0.
    expect(await relayPool.pendingBridgeFees()).to.equal(0)
    expect(await relayPool.outstandingDebt()).to.equal(0)
    expect(
      await relayPool.accumulatedFeesByOrigin(10, relayBridgeOptimism)
    ).to.equal(0)
  })

  it('does not consume fees accrued for an unrelated origin', async () => {
    // First, accumulate a real fee on the optimism origin via a normal-sized message.
    const normalAmount = ethers.parseUnits('1')
    const recipient = ethers.Wallet.createRandom().address
    await relayPool.handle(
      10,
      ethers.zeroPadValue(relayBridgeOptimism, 32),
      encodeData(9999n, recipient, normalAmount)
    )
    const opFee = (normalAmount * bridgeFee) / FRACTIONAL_BPS_DENOMINATOR
    expect(opFee).to.be.greaterThan(0n)
    expect(await relayPool.pendingBridgeFees()).to.equal(opFee)
    expect(
      await relayPool.accumulatedFeesByOrigin(10, relayBridgeOptimism)
    ).to.equal(opFee)
    expect(
      await relayPool.accumulatedFeesByOrigin(8453, relayBridgeBase)
    ).to.equal(0)

    // Now spam dust messages on the BASE origin — per-message fees truncate to 0.
    for (let nonce = 1n; nonce <= MESSAGE_COUNT; nonce++) {
      const r = ethers.Wallet.createRandom().address
      await relayPool.handle(
        8453,
        ethers.zeroPadValue(relayBridgeBase, 32),
        encodeData(nonce, r, PER_MESSAGE_AMOUNT)
      )
    }
    // No fees accrued for BASE origin.
    expect(
      await relayPool.accumulatedFeesByOrigin(8453, relayBridgeBase)
    ).to.equal(0)
    // pendingBridgeFees still equals the optimism fee only.
    expect(await relayPool.pendingBridgeFees()).to.equal(opFee)

    // Bridge settles BASE dust. Without per-origin tracking the BASE batch
    // fee would be subtracted from pendingBridgeFees, silently consuming
    // fees that were owed to the OP origin's claim.
    const totalBased = MESSAGE_COUNT * PER_MESSAGE_AMOUNT
    await myToken.transfer(await anotherBridgeProxy.getAddress(), totalBased)

    await expect(relayPool.claim(8453, relayBridgeBase))
      .to.emit(relayPool, 'BridgeCompleted')
      .withArgs(8453, relayBridgeBase, totalBased, 0n)

    // Optimism fee must still be intact.
    expect(await relayPool.pendingBridgeFees()).to.equal(opFee)
    expect(
      await relayPool.accumulatedFeesByOrigin(10, relayBridgeOptimism)
    ).to.equal(opFee)
  })

  it('correctly drains accumulated per-origin fees on a full claim', async () => {
    // Take a snapshot of the current state (carried over from the previous test).
    const opFeeBefore = await relayPool.accumulatedFeesByOrigin(
      10,
      relayBridgeOptimism
    )
    const debtBefore = (
      await relayPool.authorizedOrigins(10, relayBridgeOptimism)
    ).outstandingDebt
    expect(opFeeBefore).to.be.greaterThan(0n)
    expect(debtBefore).to.be.greaterThan(0n)

    // Bridge settles all the optimism debt.
    await myToken.transfer(await bridgeProxy.getAddress(), debtBefore)

    const expectedFee = (debtBefore * bridgeFee) / FRACTIONAL_BPS_DENOMINATOR
    // The batch fee should match what we accumulated for this origin
    // (the only OP message was a normal-sized one earlier; there was no
    // dust on this origin in this scenario).
    expect(expectedFee).to.equal(opFeeBefore)

    await expect(relayPool.claim(10, relayBridgeOptimism))
      .to.emit(relayPool, 'BridgeCompleted')
      .withArgs(10, relayBridgeOptimism, debtBefore, expectedFee)

    expect(
      await relayPool.accumulatedFeesByOrigin(10, relayBridgeOptimism)
    ).to.equal(0)
  })
})
