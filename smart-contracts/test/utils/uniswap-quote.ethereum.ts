import { expect } from 'chai'
import { ethers } from 'hardhat'
import { quote } from '../../lib/uniswap'
import networks from '@relay-vaults/networks'

describe('Uniswap Quote', function () {
  // Use a longer timeout for mainnet fork tests
  this.timeout(60000)

  const mainnet = networks[1]

  const WETH = mainnet.assets.weth
  const USDC = mainnet.assets.usdc
  const USDC_POOL_FEE = 500

  it('should quote USDC to WETH swap', async function () {
    const amount = ethers.parseUnits('1000', 6) // 1000 USDC
    const minimumAmount = await quote({
      amount,
      ethers,
      poolFee: USDC_POOL_FEE,
      tokenIn: USDC,
      tokenOut: WETH,
    })

    expect(minimumAmount).to.be.gt(0)
    console.log('Minimum WETH amount:', ethers.formatEther(minimumAmount))
  })

  it('should quote WETH to USDC swap', async function () {
    const amount = ethers.parseEther('1') // 1 WETH
    const minimumAmount = await quote({
      amount,
      ethers,
      poolFee: USDC_POOL_FEE,
      tokenIn: WETH,
      tokenOut: USDC,
    })

    expect(minimumAmount).to.be.gt(0)
    console.log('Minimum USDC amount:', ethers.formatUnits(minimumAmount, 6))
  })
})
