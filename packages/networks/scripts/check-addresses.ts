import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import networks from '../dist/index.mjs'
import { NetworkConfig } from '@relay-vaults/types'

import HyperlaneRegistry from '@hyperlane-xyz/registry'

const checkAddresses = async (network: NetworkConfig) => {
  console.log(`Checking addresses for network: ${network.name}`)
  console.log(HyperlaneRegistry)
  console.log(network)
}

const run = async () => {
  // @ts-expect-error yargs is not typed
  const { chain } = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('chain', {
      alias: 'c',
      description: 'Chain name',
      type: 'string',
    })
    .help('help')
    .alias('help', 'h')
    .example([['$0 --chain lisk', 'Specify a chain by name']]).argv

  if (chain) {
    let checked = false
    for (const network of Object.values(networks)) {
      if (
        network.chainId === Number(chain) ||
        network.slug === chain.toLowerCase()
      ) {
        await checkAddresses(network)
        checked = true
      }
    }
    if (!checked) {
      console.error(`No network found for chain: ${chain}`)
      process.exit(1)
    }
  } else {
    for (const network of Object.values(networks)) {
      await checkAddresses(network)
    }
  }
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error during address check:', error)
    process.exit(1)
  })
