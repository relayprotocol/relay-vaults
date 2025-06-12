import fs from 'fs'
import path from 'path'

const configDir = path.resolve(__dirname, './networks')
const files = fs
  .readdirSync(configDir)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')

const importLines: string[] = []
const exportLines: string[] = []

files.forEach((file) => {
  const fileNameWithoutExt = path.basename(file, '.ts')
  const importVar = fileNameWithoutExt.replace(/[^a-zA-Z0-9_$]/g, '_')
  importLines.push(`import config_${importVar} from './${fileNameWithoutExt}'`)
  exportLines.push(
    `export const ${fileNameWithoutExt} = { slug: '${fileNameWithoutExt}', ...config_${importVar} }`
  )
})

const output = `// AUTO-GENERATED FILE. DO NOT EDIT.\n\n${importLines.join('\n')}\n\n${exportLines.join('\n')}\n`

fs.writeFileSync(path.join(configDir, 'index.ts'), output)
console.log('✅ index.ts generated successfully')
