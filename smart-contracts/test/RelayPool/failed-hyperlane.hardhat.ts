import { expect } from 'chai'
import { AbiCoder } from 'ethers'
import { ethers, ignition } from 'hardhat'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import {
  MyToken,
  MyWeth,
  MyYieldPool,
  OPStackNativeBridgeProxy,
  RelayPool,
} from '../../typechain-types'
import OPStackNativeBridgeProxyModule from '../../ignition/modules/OPStackNativeBridgeProxyModule'

const relayBridgeOptimism = '0x0000000000000000000000000000000000000010'
const portalProxy = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e'

const now = () => Math.floor(new Date().getTime() / 1000)

export const encodeData = (
  nonce: bigint,
  recipient: string,
  amount: bigint,
  timestamp?: number
) => {
  const abiCoder = new AbiCoder()
  const types = ['uint256', 'address', 'uint256', 'uint256']
  return abiCoder.encode(types, [nonce, recipient, amount, timestamp || now()])
}

describe('RelayPool: when a message was never received from Hyperlane', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let thirdPartyPool: MyYieldPool
  let myWeth: MyWeth
  let bridgeProxy: OPStackNativeBridgeProxy

  before(async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    myToken = await ethers.deployContract('MyToken', ['My Token', 'TOKEN'])
    expect(await myToken.totalSupply()).to.equal(1000000000000000000000000000n)

    myWeth = await ethers.deployContract('MyWeth')

    // deploy 3rd party pool
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])
    // deploy the pool using ignition
    const parameters = {
      RelayPool: {
        // using the user address as the mailbox so we can send transactions!
        asset: await myToken.getAddress(),
        curator: userAddress,
        hyperlaneMailbox: userAddress,
        name: 'ERC20 RELAY POOL',

        symbol: 'ERC20-REL',
        thirdPartyPool: await thirdPartyPool.getAddress(),
        weth: await myWeth.getAddress(),
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))

    const bridgeProxyParameters = {
      OPStackNativeBridgeProxy: {
        l1BridgeProxy: ethers.ZeroAddress,
        portalProxy,
        relayPool: await relayPool.getAddress(),
        relayPoolChainId: 31337,
      },
    }
    const { bridge } = await ignition.deploy(OPStackNativeBridgeProxyModule, {
      parameters: bridgeProxyParameters,
    })
    bridgeProxy = bridge

    await relayPool.addOrigin({
      bridge: relayBridgeOptimism,
      bridgeFee: 0,
      chainId: 10,
      coolDown: 10,
      curator: userAddress,
      maxDebt: ethers.parseEther('10'),
      proxyBridge: await bridgeProxy.getAddress(), // 10 seconds!
    })

    const liquidity = ethers.parseUnits('100', 18)
    await myToken.connect(user).mint(liquidity)
    await myToken.connect(user).approve(await relayPool.getAddress(), liquidity)
    await relayPool.connect(user).deposit(liquidity, await user.getAddress())
  })

  it('should ensure the handle function can only be called by the curator', async () => {
    const [, anotherUser] = await ethers.getSigners()
    const anotherUserAddress = await anotherUser.getAddress()
    await expect(
      relayPool
        .connect(anotherUser)
        .processFailedHandler(
          10,
          relayBridgeOptimism,
          encodeData(1n, anotherUserAddress, ethers.parseUnits('1'))
        )
    )
      .to.be.revertedWithCustomError(relayPool, 'OwnableUnauthorizedAccount')
      .withArgs(anotherUserAddress)
  })

  it('should refuse to handle messages that have already been handled', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const amount = ethers.parseUnits('1')

    // Send funds to the proxyBridge
    await myToken.connect(user).transfer(await bridgeProxy.getAddress(), amount)

    // should work!
    await relayPool.processFailedHandler(
      10,
      relayBridgeOptimism,
      encodeData(2n, userAddress, amount)
    )

    // should fail!
    await expect(
      relayPool.processFailedHandler(
        10,
        relayBridgeOptimism,
        encodeData(2n, userAddress, ethers.parseUnits('1'))
      )
    )
      .to.be.revertedWithCustomError(relayPool, 'MessageAlreadyProcessed')
      .withArgs(10, relayBridgeOptimism, 2n)
  })

  it('should refuse to handle messages that have already been handled regularly', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()

    const message = await encodeData(3n, userAddress, ethers.parseUnits('1'))

    // should work!
    await relayPool
      .connect(user)
      .handle(10, ethers.zeroPadValue(relayBridgeOptimism, 32), message)

    // should fail!
    await expect(
      relayPool.processFailedHandler(10, relayBridgeOptimism, message)
    )
      .to.be.revertedWithCustomError(relayPool, 'MessageAlreadyProcessed')
      .withArgs(10, relayBridgeOptimism, 3n)
  })

  it('should send funds to the recipient and have the correct accounting', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const amount = ethers.parseUnits('1')
    // Send funds to the proxyBridge
    await myToken.connect(user).transfer(await bridgeProxy.getAddress(), amount)

    const userBalanceBefore = await myToken.balanceOf(userAddress)
    // should work!
    await relayPool.processFailedHandler(
      10,
      relayBridgeOptimism,
      encodeData(4n, userAddress, amount)
    )
    const userBalanceAfter = await myToken.balanceOf(userAddress)
    expect(userBalanceAfter - userBalanceBefore).to.equal(amount)
  })

  it('should fail if the funds never actually arrived on the bridge', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const amount = ethers.parseUnits('1')

    // Send some funds to the proxyBridge but not enough
    await myToken
      .connect(user)
      .transfer(await bridgeProxy.getAddress(), amount / 2n)

    await expect(
      relayPool.processFailedHandler(
        10,
        relayBridgeOptimism,
        encodeData(5n, userAddress, amount)
      )
    )
      .to.revertedWithCustomError(relayPool, 'InsufficientFunds')
      .withArgs(amount / 2n, amount)
  })
})

describe('RelayPool: processFailedHandler with a non-zero bridge fee', () => {
  const relayBridgeBase = '0x0000000000000000000000000000000000008453'
  const bridgeFee = BigInt(1_000_000_000) // 1% in fractional bps
  const FRACTIONAL_BPS_DENOMINATOR = BigInt(100_000_000_000)

  let relayPool: RelayPool
  let myToken: MyToken
  let thirdPartyPool: MyYieldPool
  let myWeth: MyWeth
  let bridgeProxy: OPStackNativeBridgeProxy
  let anotherBridgeProxy: OPStackNativeBridgeProxy

  before(async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
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
        hyperlaneMailbox: userAddress,
        name: 'ERC20 RELAY POOL',
        symbol: 'ERC20-REL',
        thirdPartyPool: await thirdPartyPool.getAddress(),
        weth: await myWeth.getAddress(),
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))

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

    const liquidity = ethers.parseUnits('100', 18)
    await myToken.connect(user).mint(liquidity)
    await myToken.connect(user).approve(await relayPool.getAddress(), liquidity)
    await relayPool.connect(user).deposit(liquidity, userAddress)
  })

  it('should not underflow pendingBridgeFees when the message never went through handle', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const amount = ethers.parseUnits('1')

    // Sanity: pendingBridgeFees starts at 0, so any subtraction underflows.
    expect(await relayPool.pendingBridgeFees()).to.equal(0)

    // Simulate the slow bridge eventually delivering funds to the proxy,
    // without any prior successful Hyperlane `handle` (so fees were never
    // added to pendingBridgeFees).
    await myToken.connect(user).transfer(await bridgeProxy.getAddress(), amount)

    await relayPool.processFailedHandler(
      10,
      relayBridgeOptimism,
      encodeData(100n, userAddress, amount)
    )

    // Without the fix the subtraction inside claim would revert here.
    expect(await relayPool.pendingBridgeFees()).to.equal(0)
  })

  it('should emit BridgeCompleted with zero fees and not stream any fee assets', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const amount = ethers.parseUnits('1')

    await myToken.connect(user).transfer(await bridgeProxy.getAddress(), amount)

    const totalAssetsToStreamBefore = await relayPool.totalAssetsToStream()

    await expect(
      relayPool.processFailedHandler(
        10,
        relayBridgeOptimism,
        encodeData(101n, userAddress, amount)
      )
    )
      .to.emit(relayPool, 'BridgeCompleted')
      .withArgs(10, relayBridgeOptimism, amount, 0n)

    // Streaming accounting must not include any fake fee amount.
    const totalAssetsToStreamAfter = await relayPool.totalAssetsToStream()
    expect(totalAssetsToStreamAfter).to.equal(totalAssetsToStreamBefore)
  })

  it('should send the full message amount to the recipient (no fee deduction on rescue path)', async () => {
    const [user] = await ethers.getSigners()
    const recipientAddress = ethers.Wallet.createRandom().address
    const amount = ethers.parseUnits('1')

    await myToken.connect(user).transfer(await bridgeProxy.getAddress(), amount)

    const recipientBalanceBefore = await myToken.balanceOf(recipientAddress)

    await relayPool.processFailedHandler(
      10,
      relayBridgeOptimism,
      encodeData(102n, recipientAddress, amount)
    )

    const recipientBalanceAfter = await myToken.balanceOf(recipientAddress)
    expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(amount)
  })

  it('should not consume fees accrued from a successful handle on another message', async () => {
    const [user] = await ethers.getSigners()
    const recipientAddress = ethers.Wallet.createRandom().address
    const amount = ethers.parseUnits('1')

    // A normal Hyperlane message successfully goes through `handle` on one
    // origin, which accumulates some pendingBridgeFees.
    await relayPool.handle(
      10,
      ethers.zeroPadValue(relayBridgeOptimism, 32),
      encodeData(200n, recipientAddress, amount)
    )
    const expectedFee = (amount * bridgeFee) / FRACTIONAL_BPS_DENOMINATOR
    const pendingFeesAfterHandle = await relayPool.pendingBridgeFees()
    expect(pendingFeesAfterHandle).to.be.greaterThanOrEqual(expectedFee)

    // Now a separate message on a different origin fails to deliver via
    // Hyperlane but the funds eventually arrive and are rescued through
    // processFailedHandler. This must not touch the pendingBridgeFees that
    // was accumulated for the first, unrelated message.
    await myToken
      .connect(user)
      .transfer(await anotherBridgeProxy.getAddress(), amount)

    await relayPool.processFailedHandler(
      8453,
      relayBridgeBase,
      encodeData(201n, recipientAddress, amount)
    )

    expect(await relayPool.pendingBridgeFees()).to.equal(pendingFeesAfterHandle)
  })

  it('should still correctly decrement pendingBridgeFees on the normal claim path', async () => {
    const [user] = await ethers.getSigners()
    const recipientAddress = ethers.Wallet.createRandom().address
    const amount = ethers.parseUnits('1')

    const pendingFeesBefore = await relayPool.pendingBridgeFees()

    // Go through the normal hyperlane path to accumulate a fee for this nonce
    await relayPool.handle(
      10,
      ethers.zeroPadValue(relayBridgeOptimism, 32),
      encodeData(300n, recipientAddress, amount)
    )
    const addedFee = (amount * bridgeFee) / FRACTIONAL_BPS_DENOMINATOR
    expect(await relayPool.pendingBridgeFees()).to.equal(
      pendingFeesBefore + addedFee
    )

    // Deliver the bridged funds and claim via the regular path
    await myToken.connect(user).transfer(await bridgeProxy.getAddress(), amount)
    await expect(relayPool.claim(10, relayBridgeOptimism))
      .to.emit(relayPool, 'BridgeCompleted')
      .withArgs(10, relayBridgeOptimism, amount, addedFee)

    // The claim should have deducted exactly the fee that was added, returning
    // pendingBridgeFees to where it was before this test started.
    expect(await relayPool.pendingBridgeFees()).to.equal(pendingFeesBefore)
  })
})
