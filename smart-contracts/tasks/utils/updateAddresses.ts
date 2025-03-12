import { task } from 'hardhat/config'
import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'

/**
 * Task to update the addresses package with the latest deployed contract addresses
 * This can be called directly or hooked into deployment tasks
 */
task(
  'utils:update-addresses',
  'Update addresses package with latest deployments'
).setAction(async (_, { config }) => {
  console.log('Updating addresses package with latest deployments...')

  try {
    // Path to the addresses package
    const addressesPackagePath = path.resolve(
      config.paths.root,
      '../packages/addresses'
    )

    // Run the generate script directly
    execSync('yarn generate', {
      cwd: addressesPackagePath,
      stdio: 'inherit',
    })

    console.log('✅ Addresses package updated successfully')
  } catch (error) {
    console.error('❌ Failed to update addresses package:', error)
  }
})
