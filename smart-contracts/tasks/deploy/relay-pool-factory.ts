import { task } from 'hardhat/config'
const { Confirm } = require('enquirer')

import { networks } from '@relay-protocol/networks'
import RelayPoolFactoryModule from '../../ignition/modules/RelayPoolFactoryModule'

task('deploy:pool-factory', 'Deploy a relay pool factory')
  .addOptionalParam('timelock', 'The Timelock contract to use')
  .setAction(async ({ timelock }, { ethers, ignition, run }) => {
    // get args value
    const { chainId } = await ethers.provider.getNetwork()
    const {
      hyperlaneMailbox,
      name: networkName,
      assets: { weth },
    } = networks[chainId.toString()]
    console.log(`deploying on ${networkName} (${chainId})...`)

    if (!timelock) {
      const shouldDeployTimelock = await new Confirm({
        name: 'timelock',
        message: 'Do you want to deploy a timelock contract template?',
      }).run()
      if (!shouldDeployTimelock) {
        throw new Error('Timelock is required. Please pass one with --timelock')
      }
      timelock = await run('deploy:timelock', {})
    }

    // deploy the pool using ignition
    const parameters = {
      RelayPoolFactory: {
        hyperlaneMailbox,
        weth,
        timelock,
      },
    }

    const deploymentId = `RelayPoolFactory-${chainId.toString()}`
    const { relayPoolFactory } = await ignition.deploy(RelayPoolFactoryModule, {
      parameters,
      deploymentId,
    })

    const poolFactoryAddress = await relayPoolFactory.getAddress()

    console.log(`relayPoolFactory deployed to: ${poolFactoryAddress}`)
    await run('deploy:verify', {
      address: poolFactoryAddress,
      constructorArguments: [hyperlaneMailbox, weth, timelock],
    })
  })
