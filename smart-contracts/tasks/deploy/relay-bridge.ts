import fs from 'fs'
import { task } from 'hardhat/config'
import { networks } from '@relay-vaults/networks'
import { AutoComplete, Input } from 'enquirer'
import { getEvent } from '@relay-vaults/helpers'
import VerifiableBridgeModule from '../../ignition/modules/VerifiableBridgeModule'

const ignitionPath = __dirname + '/../../ignition/deployments/'

task('deploy:bridge', 'Deploy a bridge from the factory.')
  .addOptionalParam('factory', 'The Bridge Factory address')
  .addOptionalParam('proxyBridge', 'The Proxy bridge asset')
  .addOptionalParam('asset', 'An ERC20 asset')
  .setAction(
    async (
      { factory, asset: assetAddress, proxyBridge: proxyBridgeAddress },
      { ethers }
    ) => {
      const { chainId } = await ethers.provider.getNetwork()
      const { assets } = networks[chainId.toString()]

      if (!factory) {
        // Read it from the files!
        const folder = `RelayBridgeFactory-${chainId.toString()}`
        const factoryData = require(
          ignitionPath + `${folder}/deployed_addresses.json`
        )
        factory = factoryData['RelayBridgeFactory#RelayBridgeFactory']
      }

      if (!proxyBridgeAddress) {
        proxyBridgeAddress = await new Input({
          message:
            'Please enter a proxy bridge address on this network or type enter to deploy a new one:',
          name: 'proxyBridgeAddress',
        }).run()
        // Err, we need to deploy one here!
        if (!proxyBridgeAddress) {
          proxyBridgeAddress = await run('deploy:bridge-proxy', {})
        }
      }

      if (!assetAddress) {
        const asset = await new AutoComplete({
          choices: ['native', ...Object.keys(assets)],
          message:
            'Please choose the asset for your relay bridge (make sure it is supported by the proxy bridge you selected):',
          name: 'asset',
        }).run()
        if (asset === 'native') {
          assetAddress = ethers.ZeroAddress
        } else {
          assetAddress = assets[asset]
        }
      }

      const factoryContract = await ethers.getContractAt(
        'RelayBridgeFactory',
        factory
      )

      const tx = await factoryContract.deployBridge(
        assetAddress,
        proxyBridgeAddress
      )
      const receipt = await tx.wait()
      const event = await getEvent(
        receipt!,
        'BridgeDeployed',
        factoryContract.interface
      )
      const bridgeAddress = event.args.bridge

      await run('deploy:verify', {
        address: bridgeAddress,
        constructorArguments: [
          assetAddress,
          proxyBridgeAddress,
          await factoryContract.HYPERLANE_MAILBOX(),
        ],
      })

      const path = ignitionPath + `bridges/${chainId}/${bridgeAddress}/`
      await fs.promises.mkdir(path, { recursive: true })
      await fs.promises.writeFile(
        `${path}/params.json`,
        JSON.stringify(
          {
            assetAddress,
            hyperlaneMailbox: await factoryContract.HYPERLANE_MAILBOX(),
            proxyBridgeAddress,
          },
          null,
          2
        )
      )

      console.log(`✅ RelayBridge deployed to: ${bridgeAddress}`)
    }
  )

task(
  'deploy:bridge-verifiable',
  'Deploy a bridge contract by itself and verifies it'
).setAction(async (_, { ethers, ignition }) => {
  const { chainId } = await ethers.provider.getNetwork()

  const { relayBridge } = await ignition.deploy(VerifiableBridgeModule, {
    deploymentId: `VerifiableBridge-${chainId.toString()}`,
  })
  const relayBridgeAddress = await relayBridge.getAddress()

  await run('deploy:verify', {
    address: relayBridgeAddress,
    constructorArguments: [
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      ethers.ZeroAddress,
    ],
  })

  console.log(`✅ RelayBridge deployed to: ${relayBridgeAddress}`)
})
