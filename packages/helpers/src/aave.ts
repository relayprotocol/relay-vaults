import { ethers } from 'ethers'
import {
  AaveV3Ethereum,
  AaveV3Sepolia,
  AaveV3Optimism,
  AaveV3Arbitrum,
} from '@bgd-labs/aave-address-book' // import specific pool
import { getProvider } from './provider'

export const getAaveStataFactoryAddress = async (chainId: bigint) => {
  // const { chainId } = await ethers.provider.getNetwork()
  switch (chainId.toString()) {
    case '1':
      return AaveV3Ethereum.LEGACY_STATIC_A_TOKEN_FACTORY
    case '10':
      return AaveV3Optimism.LEGACY_STATIC_A_TOKEN_FACTORY
    case '42161':
      return AaveV3Arbitrum.LEGACY_STATIC_A_TOKEN_FACTORY
    case '11155111':
      return AaveV3Sepolia.LEGACY_STATIC_A_TOKEN_FACTORY
    default:
      // TODO: implement addresses switch for all networks
      throw Error(`Missing Stata AAve Pool Factory for chainId ${chainId}`)
  }
}

export const getStataToken = async (asset: string, chainId: bigint) => {
  const factoryAddress = await getAaveStataFactoryAddress(chainId)
  const provider = await getProvider(chainId)
  const stataFactory = new ethers.Contract(
    factoryAddress,
    ['function getStaticAToken(address) view returns(address)'],
    provider
  )

  const poolWrapper = await stataFactory.getStaticAToken(asset)
  if (poolWrapper === ethers.ZeroAddress) {
    throw Error(`Stata AAve Pool for ${asset} does not exist`)
  }
  return poolWrapper
}
