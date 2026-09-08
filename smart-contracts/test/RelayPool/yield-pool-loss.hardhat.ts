import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import { networks } from '@relay-vaults/networks'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyToken, MyYieldPool, RelayPool } from '../../typechain-types'

// Regression test for DEC-1305 / VIG-VAU-017:
// `totalAssets()` computes `yieldPoolBalance + outstandingDebt - pendingBridgeFees
// - remainsToStream()`. The subtracted reserves (pending fees and un-streamed
// yield) are physically held in the yield pool, so the pool assumes they are
// always covered by `yieldPoolBalance`. If the yield pool suffers a severe
// principal loss (depeg, bad debt, slashing), `yieldPoolBalance` drops below the
// reserves and the (previously unguarded) checked subtraction would underflow,
// permanently reverting every ERC4626 entry point. The guard clamps to 0 instead.
describe('RelayPool: yield pool loss / totalAssets underflow', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let thirdPartyPool: MyYieldPool
  let userAddress: string

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
    const thirdPartyPoolAddress = await thirdPartyPool.getAddress()

    // seed the yield pool with a little liquidity
    await myToken.approve(thirdPartyPoolAddress, ethers.parseEther('1'))
    await thirdPartyPool.deposit(ethers.parseEther('1'), userAddress)

    const parameters = {
      RelayPool: {
        asset: await myToken.getAddress(),
        curator: userAddress,
        hyperlaneMailbox: networks[1].hyperlaneMailbox,
        name: `${await myToken.name()} Relay Pool`,
        symbol: `${await myToken.symbol()}-REL`,
        thirdPartyPool: thirdPartyPoolAddress,
        weth: ethers.ZeroAddress,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, { parameters }))

    // LP provides liquidity
    const deposit = ethers.parseEther('3')
    await myToken.approve(await relayPool.getAddress(), deposit)
    await relayPool.deposit(deposit, userAddress)

    // Build a non-trivial streaming reserve (`remainsToStream()` > 0) without any
    // outstanding debt: send assets to the pool and collect them. They get
    // deposited into the yield pool and streamed over `streamingPeriod`.
    const streamed = ethers.parseEther('2')
    await myToken.transfer(await relayPool.getAddress(), streamed)
    await relayPool.collectNonDepositedAssets()
  })

  it('reports totalAssets normally while the yield pool is solvent', async () => {
    // Sanity: with a healthy yield pool, totalAssets is positive and the streamed
    // reserve is excluded (it is still being streamed in).
    expect(await relayPool.totalAssets()).to.be.greaterThan(0)
    expect(await relayPool.outstandingDebt()).to.equal(0)
  })

  it('still reports a positive value after a mild yield pool loss', async () => {
    const poolBalance = await myToken.balanceOf(
      await thirdPartyPool.getAddress()
    )
    // ~10% principal loss - well above the reserves, so no underflow.
    await myToken.burnFor(poolBalance / 10n, await thirdPartyPool.getAddress())
    expect(await relayPool.totalAssets()).to.be.greaterThan(0)
  })

  it('clamps totalAssets to 0 (instead of reverting) on a catastrophic loss', async () => {
    // Wipe out essentially all of the yield pool's principal so that
    // yieldPoolBalance < remainsToStream(). Without the guard the checked
    // subtraction in totalAssets() would panic (Panic 0x11, arithmetic underflow)
    // and permanently brick the vault.
    const poolBalance = await myToken.balanceOf(
      await thirdPartyPool.getAddress()
    )
    await myToken.burnFor(
      poolBalance - ethers.parseEther('0.0001'),
      await thirdPartyPool.getAddress()
    )

    // The guard returns 0 rather than reverting.
    expect(await relayPool.totalAssets()).to.equal(0)
  })

  it('keeps view-based ERC4626 entry points callable when impaired', async () => {
    // These all route through totalAssets(); previously they panicked, bricking
    // integrators and frontends. They must now return 0 gracefully.
    const shares = await relayPool.balanceOf(userAddress)
    expect(await relayPool.convertToAssets(shares)).to.equal(0)
    expect(await relayPool.maxWithdraw(userAddress)).to.equal(0)
    expect(await relayPool.previewRedeem(shares)).to.equal(0)
  })
})
