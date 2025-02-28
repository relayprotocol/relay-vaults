import { task } from 'hardhat/config'
import { Select, Input } from 'enquirer'

import { networks } from '@relay-protocol/networks'
import RelayPoolFactoryModule from '../../ignition/modules/RelayPoolFactoryModule'

task('deploy:pool-factory', 'Deploy a relay pool factory')
  .addOptionalParam('timelock', 'The Timelock contract to use')
  .setAction(async (_params, { ethers, ignition, run }) => {
    // get args value
    const { chainId } = await ethers.provider.getNetwork()
    const {
      hyperlaneMailbox,
      name: networkName,
      assets: { weth },
    } = networks[chainId.toString()]
    console.log(`deploying on ${networkName} (${chainId})...`)

    // deploy the pool using ignition
    const parameters = {
      RelayPoolFactory: {
        hyperlaneMailbox,
        weth,
      },
    }

    const deploymentId = `RelayPoolFactory-${chainId.toString()}`
    const { relayPoolFactory } = await ignition.deploy(RelayPoolFactoryModule, {
      parameters,
      deploymentId,
    })

    const poolFactoryAddress = await relayPoolFactory.getAddress()

    console.log(`relayPoolFactory deployed to: ${poolFactoryAddress}`)
    await run('verify:verify', {
      address: poolFactoryAddress,
      constructorArguments: [hyperlaneMailbox, weth],
    })
  })
