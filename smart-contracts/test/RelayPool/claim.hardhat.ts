import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import { encodeData } from './hyperlane.hardhat'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import {
  MyOpStackPortal,
  MyWeth,
  MyYieldPool,
  RelayPool,
} from '../../typechain-types'
import OPStackNativeBridgeProxyModule from '../../ignition/modules/OPStackNativeBridgeProxyModule'

const relayBridgeOptimism = '0x0000000000000000000000000000000000000010'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'
const portalProxy = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e'

const origins = []

describe.skip('RelayBridge: claim', () => {
  let relayPool: RelayPool
  let myWeth: MyWeth
  let thirdPartyPool: MyYieldPool
  let userAddress: string
  let myOpStackPortal: MyOpStackPortal

  before(async () => {
    const [user] = await ethers.getSigners()
    userAddress = await user.getAddress()

    myWeth = await ethers.deployContract('MyWeth')

    // deploy 3rd party pool
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myWeth.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])
    const thirdPartyPoolAddress = await thirdPartyPool.getAddress()
    // Initialize the pool with a little bit of funds
    const initialDeposit = ethers.parseEther('1')
    await myWeth.deposit({ value: initialDeposit })
    await myWeth.approve(thirdPartyPoolAddress, initialDeposit)
    await thirdPartyPool.deposit(initialDeposit, userAddress)

    myOpStackPortal = await ethers.deployContract('MyOpStackPortal')
    // Fund the portal so it can simulate bridging of eth
    await user.sendTransaction({
      to: myOpStackPortal,
      value: ethers.parseEther('1'), // 1 ether
    })

    // deploy the pool using ignition
    const parameters = {
      RelayPool: {
        hyperlaneMailbox: userAddress, // networks[1].hyperlaneMailbox,
        asset: await myWeth.getAddress(),
        name: `${await myWeth.name()} Relay Pool`,
        symbol: `${await myWeth.symbol()}-REL`,
        origins: [],
        thirdPartyPool: thirdPartyPoolAddress,
        weth: await myWeth.getAddress(),
        curator: userAddress,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))

    // Add origins
    const bridgeProxyParameters = {
      OPStackNativeBridgeProxy: {
        portalProxy,
        relayPoolChainId: 1,
        relayPool: await relayPool.getAddress(),
        l1BridgeProxy,
      },
    }
    const { bridge } = await ignition.deploy(OPStackNativeBridgeProxyModule, {
      parameters: bridgeProxyParameters,
    })

    origins.push({
      chainId: 10,
      bridge: relayBridgeOptimism,
      maxDebt: ethers.parseEther('10'),
      proxyBridge: await bridge.getAddress(),
      bridgeFee: 10,
      curator: userAddress,
      coolDown: 0,
    })

    relayPool.addOrigin(origins[0])

    // Fund the pool with some WETH
    await myWeth.deposit({ value: ethers.parseEther('3') })
    await myWeth.approve(await relayPool.getAddress(), ethers.parseEther('3'))
    await relayPool.deposit(ethers.parseEther('3'), userAddress)
  })

  it('should fail to claim from an unauthorized chain', async () => {
    const originChain = 666
    const originBridge = ethers.ZeroAddress
    await expect(relayPool.claim(originChain, originBridge))
      .to.be.revertedWithCustomError(relayPool, 'UnauthorizedOrigin')
      .withArgs(originChain, originBridge)
  })

  it('should fail to claim from an unauthorized contract', async () => {
    const originBridge = ethers.ZeroAddress
    await expect(relayPool.claim(origins[0].chainId, originBridge))
      .to.be.revertedWithCustomError(relayPool, 'UnauthorizedOrigin')
      .withArgs(origins[0].chainId, originBridge)
  })

  it('should claim from the origin contract', async () => {
    const [user] = await ethers.getSigners()

    const bridgedAmount = ethers.parseEther('0.2')

    // Borrow from the pool so we can claim later
    await relayPool.handle(
      origins[0].chainId,
      ethers.zeroPadValue(origins[0].bridge, 32),
      encodeData(5n, userAddress, bridgedAmount)
    )

    // Send the funds to the bridgeProxy (simulate successful bridging)
    await user.sendTransaction({
      to: origins[0].l1BridgeProxy,
      value: bridgedAmount,
    })

    const myOpStackPortalBalance =
      await ethers.provider.getBalance(myOpStackPortal)

    await relayPool.claim(origins[0].chainId, origins[0].bridge)
    const myOpStackPortalBalanceAfter =
      await ethers.provider.getBalance(myOpStackPortal)

    expect(myOpStackPortalBalance - myOpStackPortalBalanceAfter).to.equal(
      bridgedAmount
    )
  })

  it('should fail if the delegate call fails')

  it('should update the outstanding debts', async () => {
    const abiCoder = new ethers.AbiCoder()
    const relayPoolAddress = await relayPool.getAddress()
    const bridgedAmount = ethers.parseEther('0.15')
    const transaction = abiCoder.encode(
      ['uint256', 'address', 'address', 'uint256', 'uint256', 'bytes'],
      [
        123, // nonce,
        origins[0].bridge, // sender,
        relayPoolAddress, // target,
        bridgedAmount, // value,
        ethers.parseEther('0.0001'), // minGasLimit,
        '0x', // message
      ]
    )

    // Borrow from the pool so we can claim later
    await relayPool.handle(
      origins[0].chainId,
      ethers.zeroPadValue(origins[0].bridge, 32),
      encodeData(6n, userAddress, bridgedAmount)
    )

    const outstandingDebtBefore = await relayPool.outstandingDebt()
    const originSettingsBefore = await relayPool.authorizedOrigins(
      origins[0].chainId,
      origins[0].bridge
    )

    await relayPool.claim(origins[0].chainId, origins[0].bridge)
    const outstandingDebtAfter = await relayPool.outstandingDebt()
    const originSettingsAfter = await relayPool.authorizedOrigins(
      origins[0].chainId,
      origins[0].bridge
    )

    expect(outstandingDebtBefore - outstandingDebtAfter).to.equal(bridgedAmount)
    expect(
      originSettingsBefore.outstandingDebt - originSettingsAfter.outstandingDebt
    ).to.equal(bridgedAmount)
  })

  it('should desposit the funds in the 3rd party pool but total assets should remain unchanged', async () => {
    const abiCoder = new ethers.AbiCoder()
    const relayPoolAddress = await relayPool.getAddress()
    const bridgedAmount = ethers.parseEther('0.033')

    const transaction = abiCoder.encode(
      ['uint256', 'address', 'address', 'uint256', 'uint256', 'bytes'],
      [
        123, // nonce,
        origins[0].bridge, // sender,
        relayPoolAddress, // target,
        bridgedAmount, // value,
        ethers.parseEther('0.0001'), // minGasLimit,
        '0x', // message
      ]
    )

    // Borrow from the pool so we can claim later
    await relayPool.handle(
      origins[0].chainId,
      ethers.zeroPadValue(origins[0].bridge, 32),
      encodeData(7n, userAddress, bridgedAmount)
    )

    const streamingPeriod = await relayPool.streamingPeriod()
    await ethers.provider.send('evm_increaseTime', [
      Number(streamingPeriod * 2n),
    ])
    await relayPool.updateStreamedAssets()
    const poolAssetsBefore = await relayPool.totalAssets()

    const relayPoolBalanceBefore =
      await thirdPartyPool.balanceOf(relayPoolAddress)

    await relayPool.claim(origins[0].chainId, origins[0].bridge)

    const poolAssetsAfter = await relayPool.totalAssets()

    const relayPoolBalanceAfter =
      await thirdPartyPool.balanceOf(relayPoolAddress)
    // Assets remain unchanged (they were previously accounted for "in the bridge")
    expect(poolAssetsAfter).to.equal(poolAssetsBefore)

    // But the balance of the relay pool in the 3rd party pool should have increased
    expect(relayPoolBalanceAfter - relayPoolBalanceBefore).to.equal(
      bridgedAmount
    )
  })
})
