import { task } from 'hardhat/config'

// deploy a simple ERC4626 pool for testing purposes
task('deploy:drainable-vault', 'Deploy a drainable vault')
  .addParam(
    'pool',
    'The RelayPool address',
    '0x19426e122E0988e1f6ad246Af9B6553492C6D446'
  )
  .setAction(async ({ pool: poolAddress }, { ethers, run }) => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()

    const pool = await ethers.getContractAt('RelayPool', poolAddress)
    const wethAddress = await pool.asset()

    // Deploy drainable vault
    const drainableVault = await ethers.deployContract('DrainableVault', [
      wethAddress,
      'DRAINABLE VAULT',
      'WETH-DRAIN',
      userAddress,
    ])
    const drainableVaultAddress = await drainableVault.getAddress()
    // expect(await weth.balanceOf(drainableVaultAddress)).to.equal(0n)

    // // Make a deposit to avoid inflation attack!
    // const drainableDepositAmount = ethers.parseEther('0.01')
    // await weth.deposit({ value: drainableDepositAmount })
    // await weth.approve(drainableVaultAddress, ethers.MaxUint256)
    // await drainableVault.deposit(
    //   drainableDepositAmount,
    //   await user.getAddress()
    // )
    // expect(await weth.balanceOf(drainableVaultAddress)).to.equal(
    //   drainableDepositAmount
    // )

    await run('deploy:verify', {
      address: drainableVaultAddress,
      constructorArguments: [
        wethAddress,
        'DRAINABLE VAULT',
        'WETH-DRAIN',
        userAddress,
      ],
    })
    return drainableVaultAddress
  })
