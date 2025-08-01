import { task } from 'hardhat/config'

import { networks } from '@relay-vaults/networks'
import RelayPoolFactoryModule from '../../ignition/modules/RelayPoolFactoryModule'

task('deploy:pool-factory', 'Deploy a relay vault factory')
  .addOptionalParam('delay', 'The Timelock delay')
  .setAction(async ({ delay }, { ethers, ignition, run }) => {
    // get args value
    const { chainId } = await ethers.provider.getNetwork()
    const {
      hyperlaneMailbox,
      name: networkName,
      assets: { weth },
    } = networks[chainId.toString()]
    console.log(`deploying on ${networkName} (${chainId})...`)

    if (!delay) {
      delay = 60 * 60 * 24 * 7
    }
    // deploy the pool using ignition
    const parameters = {
      RelayPoolFactory: {
        delay,
        hyperlaneMailbox,
        weth,
      },
    }

    const deploymentId = `RelayPoolFactory-${chainId.toString()}`
    const { relayPoolFactory, timelockTemplate } = await ignition.deploy(
      RelayPoolFactoryModule,
      {
        deploymentId,
        parameters,
      }
    )

    const poolFactoryAddress = await relayPoolFactory.getAddress()
    const timelockAddress = await timelockTemplate.getAddress()

    console.log(
      `✅ relayPoolFactory deployed to: ${poolFactoryAddress}. Timelock: ${timelockAddress}`
    )
    // TODO: We want to do that only if we actually deployed!
    await run('set-earliest-block')

    await run('deploy:verify', {
      address: timelockAddress,
      constructorArguments: [],
    })

    await run('deploy:verify', {
      address: poolFactoryAddress,
      constructorArguments: [hyperlaneMailbox, weth, timelockAddress, delay],
    })
  })
