import fs from 'fs-extra'
import path from 'path'

const getAllVersions = (contractName: string) => {
  const contractDir = path.join(__dirname, contractName)
  const versionedFiles = fs
    .readdirSync(contractDir)
    .filter((file) => file.endsWith('.json'))

  const version = versionedFiles
    .map((file) => require(path.join(contractDir, file)))
    .reduce((acc, curr) => {
      const merged = { ...acc }
      for (const [key, value] of Object.entries(curr)) {
        const valueStr = JSON.stringify(value)
        // dedupe
        const isIdentical = Object.values(merged).some(
          (v) => JSON.stringify(v) === valueStr
        )
        if (!isIdentical) {
          merged[key] = value
        }
      }
      return merged
    }, {})
  return version
}

export const RelayPool = getAllVersions('RelayPool')
