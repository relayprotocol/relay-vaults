import { task } from 'hardhat/config'

// deploy a simple ERC4626 pool for testing purposes
task('deploy:timelock', 'Deploy a timelock contract').setAction(
  async (_, { ethers }) => {
    const TimelockController = await ethers.getContractFactory(
      'TimelockControllerUpgradeable'
    )
    const timelockTemplate = await TimelockController.deploy()
    await timelockTemplate.waitForDeployment()

    return run('deploy:verify', {
      address: await timelockTemplate.getAddress(),
    })
  }
)
