import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import { networks } from '@relay-vaults/networks'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyToken, MyYieldPool, RelayPool } from '../../typechain-types'

// Regression test for DEC-1394 / VIG-RV-003:
// `remainsToStream()` divides by `(endOfStream - lastAssetsCollectedAt)`. The
// only way to make that denominator zero through the public API was to set
// `streamingPeriod = 0`: a subsequent fee-collecting claim then set
// `endOfStream == lastAssetsCollectedAt == block.timestamp`, and any
// `totalAssets()` call landing in that same block hit `0 / 0` (Panic 0x12).
// Two complementary fixes:
//   1. `updateStreamingPeriod(0)` now reverts, removing the root cause.
//   2. `remainsToStream()` guards with `>=` instead of `>`, so the equality
//      case returns 0 instead of dividing by zero (defense in depth).
describe('RelayPool: streaming period guards', () => {
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
  })

  it('reverts when setting the streaming period to zero', async () => {
    await expect(
      relayPool.updateStreamingPeriod(0)
    ).to.be.revertedWithCustomError(relayPool, 'StreamingPeriodMustBePositive')
    // The period is left unchanged.
    expect(await relayPool.streamingPeriod()).to.be.greaterThan(0)
  })

  it('still allows setting a positive streaming period', async () => {
    const newPeriod = 3 * 24 * 60 * 60 // 3 days
    await relayPool.updateStreamingPeriod(newPeriod)
    expect(await relayPool.streamingPeriod()).to.equal(newPeriod)
  })

  it('keeps totalAssets() callable at exactly endOfStream (>= guard)', async () => {
    // Build a streaming reserve (`remainsToStream()` > 0) by collecting assets.
    const streamed = ethers.parseEther('2')
    await myToken.transfer(await relayPool.getAddress(), streamed)
    await relayPool.collectNonDepositedAssets()

    const endOfStream = await relayPool.endOfStream()
    const totalDuringStream = await relayPool.totalAssets()

    // Mine a block whose timestamp is exactly endOfStream. Under the old `>`
    // guard the equality case fell through to the division; the `>=` guard now
    // returns 0. Either way this must not revert, and the full reserve is
    // released once streaming has completed.
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      Number(endOfStream),
    ])
    await ethers.provider.send('evm_mine', [])

    const block = await ethers.provider.getBlock('latest')
    expect(block!.timestamp).to.equal(Number(endOfStream))

    const totalAtBoundary = await relayPool.totalAssets()
    // At endOfStream nothing remains to stream, so the reserve is fully counted.
    expect(totalAtBoundary).to.be.greaterThan(totalDuringStream)
  })
})
