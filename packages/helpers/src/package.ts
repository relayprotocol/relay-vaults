import fs from 'fs-extra'
import path from 'path'

const walk = async (dirPath: string) =>
  Promise.all(
    await fs.readdir(dirPath, { withFileTypes: true }).then((entries) =>
      entries.map((entry: any): any => {
        const childPath = path.join(dirPath, entry.name)
        return entry.isDirectory() ? walk(childPath) : childPath
      })
    )
  )

export const parseExports = async (
  folderName: string,
  destFolder: string,
  isJSON = false
) => {
  const files = await walk(path.resolve('src', folderName))

  const exportsList = files!
    .flat(Infinity)
    .filter((f: string) =>
      isJSON
        ? f.includes('.json')
        : f.includes('.ts') && !f.includes('index.ts')
    )
    .map((f: string) => {
      // make sure all path exists
      fs.pathExistsSync(path.resolve(f))
      // get contractName
      const contractName = path.parse(f).name

      const exportPath = `./${path.relative(destFolder, f).replace('.ts', '')}`
      return {
        contractName,
        exportPath,
      }
    })
  return exportsList
}

const parseImport = (
  contractName: string,
  exportPath: string,
  isJSON: boolean
) => {
  const namedExport = isJSON ? contractName : `{ ${contractName} }`
  return `import ${namedExport} from '${exportPath}'`
}
export const createIndexFile = async ({
  srcFolder,
  destFolder,
  versioned = [],
  isJSON = false,
}: {
  srcFolder: string
  destFolder: string
  versioned?: string[]
  isJSON?: boolean
}) => {
  const fileContent = ['/* eslint-disable */']
  fileContent.push("// This file is generated, please don't edit directly")
  fileContent.push("// Refer to 'yarn build:index' for more\n")

  const abiFiles = await parseExports(srcFolder, destFolder, isJSON)
  abiFiles.forEach(({ contractName, exportPath }) =>
    versioned.includes(contractName)
      ? fileContent.push(`import { ${contractName} } from './versions'`)
      : fileContent.push(parseImport(contractName, exportPath, isJSON))
  )
  fileContent.push('\n// exports')

  abiFiles.forEach(({ contractName }) =>
    fileContent.push(`export { ${contractName} }`)
  )

  await fs.outputFile(
    path.resolve(destFolder, 'index.ts'),
    fileContent.join('\n')
  )
}
