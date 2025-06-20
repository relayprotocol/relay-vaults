import { task } from 'hardhat/config'

import { networks } from '@relay-vaults/networks'
import OriginCuratorModule from '../../ignition/modules/OriginCuratorModule'

task('deploy:origin-curator', 'Deploy the Origin Curator')
  .addParam('multisig', 'The multisig address')
  .setAction(async ({ multisig }, { ethers, ignition, run }) => {
    // get args value
    const { chainId } = await ethers.provider.getNetwork()
    const { name: networkName } = networks[chainId.toString()]
    console.log(`deploying on ${networkName} (${chainId})...`)

    const parameters = {
      OriginCurator: {
        multisig,
      },
    }

    const deploymentId = `OriginCurator-${chainId.toString()}`
    const { originCurator } = await ignition.deploy(OriginCuratorModule, {
      deploymentId,
      parameters,
    })

    const originCuratorAddress = await originCurator.getAddress()

    console.log(`✅ originCurator deployed to: ${originCuratorAddress}`)
    await run('set-earliest-block')

    await run('deploy:verify', {
      address: originCuratorAddress,
      constructorArguments: [multisig],
    })
  })
