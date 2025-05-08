import fs from 'fs-extra'
import path from 'path'

import { task } from 'hardhat/config'

const packageFolder = path.resolve('../packages/abis')

task(
  'abi:snapshot',
  'Export the current version of the ABI to the abis package'
)
  .addParam('contract', 'The name/qualified name of the contract')
  .setAction(async ({ contract }, { artifacts }) => {
    const { abi, sourceName, contractName } =
      await artifacts.readArtifact(contract)

    const toExport = {
      abi,
      contractName,
      sourceName,
    }

    const versionsPath = path.resolve(packageFolder, 'versions', contractName)

    const versionFiles = fs.readdirSync(versionsPath)
    const versionCount = versionFiles.length + 1
    const abiFileName = path.join(
      versionsPath,
      `${contractName}-${String(versionCount).padStart(2, '0')}.json`
    )
    await fs.outputJSON(abiFileName, toExport.abi, { spaces: 2 })
    console.log(`File written at ${abiFileName}`)
  })
