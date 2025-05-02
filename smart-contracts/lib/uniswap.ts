const ETHEREUM_UNISWAP_QUOTER = '0x52F0E24D1c21C8A0cB1e5a5dD6198556BD9E1203'
const SLIPPAGE = 3n // in percent

export const quote = async ({
  ethers,
  poolFee,
  tokenIn,
  tokenOut,
  weth,
  amount,
}: {
  ethers: any
  poolFee: number
  tokenIn: string
  tokenOut: string
  weth: string
  amount: bigint
}) => {
  let path =
    poolFee == 0
      ? ethers.solidityPacked(
          ['address', 'uint24', 'address'],
          [tokenIn, poolFee, tokenOut]
        ) // if no pool fee for asset, then do direct swap
      : ethers.solidityPacked(
          ['address', 'uint24', 'address'],
          [tokenIn, poolFee, weth]
        ) // else default to token > WETH

  // add WETH > asset to path if needed
  if (poolFee != 0 && tokenIn != weth) {
    path = ethers.solidityPacked(
      ['bytes', 'uint24', 'address'],
      [path, poolFee, tokenOut]
    )
  }

  const quoter = await ethers.getContractAt(
    ['function quoteExactInput(bytes,uint256) external returns (uint256)'],
    ETHEREUM_UNISWAP_QUOTER
  )
  console.log({ amount, path })
  const quotedAmount = await quoter.quoteExactInput(path, amount)
  const minimumAmount = (quotedAmount * SLIPPAGE) / 100n
  return minimumAmount
}
