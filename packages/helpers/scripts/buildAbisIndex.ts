// helper to generate index.ts for ABIs
import path from 'path'
import { createIndexFile } from '../src/package'

const main = async () => {
  console.log('Building ABIs index...')
  await createIndexFile({
    destFolder: path.resolve('src', 'abis'),
    srcFolder: 'abis',
  })
}

main()
  .then(() => {
    console.log('ABIs index built successfully!')
  })
  .catch((e) => console.error(e))
