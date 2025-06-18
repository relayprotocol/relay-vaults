import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import { networks } from '@relay-vaults/networks'
import { IUSDC, ERC4626, RelayPool } from '../../typechain-types'
import { mintUSDC } from '../utils/hardhat'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { getEvents } from '@relay-vaults/helpers'

const {
  assets: { usdc: USDC, weth },
} = networks[1]

const USDC_MORPHO_POOL = '0xd63070114470f685b75B74D60EEc7c1113d33a3D'

// deposit txs, for reference
// const WETH_MORPHO_POOL = '0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0'
// WETH: https://etherscan.io/tx/0x038ba440b1cf7cfc0a326832db1cb63cb0c8b7c6a98927df5304e6f3e0935e65
// USDC: https://basescan.org/tx/0x3d3bcf5e73135f9c42e4f34cfef3e43d055303df6d26da28e5284d600869ca5d

describe('RelayBridge: use Morpho yield pool (WETH)', () => {
  let relayPool: RelayPool
  let usdc: IUSDC
  let morphoUsdcPool: ERC4626
  let userAddress: string

  before(async () => {
    const { chainId } = await ethers.provider.getNetwork()
    const [user] = await ethers.getSigners()
    userAddress = await user.getAddress()

    usdc = await ethers.getContractAt('IUSDC', USDC)
    await mintUSDC(USDC, userAddress, ethers.parseUnits('1000', 6))

    // get Morpho static wrapper
    morphoUsdcPool = await ethers.getContractAt('ERC4626', USDC_MORPHO_POOL)

    // deploy the pool
    const parameters = {
      RelayPool: {
        asset: await usdc.getAddress(),
        curator: userAddress,
        hyperlaneMailbox: networks[1].hyperlaneMailbox,
        name: `${await usdc.name()} Relay Pool`,
        symbol: `${await usdc.symbol()}-REL`,
        thirdPartyPool: USDC_MORPHO_POOL,
        weth,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      deploymentId: `RelayPool-${parameters.RelayPool.symbol}-${chainId.toString()}`,
      parameters,
    }))
  })

  it('should have correct asset', async () => {
    expect(await morphoUsdcPool.asset()).to.equal(USDC)
  })

  it('should deposit tokens into the Morpho yield pool when a user deposits funds', async () => {
    const [user] = await ethers.getSigners()
    const amount = ethers.parseUnits('1', 6)
    const userAddress = await user.getAddress()
    const relayPoolAddress = await relayPool.getAddress()

    // pool starts with no morpho shares
    expect(await morphoUsdcPool.balanceOf(relayPoolAddress)).to.equal(0)

    // Approved the Token to be spent by the RelayPool
    await (await usdc.connect(user).approve(relayPoolAddress, amount)).wait()

    // Deposit tokens to the RelayPool
    const tx = await relayPool.connect(user).deposit(amount, userAddress)
    const receipt = await tx.wait()

    // Check balances
    expect(await usdc.balanceOf(relayPoolAddress)).to.equal(0)
    expect(await relayPool.balanceOf(userAddress)).to.equal(amount)

    // pool has morpho shares
    const expectedMorphoShares = await morphoUsdcPool.previewDeposit(amount)
    expect(await morphoUsdcPool.balanceOf(relayPoolAddress)).to.equal(
      expectedMorphoShares
    )

    // make sure USDC transfers happenned
    // 3 transfers: user > relayPool, relayPool > morpho vault, morpho vault > morpho blue
    const { events: usdcTransfers } = await getEvents(
      receipt!,
      'Transfer',
      USDC
    )
    expect(usdcTransfers.length).to.be.equal(3)
  }).timeout(1000000)

  it('should deposit tokens into the Morpho yield pool when a user mints shares', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const relayPoolAddress = await relayPool.getAddress()

    const newShares = ethers.parseUnits('0.4', 6)

    // pool starts with some morpho tokens
    const morphoBalance = await morphoUsdcPool.balanceOf(relayPoolAddress)
    expect(morphoBalance).to.not.equal(0)

    // Preview the mint to get the amount of tokens to be deposited
    const amount = await relayPool.previewMint(newShares)

    // Approve the Token to be spent by the RelayPool
    await usdc.connect(user).approve(await relayPool.getAddress(), amount)

    // Deposit tokens to the RelayPool
    await relayPool.connect(user).mint(newShares, userAddress)

    // Check balances
    expect(await usdc.balanceOf(relayPoolAddress)).to.equal(0)
    const expectedMorphoShares = await morphoUsdcPool.previewDeposit(amount)
    expect(await morphoUsdcPool.balanceOf(relayPoolAddress)).to.equal(
      morphoBalance + expectedMorphoShares
    )
  })

  it('should withdraw tokens from the Morpho yield pool when withdrawing liquidity', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    const relayPoolAddress = await relayPool.getAddress()

    // pool starts with some morpho tokens
    const morphoBalance = await morphoUsdcPool.balanceOf(relayPoolAddress)
    expect(morphoBalance).to.not.equal(0)

    // Withdraw tokens from the RelayPool
    const withdrawAmount = ethers.parseUnits('0.5', 6)
    await relayPool
      .connect(user)
      .withdraw(withdrawAmount, userAddress, userAddress)
    expect(await usdc.balanceOf(relayPoolAddress)).to.equal(0)

    // morpho pool tokens have been withdrawn from pool
    expect(await morphoUsdcPool.balanceOf(relayPoolAddress)).to.be.lessThan(
      morphoBalance
    )
  })

  it('should withdraw tokens from the Morpho yield pool when redeeming shares', async () => {
    const [user] = await ethers.getSigners()
    const amount = ethers.parseUnits('1', 6)
    const userAddress = await user.getAddress()
    const relayPoolAddress = await relayPool.getAddress()
    const userBalanceBefore = await usdc.balanceOf(userAddress)

    // Approved the Token to be spent by the RelayPool
    await (await usdc.connect(user).approve(relayPoolAddress, amount)).wait()

    // Deposit tokens to the RelayPool
    await relayPool.connect(user).deposit(amount, userAddress)

    // Check balances
    const morphoBalance = await morphoUsdcPool.balanceOf(relayPoolAddress)
    expect(await usdc.balanceOf(relayPoolAddress)).to.equal(0)
    expect(await usdc.balanceOf(userAddress)).to.equal(
      userBalanceBefore - amount
    )

    // redeem tokens from the RelayPool
    const sharesToRedeem = await relayPool.balanceOf(userAddress)
    await relayPool
      .connect(user)
      .redeem(sharesToRedeem, userAddress, userAddress)

    // tokens have been withdrawn
    expect(await morphoUsdcPool.balanceOf(relayPoolAddress)).to.be.lessThan(
      morphoBalance
    )
  })
})
