import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import networks from '@relay-vaults/networks'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { mintUSDC, stealERC20 } from '../utils/hardhat'
import { reverts } from '../utils/errors'
import { quote } from '../../lib/uniswap'

import {
  MyToken,
  MyYieldPool,
  RelayPool,
  TokenSwap,
} from '../../typechain-types'
import TokenSwapModule from '../../ignition/modules/TokenSwapModule'
import { getBalance, getEvent } from '@relay-vaults/helpers'
import { Signer, ZeroAddress } from 'ethers'

const {
  assets: { weth: WETH, usdc: USDC },
  uniswapV3: { universalRouterAddress },
} = networks[1]

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const MORPHO = '0x58D97B57BB95320F9a05dC918Aef65434969c2B2'

// pool is priced in DAI
const myTokenAddress = DAI

const tokenSwapBehavior = async (
  relayPool: RelayPool,
  tokenSwap: TokenSwap,
  token: string,
  amount: bigint,
  tokenPoolFee: number,
  assetPoolFee: number,
  amountOutMinimum: bigint = 0n
) => {
  const balanceBefore = await getBalance(
    await relayPool.getAddress(),
    token,
    ethers.provider
  )
  expect(balanceBefore).to.be.equal(amount)

  // compute deadline 5 minutes from now
  const deadline = Math.floor(Date.now() / 1000) + 300

  // swap that amount
  const tx = await relayPool.swapAndDeposit(
    token,
    amount,
    tokenPoolFee,
    assetPoolFee,
    deadline,
    amountOutMinimum // setting to 0 for tests since we're not concerned with slippage
  )

  const receipt = await tx.wait()
  const { event: depositEvent } = await getEvent(
    receipt!,
    'AssetsDepositedIntoYieldPool',
    relayPool.interface
  )
  const { event: swapEvent } = await getEvent(
    receipt!,
    'TokenSwapped',
    tokenSwap.interface
  )
  expect(swapEvent.args.amount).to.be.equal(depositEvent.args.amountOut)

  // no weth left
  expect(
    await getBalance(await relayPool.getAddress(), token, ethers.provider)
  ).to.be.equal(0)
}

describe('RelayPool / Swap and Deposit', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let thirdPartyPool: MyYieldPool
  let tokenSwap: TokenSwap
  let curator: Signer
  let curatorAddress: string
  let user: Signer
  let userAddress: string
  let attacker: Signer

  before(async () => {
    ;[curator, user, attacker] = await ethers.getSigners()
    curatorAddress = await curator.getAddress()
    userAddress = await user.getAddress()
    myToken = await ethers.getContractAt('MyToken', myTokenAddress)

    // deploy 3rd party pool
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])

    // deploy the pool using ignition
    const parameters = {
      RelayPool: {
        asset: await myToken.getAddress(),
        bridgeFee: 0,
        curator: curatorAddress,
        hyperlaneMailbox: networks[1].hyperlaneMailbox,
        name: `${await myToken.name()} Relay Pool`,
        symbol: `${await myToken.symbol()}-REL`,
        thirdPartyPool: await thirdPartyPool.getAddress(),
        weth: WETH,
      },
      TokenSwap: {
        uniswapUniversalRouter: universalRouterAddress,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))
    ;({ tokenSwap } = await ignition.deploy(TokenSwapModule, {
      parameters,
    }))

    // set TokenSwap contract
    await relayPool.connect(curator).setTokenSwap(await tokenSwap.getAddress())
    expect(await tokenSwap.getAddress()).to.equal(
      await relayPool.tokenSwapAddress()
    )
  })

  it('has correct constructor params', async () => {
    expect(await tokenSwap.UNISWAP_UNIVERSAL_ROUTER()).to.equal(
      universalRouterAddress
    )
  })

  it('can only be called by contract owner', async () => {
    await reverts(
      relayPool.connect(attacker).swapAndDeposit(
        ZeroAddress,
        1000,
        1000,
        1000,
        Math.floor(Date.now() / 1000) + 300,
        0 // amountOutMinimum
      ),
      `OwnableUnauthorizedAccount("${await attacker.getAddress()}")`
    )
  })

  describe('holding MORPHO (swapping using MORPHO > WETH > DAI)', () => {
    const amount = ethers.parseUnits('1', 18)
    let relayPoolAddress: string

    before(async () => {
      relayPoolAddress = await relayPool.getAddress()

      // get some USDC
      const morpho = await ethers.getContractAt('IERC20', MORPHO)
      await stealERC20(
        MORPHO,
        '0x9D03bb2092270648d7480049d0E58d2FcF0E5123', // morpho whale
        userAddress,
        amount
      )
      // send some USDC to the pool
      await morpho.connect(user).transfer(relayPoolAddress, amount)
    })

    it('should swap to pool asset and transfer it directly into the pool balance', async () => {
      await tokenSwapBehavior(
        relayPool,
        tokenSwap,
        MORPHO,
        amount,
        3000, // uniswapPoolFee morpho > WETH
        3000 // uniswapPoolFee WETH > DAI
      )
    })
  })

  describe('holding WETH (direct swap WETH > DAI )', () => {
    const amount = ethers.parseEther('3')
    let relayPoolAddress: string

    before(async () => {
      relayPoolAddress = await relayPool.getAddress()

      // get some WETH
      const weth = await ethers.getContractAt('IWETH', WETH)
      await weth.connect(user).deposit({ value: amount })
      await weth.connect(user).transfer(relayPoolAddress, amount)
    })

    it('should swap to pool asset and transfer it directly into the pool balance', async () => {
      await tokenSwapBehavior(
        relayPool,
        tokenSwap,
        WETH,
        amount,
        3000, // uniswapPoolFee
        0
      )
    })
  })

  describe('holding USDC (direct SWAP USDC > DAI)', () => {
    const amount = ethers.parseUnits('100', 6)
    let relayPoolAddress: string

    before(async () => {
      relayPoolAddress = await relayPool.getAddress()

      // get some USDC
      await mintUSDC(USDC, userAddress, amount)
      const usdc = await ethers.getContractAt('IUSDC', USDC)

      // send some USDC to the pool
      await usdc.connect(user).transfer(relayPoolAddress, amount)
    })

    it('should swap to pool asset and transfer it directly into the pool balance', async () => {
      await tokenSwapBehavior(
        relayPool,
        tokenSwap,
        USDC,
        amount,
        3000, // uniswapPoolFee
        0
      )
    })
    describe('swap minimum amount out is not reached', () => {
      it('fails when attempting to swap (direct SWAP USDC > DAI)', async () => {
        const amount = ethers.parseUnits('1000', 6)
        const relayPoolAddress = await relayPool.getAddress()

        // get some USDC
        await mintUSDC(USDC, userAddress, amount)
        const usdc = await ethers.getContractAt('IUSDC', USDC)

        // send some USDC to the pool
        await usdc.connect(user).transfer(relayPoolAddress, amount)

        // compute deadline 5 minutes from now
        const deadline = Math.floor(Date.now() / 1000) + 300

        // swap that amount
        await reverts(
          relayPool.swapAndDeposit(
            USDC,
            amount,
            3000,
            30000,
            deadline,
            ethers.parseUnits('100000', 6) //
          )
        )
      })
    })
  })

  describe('setting minimum out amount on swap ', () => {
    describe('swapping MORPHO > WETH)', () => {
      const amount = ethers.parseUnits('1', 18)
      let relayPoolAddress: string
      let morphoAmount: bigint

      before(async () => {
        relayPoolAddress = await relayPool.getAddress()

        // get some USDC
        const morpho = await ethers.getContractAt('IERC20', MORPHO)
        await stealERC20(
          MORPHO,
          '0x9D03bb2092270648d7480049d0E58d2FcF0E5123', // morpho whale
          userAddress,
          amount
        )
        // send MORPHO balance to the pool
        morphoAmount = await morpho.balanceOf(userAddress)
        await morpho.connect(user).transfer(relayPoolAddress, morphoAmount)
      })

      it('should swap to pool asset and transfer it directly into the pool balance', async () => {
        const quotedAmount = await quote({
          amount: morphoAmount,
          ethers,
          poolFee: 3000,
          tokenIn: MORPHO,
          tokenOut: WETH,
        })

        await tokenSwapBehavior(
          relayPool,
          tokenSwap,
          MORPHO,
          amount,
          3000, // uniswapPoolFee morpho > WETH
          3000, // uniswapPoolFee WETH > DAI
          quotedAmount
        )
      })
    })
  })
})
