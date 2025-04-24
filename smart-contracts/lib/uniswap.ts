const ETHEREUM_UNISWAP_QUOTER = '0x52F0E24D1c21C8A0cB1e5a5dD6198556BD9E1203'
const SLIPPAGE = 3n // in percent

const quote = async ({
  ethers,
  poolFee,
  tokenIn,
  tokenOut,
  weth,
  amount,
}: {
  ethers: any
  poolFee: number
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  weth: `0x${string}`
  amount: bigint
}) => {
  // compute uniswap path to fetch the quote
  let path =
    poolFee == 0
      ? ethers.solidityPacked(
          [tokenIn, poolFee, tokenOut],
          ['address', 'uint24', 'address']
        ) // if no pool fee for asset, then do direct swap
      : ethers.solidityPacked(
          [tokenIn, poolFee, weth],
          ['address', 'uint24', 'address']
        ) // else default to token > WETH

  // add WETH > asset to path if needed
  if (poolFee != 0 && tokenIn != weth) {
    path = ethers.solidityPacked(
      [path, poolFee, tokenOut],
      ['bytes', 'uint24', 'address']
    )
  }

  const quoter = ethers.getContractAt(
    ['function quoteExactInput(bytes,uint256) external returns (uint256)'],
    ETHEREUM_UNISWAP_QUOTER
  )
  const quotedAmount = await quoter.quoteExactInput(path, amount)
  const minimumAmount = (quotedAmount * SLIPPAGE) / 100n
  return minimumAmount
}
