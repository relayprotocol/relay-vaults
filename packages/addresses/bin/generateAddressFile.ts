import fs from 'fs-extra'
import path from 'path'
import { getProvider } from '@relay-protocol/helpers'

interface Addresses {
  [chainId: string]: {
    BridgeProxy?: {
      [bridgeType: string]: string
    }
    RelayBridgeFactory?: string
    RelayPoolFactory?: string
    [key: string]: any
  }
}

// Base path to ignition deployments
const DEPLOYMENTS_PATH = path.resolve(
  __dirname,
  '../../../smart-contracts/ignition/deployments/'
)

/**
 * Extract contract address from deployment file
 */
function getAddressFromDeployment(deploymentPath: string): string | null {
  try {
    const filePath = path.join(
      DEPLOYMENTS_PATH,
      deploymentPath,
      'deployed_addresses.json'
    )
    if (!fs.existsSync(filePath)) return null

    const deployment = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return Object.values(deployment)[0] as string
  } catch (error) {
    console.error(`Error reading deployment file ${deploymentPath}:`, error)
    return null
  }
}

/**
 * Scan all deployments and build addresses object
 */
export function getAddresses(): Addresses {
  const addresses: Addresses = {}

  // Get all deployment directories
  const deploymentDirs = fs.readdirSync(DEPLOYMENTS_PATH)

  // Process each deployment
  for (const dir of deploymentDirs) {
    // BridgeProxy deployments (format: BridgeProxy-{bridgeType}-{chainId})
    const bridgeProxyMatch = dir.match(
      /BridgeProxy-(?<bridge>.*)-(?<chainId>.*)/
    )
    if (bridgeProxyMatch?.groups) {
      const { bridge, chainId } = bridgeProxyMatch.groups

      // Initialize chain entry if needed
      addresses[chainId] = addresses[chainId] || {}
      addresses[chainId].BridgeProxy = addresses[chainId].BridgeProxy || {}

      // Get and store address
      const address = getAddressFromDeployment(dir)
      if (address) {
        addresses[chainId].BridgeProxy[bridge] = address
      }
      continue
    }

    // RelayBridgeFactory deployments (format: RelayBridgeFactory-{chainId})
    const bridgeFactoryMatch = dir.match(/RelayBridgeFactory-(?<chainId>.*)/)
    if (bridgeFactoryMatch?.groups) {
      const { chainId } = bridgeFactoryMatch.groups

      // Initialize chain entry if needed
      addresses[chainId] = addresses[chainId] || {}

      // Get and store address
      const address = getAddressFromDeployment(dir)
      if (address) {
        addresses[chainId].RelayBridgeFactory = address
      }
      continue
    }

    // RelayPoolFactory deployments (format: RelayPoolFactory-{chainId})
    const poolFactoryMatch = dir.match(/RelayPoolFactory-(?<chainId>.*)/)
    if (poolFactoryMatch?.groups) {
      const { chainId } = poolFactoryMatch.groups

      // Initialize chain entry if needed
      addresses[chainId] = addresses[chainId] || {}

      // Get and store address
      const address = getAddressFromDeployment(dir)
      if (address) {
        addresses[chainId].RelayPoolFactory = address
      }
      continue
    }
  }

  return addresses
}

/**
 * Generate addresses file
 */
async function generateAddressFile() {
  try {
    // Get addresses from deployments
    const addresses = getAddresses()

    // Write to addresses.json
    const outputPath = path.resolve(__dirname, '../src/addresses.json')
    await fs.outputJSON(outputPath, addresses, { spaces: 2 })

    console.log(`✅ Successfully generated addresses file at ${outputPath}`)
  } catch (error) {
    console.error('❌ Error generating addresses file:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  generateAddressFile()
}

// Export for use in other scripts
export { generateAddressFile }
