import { ethers } from 'ethers'
import { getProvider } from './provider'
import { ERC20 } from './abis/ERC20'

export async function getBalance(
  account: string,
  tokenAddressOrChainIdOrProvider: string | bigint | ethers.Provider,
  chainIdOrProvider: bigint | ethers.Provider
) {
  let tokenAddress: string
  if (typeof tokenAddressOrChainIdOrProvider === 'string') {
    // If this is an address. then we set it!
    tokenAddress = tokenAddressOrChainIdOrProvider
    // and chainIdOrProvider is the 3rd arg
  } else {
    chainIdOrProvider = tokenAddressOrChainIdOrProvider
    tokenAddress = ethers.ZeroAddress
  }

  let provider
  if (typeof chainIdOrProvider == 'bigint') {
    provider = await getProvider(chainIdOrProvider)
  } else {
    provider = chainIdOrProvider
  }
  let balance

  if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
    // ETH balance
    balance = await provider.getBalance(account)
  } else {
    // erc20 balance
    const token = new ethers.Contract(tokenAddress, ERC20, provider)
    balance = await token.balanceOf(account)
  }
  return balance
}
