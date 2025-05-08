import { createIndexFile } from '@relay-protocol/helpers'
import * as path from 'path'
const srcFolder = path.join(__dirname, '..')

// create ABIs index files
createIndexFile(
  path.resolve(srcFolder, 'src', 'abis'),
  path.resolve(srcFolder, 'src')
)
  .catch((err) => {
    throw err
  })
  .then(() => console.log(`Abis index created`))
