import { task } from 'hardhat/config'
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
    execSync('yarn workspace @relay-protocol/addresses generate')
    console.log('✅ Addresses package updated successfully')
  } catch (error) {
    console.error('❌ Failed to update addresses package:', error)
  }
})
