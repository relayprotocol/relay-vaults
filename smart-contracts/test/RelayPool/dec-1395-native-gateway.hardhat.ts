import { expect } from 'chai'
import { ethers } from 'hardhat'

const deployFixture = async () => {
  const [user] = await ethers.getSigners()
  const userAddress = await user.getAddress()
  const weth = await ethers.deployContract('MyWeth')
  const yieldPool = await ethers.deployContract('MyYieldPool', [
    await weth.getAddress(),
    'My Yield Pool',
    'YIELD',
  ])
  const relayPool = await ethers.deployContract('RelayPool', [
    userAddress,
    await weth.getAddress(),
    'WETH RELAY POOL',
    'WETH-REL',
    await yieldPool.getAddress(),
    await weth.getAddress(),
    userAddress,
  ])
  const nativeGateway = await ethers.deployContract('RelayPoolNativeGateway', [
    await weth.getAddress(),
  ])

  return { nativeGateway, relayPool, userAddress, weth, yieldPool }
}

const setHighSharePrice = async () => {
  const fixture = await deployFixture()

  await fixture.nativeGateway.deposit(
    await fixture.relayPool.getAddress(),
    fixture.userAddress,
    0,
    { value: 3n }
  )

  await fixture.weth.deposit({ value: 9997n })
  await fixture.weth.transfer(await fixture.yieldPool.getAddress(), 9997n)

  expect(await fixture.relayPool.totalSupply()).to.equal(3n)
  expect(await fixture.relayPool.totalAssets()).to.equal(10000n)

  return fixture
}

describe('DEC-1395 RelayPoolNativeGateway mint rounding', () => {
  it('does not strand WETH when mint is called in a high share-price state', async () => {
    const { nativeGateway, relayPool, userAddress, weth } =
      await setHighSharePrice()

    const expectedShares = await relayPool.convertToShares(9999n)
    const assetsRequiredToMintExpectedShares =
      await relayPool.previewMint(expectedShares)
    expect(expectedShares).to.equal(2n)
    expect(assetsRequiredToMintExpectedShares).to.equal(6667n)

    const sharesBefore = await relayPool.balanceOf(userAddress)
    const totalAssetsBefore = await relayPool.totalAssets()

    await nativeGateway.mint(await relayPool.getAddress(), userAddress, 0, {
      value: 9999n,
    })

    expect(await relayPool.balanceOf(userAddress)).to.equal(
      sharesBefore + expectedShares
    )
    expect(await relayPool.totalAssets()).to.equal(totalAssetsBefore + 9999n)
    expect(await weth.balanceOf(await nativeGateway.getAddress())).to.equal(0n)
  })
})
