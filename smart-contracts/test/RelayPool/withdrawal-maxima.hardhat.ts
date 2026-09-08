import { expect } from 'chai'
import { AbiCoder } from 'ethers'
import { ethers, ignition } from 'hardhat'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyToken, MyYieldPool, RelayPool } from '../../typechain-types'

const relayBridgeOptimism = '0x0000000000000000000000000000000000000010'
const oPStackNativeBridgeProxy = '0x0000000000000000000000000000000000000010'

const encodeData = (nonce: bigint, recipient: string, amount: bigint) => {
  const abiCoder = new AbiCoder()
  const types = ['uint256', 'address', 'uint256', 'uint256']
  return abiCoder.encode(types, [
    nonce,
    recipient,
    amount,
    Math.floor(new Date().getTime() / 1000) - 60,
  ])
}

// Regression test for DEC-1386:
// `maxWithdraw`/`maxRedeem` used to return the owner's full pro-rata claim on
// `totalAssets()`, which includes `outstandingDebt` (bridged funds loaned out
// but not yet claimed). The actual withdrawal path (`beforeWithdraw`) pulls the
// full amount from the yield pool, which only holds the liquid portion, so
// `withdraw(maxWithdraw(owner))` reverted whenever debt was outstanding —
// violating ERC4626 ("MUST NOT be higher than the actual maximum"). Both maxima
// are now capped by the yield pool's own withdrawal capacity.
describe('RelayPool: withdrawal maxima with outstanding debt', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let thirdPartyPool: MyYieldPool
  let userAddress: string

  const liquidity = ethers.parseUnits('100', 18)
  const loanAmount = ethers.parseUnits('20', 18)

  before(async () => {
    const [user] = await ethers.getSigners()
    userAddress = await user.getAddress()

    myToken = await ethers.deployContract('MyToken', ['My Token', 'TOKEN'])

    // deploy 3rd party (yield) pool
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])

    const parameters = {
      RelayPool: {
        asset: await myToken.getAddress(),
        curator: userAddress,
        // using the user address as the mailbox so we can send transactions!
        hyperlaneMailbox: userAddress,
        name: `${await myToken.name()} Relay Pool`,
        symbol: `${await myToken.symbol()}-REL`,
        thirdPartyPool: await thirdPartyPool.getAddress(),
        weth: ethers.ZeroAddress,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, { parameters }))

    await relayPool.addOrigin({
      bridge: relayBridgeOptimism,
      bridgeFee: 0,
      chainId: 10,
      coolDown: 0,
      curator: userAddress,
      maxDebt: ethers.parseEther('50'),
      proxyBridge: oPStackNativeBridgeProxy,
    })

    // LP provides liquidity
    await myToken.approve(await relayPool.getAddress(), liquidity)
    await relayPool.deposit(liquidity, userAddress)

    // A bridge message loans out funds: outstandingDebt grows while the
    // yield pool only keeps the remaining liquid portion.
    const [, recipient] = await ethers.getSigners()
    await relayPool.handle(
      10,
      ethers.zeroPadValue(relayBridgeOptimism, 32),
      encodeData(1n, await recipient.getAddress(), loanAmount)
    )
  })

  it('advertises only the liquid portion while debt is outstanding', async () => {
    expect(await relayPool.outstandingDebt()).to.equal(loanAmount)

    const shares = await relayPool.balanceOf(userAddress)
    const fullEntitlement = await relayPool.convertToAssets(shares)
    // The owner's full claim still includes the loaned-out funds...
    expect(fullEntitlement).to.equal(liquidity)

    // ...but the maxima only advertise what the yield pool can actually serve
    expect(await relayPool.maxWithdraw(userAddress)).to.equal(
      liquidity - loanAmount
    )
    expect(await relayPool.maxRedeem(userAddress)).to.equal(
      await relayPool.convertToShares(liquidity - loanAmount)
    )
  })

  it('reverts when withdrawing more than maxWithdraw (the pre-fix behavior)', async () => {
    // This is exactly what an ERC4626 integrator used to hit when calling
    // withdraw(maxWithdraw(owner)) with the previous implementation.
    await expect(relayPool.withdraw(liquidity, userAddress, userAddress)).to.be
      .reverted
  })

  it('lets the owner withdraw exactly maxWithdraw', async () => {
    const maxWithdraw = await relayPool.maxWithdraw(userAddress)
    const balanceBefore = await myToken.balanceOf(userAddress)

    await relayPool.withdraw(maxWithdraw, userAddress, userAddress)

    expect(await myToken.balanceOf(userAddress)).to.equal(
      balanceBefore + maxWithdraw
    )

    // The remaining entitlement is fully debt-backed, so nothing more is
    // withdrawable until the bridge is claimed.
    expect(await relayPool.balanceOf(userAddress)).to.be.greaterThan(0)
    expect(await relayPool.maxWithdraw(userAddress)).to.equal(0)
    expect(await relayPool.maxRedeem(userAddress)).to.equal(0)
  })
})
