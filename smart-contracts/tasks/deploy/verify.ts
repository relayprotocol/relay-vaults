import { task } from 'hardhat/config'
import networks from '@relay-vaults/networks'

task(
  'deploy:verify',
  'Verifies a contract utility, includes retries and wait times'
).setAction(async ({ address, constructorArguments }, { config, ethers }) => {
  const { chainId } = await ethers.provider.getNetwork()

  const network = networks[chainId.toString()]

  let etherscanNetworkName
  switch (Number(chainId)) {
    case 1:
      etherscanNetworkName = 'mainnet'
      break
    case 42161:
      etherscanNetworkName = 'arbitrum'
      break
    default:
      etherscanNetworkName = network.name.toLowerCase()
  }

  const apiKey = config.etherscan.apiKey[etherscanNetworkName]
  const expectedEnvVarName = `EXPLORER_API_KEY_${etherscanNetworkName.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`

  if (!apiKey || apiKey === 'default-api-key') {
    console.error(
      `❌ No valid Etherscan API key found for '${etherscanNetworkName}'. Please set the '${expectedEnvVarName}' environment variable properly in hardhat.config.ts`
    )
    throw new Error(`Missing or placeholder API key for network: ${etherscanNetworkName}`)
  }

  if (chainId === 31337n) {
    // Not verifying on hardhat local network
    return
  }

  // Wait for the transaction to be mined before verifying!
  let attempts = 0
  let verified = false
  process.stdout.write(
    `Verifying ${address} with ${JSON.stringify(constructorArguments)}...`
  )

  while (!verified) {
    attempts += 1
    await run('verify:verify', {
      address,
      constructorArguments,
    })
      .then(() => {
        verified = true
      })
      .catch(async (e) => {
        process.stdout.write('.')
        console.log(e)
        if (attempts >= 10) {
          console.error(e)
          throw e
        }
        await new Promise((resolve) => setTimeout(resolve, 3000))
      })
  }
  console.log(`✅ Verified ${address}`)
  return address
})
