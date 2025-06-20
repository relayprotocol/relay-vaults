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
  if (!config.etherscan.apiKey[etherscanNetworkName]) {
    console.error(
      `No Etherscan API key found for '${etherscanNetworkName}'. Please add one to hardhat.config.ts`
    )
    return
  }

  if (chainId === 31337n) {
    // Not verifying on hardhat
    return
  }

  // Wait for the transaction to be mined before verifying!
  let attempts = 0
  let verified = false
  process.stdout.write(`Verifying ${address} ...`)

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
        if (attempts >= 50) {
          console.error(e)
          throw e
        }
        await new Promise((resolve) => setTimeout(resolve, 3000))
      })
  }
  console.log(`✅ Verified ${address}`)
  return address
})
