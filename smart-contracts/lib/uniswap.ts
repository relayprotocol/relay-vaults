const ETHEREUM_UNISWAP_V3_QUOTER = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
const DEFAULT_SLIPPAGE = 3n // in percent

export const quote = async ({
  ethers,
  poolFee,
  tokenIn,
  tokenOut,
  amount,
  slippage = DEFAULT_SLIPPAGE,
}: {
  ethers: any
  poolFee: number
  tokenIn: string
  tokenOut: string
  amount: bigint
  slippage?: bigint
}) => {
  const quoter = await ethers.getContractAt(
    [
      'function quoteExactInputSingle(address tokenIn,address tokenOut,uint24 fee,uint256 amountIn,uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
    ],
    ETHEREUM_UNISWAP_V3_QUOTER
  )
  const [quotedAmount] = await quoter.quoteExactInputSingle.staticCallResult(
    tokenIn,
    tokenOut,
    poolFee,
    amount,
    0n //pathsqrtPriceLimitX96:
  )
  const minimumAmount = (quotedAmount * slippage) / 100n
  return minimumAmount
}
