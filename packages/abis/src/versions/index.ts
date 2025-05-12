import { ethers } from 'ethers'

const getAllVersions = (contractName: string) => {
  const contractDir = path.join(__dirname, 'versions', contractName)
  const versionedFiles = fs
    .readdirSync(contractDir)
    .filter((file) => file.endsWith('.json'))

  const complete = versionedFiles
    .map((file) => require(path.join(contractDir, file)))
    .reduce((acc, curr) => [...acc, ...curr])

  // dedup based on sig
  const deduped = complete.reduce((acc: any[], curr: any) => {
    const currFragment = ethers.Fragment.from(curr)
    // skip constructors
    if (currFragment.type === 'constructor') return acc
    const exists = acc.some(
      (prev) => currFragment.format() === ethers.Fragment.from(prev).format()
    )
    if (!exists) acc.push(curr)
    return acc
  }, [])

  return deduped
}

export const RelayPool = getAllVersions('RelayPool')
