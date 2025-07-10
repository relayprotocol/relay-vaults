// TODO: use the proper hyperlane package but the package is currently broken
// and requires the use of `ethers`...
export const chainIdFromDomainId = (domainId: string): string => {
  if (domainId.toString() === '1000012617') {
    return '1380012617'
  }
  return domainId.toString()
}
