import { task } from 'hardhat/config'
import { AutoComplete, Input } from 'enquirer'
import { networks } from '@relay-vaults/networks'
import { getStataToken, getEvent } from '@relay-vaults/helpers'
import fs from 'fs'

const ignitionPath = __dirname + '/../../ignition/deployments/'

task('deploy:pool', 'Deploy a relay vault')
  .addOptionalParam('factory', 'Address of the factory')
  .addOptionalParam('name', 'name of the pool')
  .addOptionalParam('symbol', 'symbol of the pool')
  .addOptionalParam('asset', 'An ERC20 asset')
  .addOptionalParam('yieldPool', 'A yield pool address')
  .addOptionalParam('delay', 'Timelock delay in seconds. Defaults to 7 days')
  .addOptionalParam(
    'deposit',
    'The initial deposit to be added to the pool. This will be locked in the timelock'
  )
  .setAction(
    async (
      { name, symbol, factory, asset, yieldPool, delay, deposit },
      { ethers, run }
    ) => {
      const [user] = await ethers.getSigners()
      const userAddress = await user.getAddress()
      const { chainId } = await ethers.provider.getNetwork()
      const { name: networkName, assets } = networks[chainId.toString()]

      console.log(`deploying on ${networkName} (${chainId})...`)

      if (!factory) {
        // Read it from the files!
        const folder = `RelayPoolFactory-${chainId.toString()}`
        const factoryData = require(
          ignitionPath + `${folder}/deployed_addresses.json`
        )
        factory = factoryData['RelayPoolFactory#RelayPoolFactory']
      }

      if (!asset) {
        const assetName = await new AutoComplete({
          choices: Object.keys(assets),
          message:
            'Please choose the asset for your relay bridge (make sure it is supported by the proxy bridge you selected):',
          name: 'asset',
        }).run()
        asset = assets[assetName]
      }

      // yield pool
      if (!yieldPool) {
        const yieldPoolName = await new AutoComplete({
          choices: ['aave', 'dummy'],
          message: 'Please choose a yield pool:',
          name: 'yieldPoolName',
        }).run()
        if (yieldPoolName === 'aave') {
          yieldPool = await getStataToken(asset, chainId)
        } else {
          // We need to deploy a dummy yield pool
          yieldPool = await run('deploy:dummy-yield-pool', { asset })
        }
      }

      // parse asset metadata
      const assetContract = await ethers.getContractAt('MyToken', asset)
      const assetName = await assetContract.name()
      const assetSymbol = await assetContract.symbol()
      const assetDecimals = await assetContract.decimals()

      if (!name) {
        const defaultName = `${assetName} Relay Vault`
        name = await new Input({
          default: defaultName,
          message: 'Please enter a pool name:',
          name: 'name',
        }).run()
      }

      if (!symbol) {
        const defaultSymbol = `${assetSymbol}-REL`
        symbol = await new Input({
          default: defaultSymbol,
          message: 'Please enter a pool symbol:',
          name: 'symbol',
        }).run()
      }

      // Check that the yield pool asset matches
      const yieldPoolContract = await ethers.getContractAt(
        'MyYieldPool',
        yieldPool
      )
      const yieldPoolAsset = await yieldPoolContract.asset()
      if (asset !== yieldPoolAsset) {
        const yeildPoolAssetContract = await ethers.getContractAt(
          'MyToken',
          yieldPoolAsset
        )
        const originAssetSymbol = await yeildPoolAssetContract.symbol()
        console.error(
          `Asset mismatch! The pool expects a different asset (${assetSymbol}) than the yield pool (${originAssetSymbol})!`
        )
        process.exit(1)
      }

      const factoryContract = await ethers.getContractAt(
        'RelayPoolFactory',
        factory
      )

      if (!delay) {
        const minimumDelay = await factoryContract.MIN_TIMELOCK_DELAY()
        delay = await new Input({
          default: minimumDelay,
          message: `Please enter a pool timelock delay (in seconds, more than ${minimumDelay.toString()}):`,
          name: 'delay',
        }).run()
      }

      if (!deposit) {
        // Get the default amount as the balance of the user
        deposit = await new Input({
          default: 1,
          message: 'Please enter a pool initial deposit:',
          name: 'deposit',
        }).run()
      }

      const depositAmount = ethers.parseUnits(deposit.toString(), assetDecimals)

      if (assetSymbol == 'WETH') {
        const balance = await assetContract.balanceOf(userAddress)
        if (balance < depositAmount) {
          console.log('Wrapping WETH...')
          // Wrap WETH!
          const tx = await user.sendTransaction({
            to: asset,
            value: depositAmount,
          })
          await tx.wait()
        }
      }

      const allowance = await assetContract.allowance(userAddress, factory)
      if (allowance < depositAmount) {
        // Approve the factory to spend the asset
        const tx = await assetContract.approve(factory, depositAmount)
        await tx.wait()
      }

      const balance = await assetContract.balanceOf(userAddress)
      if (balance < depositAmount) {
        throw Error(
          `Insufficient balance (actual: ${balance}, expected: ${depositAmount})`
        )
      }

      console.log(`Deploying relay vault using factory ${factory}...`)
      // deploy the pool

      const tx = await factoryContract
        .deployPool(
          asset,
          name,
          symbol,
          yieldPool,
          delay,
          depositAmount,
          userAddress
        )
        .catch((e) => {
          console.log(e)
        })

      const receipt = await tx!.wait()
      const event = await getEvent(
        receipt!,
        'PoolDeployed',
        factoryContract.interface
      )

      const poolAddress = event.args.pool
      const timelock = event.args.timelock
      console.log(`relayPool deployed to: ${poolAddress}`)

      const path = ignitionPath + `pools/${chainId}/${poolAddress}/`
      await fs.promises.mkdir(path, { recursive: true })
      await fs.promises.writeFile(
        `${path}/params.json`,
        JSON.stringify(
          {
            asset,
            hyperlaneMailbox: await factoryContract.HYPERLANE_MAILBOX(),
            name,
            symbol,
            timelock,
            weth: await factoryContract.WETH(),
            yieldPool,
          },
          null,
          2
        )
      )

      await run('deploy:verify', {
        address: poolAddress,
        constructorArguments: [
          await factoryContract.HYPERLANE_MAILBOX(),
          asset,
          name,
          symbol,
          yieldPool,
          await factoryContract.WETH(),
          timelock,
        ],
      })

      console.log(
        `✅ relayPool '${name}' deployed successfully at: ${poolAddress}`
      )
    }
  )
