// TODO: use the proper hyperlane package but the package is currently broken
// and requires the use of `ethers`...
export const chainIdFromDomainId = (domainId: number): number => {
  if (domainId === 1000012617) {
    return 1380012617
  }
  return domainId
}

// TODO: use the proper hyperlane package but the package is currently broken
// and requires the use of `ethers`...
export const domainIdForChainId = (chainId: number): number => {
  if (chainId === 1380012617) {
    return 1000012617
  }
  return chainId
}
