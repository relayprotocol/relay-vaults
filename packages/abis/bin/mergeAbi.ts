import { ethers } from 'ethers'
import * as fs from 'fs-extra'
import * as path from 'path'
import { Fragment, InterfaceAbi } from 'ethers'
const abisToMerge = ['RelayPool']

const pastFolder = path.join(__dirname, '..', 'versions')
const srcFolder = path.join(__dirname, '..', 'src', 'abis')

export const mergeAbis = (
  currentAbi: InterfaceAbi,
  previousAbi: InterfaceAbi
): InterfaceAbi => {
  const { fragments: current } = new ethers.Interface(currentAbi)
  const { fragments: previous } = new ethers.Interface(previousAbi)

  const removedFragments: number[] = []

  // find fragments that exist in previous but not in current
  previous.forEach((prevFragment: Fragment, i: number) => {
    // skip constructor fragments
    if (prevFragment.type === 'constructor') {
      return
    }

    if (
      !current.some(
        (currFragment: Fragment) =>
          currFragment.type !== 'constructor' &&
          currFragment.format() === prevFragment.format()
      )
    ) {
      removedFragments.push(i)
    }
  })

  // get the original JSON items for removed fragemnts
  const removedItems = removedFragments.map((i) => previous[i])
  return [...current, ...removedItems]
}

const main = async () => {
  for (const abiName of abisToMerge) {
    // Get latest version from past folder
    const pastVersionsFolder = path.resolve(pastFolder, abiName)
    const pastVersions = fs.readdirSync(pastVersionsFolder)
    if (!pastVersions.length) {
      throw new Error(`No past versions found in ${pastVersionsFolder}`)
    }

    // read latest ABI
    const currentAbiPath = path.join(
      srcFolder,
      `${abiName}.sol`,
      `${abiName}.json`
    )
    const currentAbi = await fs.readJSON(currentAbiPath)

    // merge all past versions
    let merged: InterfaceAbi = currentAbi
    for (const pastVersion of pastVersions) {
      const pastAbiPath = path.join(pastFolder, abiName, pastVersion)
      const pastAbi = await fs.readJSON(pastAbiPath)
      merged = mergeAbis(merged, pastAbi)
    }

    // overwrite existing ABI with merged ABI in the src folder
    await fs.outputJSON(currentAbiPath, merged, {
      spaces: 2,
    })
  }
}

main()
  .catch((err) => {
    throw err
  })
  .then(() => console.log(`Abis merged successfully for ${abisToMerge.join()}`))
