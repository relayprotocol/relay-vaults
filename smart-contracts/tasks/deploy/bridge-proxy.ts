import { task } from 'hardhat/config'
import { networks } from '@relay-protocol/networks'
import { type BaseContract } from 'ethers'
import { AutoComplete, Confirm } from 'enquirer'

import CCTPBridgeProxyModule from '../../ignition/modules/CCTPBridgeProxyModule'
import OPStackNativeBridgeProxyModule from '../../ignition/modules/OPStackNativeBridgeProxyModule'
import ArbitrumOrbitNativeBridgeProxyModule from '../../ignition/modules/ArbitrumOrbitNativeBridgeProxyModule'
import { deployContract } from '../../lib/zksync'
import ZkSyncBridgeProxyModule from '../../ignition/modules/ZkSyncBridgeProxyModule'
import { L2NetworkConfig } from '@relay-protocol/types'
import { getAddresses } from '@relay-protocol/addresses'

task('deploy:bridge-proxy', 'Deploy a bridge proxy')
  .addOptionalParam('type', 'the type of bridge to deploy')
  .addParam(
    'poolAddress',
    'the relay pool address where the funds are eventually sent'
  )
  .addOptionalParam('l1BridgeProxy', 'The address of the bridge proxy on L1')
  .setAction(async ({ type, poolAddress, l1BridgeProxy }, hre) => {
    const { ethers, ignition } = hre
    const { chainId } = await ethers.provider.getNetwork()
    const networkConfig = networks[chainId.toString()]
    const { bridges, isZKsync, name: networkName } = networkConfig

    // eslint-disable-next-line prefer-const
    let { l1ChainId, stack } = networkConfig as L2NetworkConfig

    const isL2 = !!l1ChainId

    // pick a type
    const types = ['cctp', 'op', 'arb', 'zksync']
    if (!type) {
      type = await new AutoComplete({
        name: 'type',
        message: 'Please choose a proxy type?',
        choices: types,
        default: stack,
      }).run()
    }

    // double check if our L2 stack is correct
    if (isL2) {
      if (stack != type && type != 'cctp') {
        const confirmType = await new Confirm({
          name: 'confirmType',
          message: `Are you sure ${type} is correct stack for ${networkName} ?`,
        }).run()
        if (!confirmType) {
          return
        }
      }
    }

    if (isL2) {
      if (!l1BridgeProxy) {
        const l1DeployedAddresses = getAddresses()[l1ChainId]
        if (!l1DeployedAddresses.BridgeProxy[type]) {
          throw new Error(
            `No ${type} bridge proxy deployed on L1! Please deploy it first.
Make sure to run 'yarn workspace @relay-protocol addresses generate' afterwards`
          )
        }
        // We are deploying the BridgeProxy on an L2 chain
        l1BridgeProxy = l1DeployedAddresses.BridgeProxy[type]
      }
    } else {
      // We are deploying the BridgeProxy on an L1 chain
      l1ChainId = chainId
      l1BridgeProxy = ethers.ZeroAddress // The l1BridgeProxy is the one to be deployed!
    }

    // parse args for all proxies
    const defaultProxyModuleArguments = {
      relayPoolChainId: l1ChainId,
      relayPool: poolAddress,
      l1BridgeProxy,
    }

    // for verification
    let constructorArguments: any[]

    // get args value
    const { name } = networks[chainId.toString()]
    console.log(`deploying ${type} proxy bridge on ${name} (${chainId})...`)

    // deploy bridge proxy
    let proxyBridgeAddress
    let proxyBridge: BaseContract

    const deploymentId = `BridgeProxy-${type}-${chainId.toString()}`
    if (type === 'cctp') {
      const {
        bridges: {
          cctp: { messenger, transmitter },
        },
        assets: { usdc: USDC },
      } = networks[chainId.toString()]
      const parameters = {
        CCTPBridgeProxy: {
          messenger,
          transmitter,
          usdc: USDC,
          ...defaultProxyModuleArguments,
        },
      }

      // for verification
      constructorArguments = [messenger, transmitter, USDC]

      // deploy CCTP bridge
      ;({ bridge: proxyBridge } = await ignition.deploy(CCTPBridgeProxyModule, {
        parameters,
        deploymentId,
      }))
      proxyBridgeAddress = await proxyBridge.getAddress()
      console.log(`✅ CCTP bridge deployed at: ${proxyBridgeAddress}`)
    } else if (type === 'op') {
      const portalProxy = bridges.op!.portalProxy! || ethers.ZeroAddress // Only used on the L1 deployments (to claim the assets)
      const parameters = {
        OPStackNativeBridgeProxy: {
          portalProxy,
          ...defaultProxyModuleArguments,
        },
      }

      // deploy OP bridge
      ;({ bridge: proxyBridge } = await ignition.deploy(
        OPStackNativeBridgeProxyModule,
        {
          parameters,
          deploymentId,
        }
      ))
      proxyBridgeAddress = await proxyBridge.getAddress()

      // for verification
      constructorArguments = [portalProxy]
      console.log(`✅ OPStack bridge deployed at: ${proxyBridgeAddress}`)
    } else if (type === 'arb') {
      const routerGateway = bridges.arb!.routerGateway
      const outbox = bridges.arb!.outbox || ethers.ZeroAddress // Only used on the L1 deployments (to claim the assets)

      const parameters = {
        ArbitrumOrbitNativeBridgeProxy: {
          routerGateway,
          outbox,
          ...defaultProxyModuleArguments,
        },
      }
      // deploy ARB bridge
      ;({ bridge: proxyBridge } = await ignition.deploy(
        ArbitrumOrbitNativeBridgeProxyModule,
        {
          parameters,
          deploymentId,
        }
      ))
      proxyBridgeAddress = await proxyBridge.getAddress()

      // for verification
      constructorArguments = [routerGateway, outbox]
      console.log(`✅ ArbOrbit bridge deployed at: ${proxyBridgeAddress}`)
    } else if (type === 'zksync') {
      const l2SharedDefaultBridge = bridges.zksync!.l2SharedDefaultBridge!
      const l1SharedDefaultBridge = bridges.zksync!.l1SharedDefaultBridge!
      // for verification
      constructorArguments = [l2SharedDefaultBridge, l1SharedDefaultBridge]
      if (isZKsync) {
        // deploy using `deployContract` helper (for zksync L2s)
        ;({ address: proxyBridgeAddress } = await deployContract(
          hre,
          'ZkSyncBridgeProxy',
          [
            l2SharedDefaultBridge,
            l1SharedDefaultBridge,
            l1ChainId,
            poolAddress,
            l1BridgeProxy,
          ]
        ))
      } else {
        // used ignition to deploy bridge on L1
        const parameters = {
          ZkSyncBridgeProxy: {
            l2SharedDefaultBridge,
            l1SharedDefaultBridge,
            ...defaultProxyModuleArguments,
          },
        }
        ;({ bridge: proxyBridge } = await ignition.deploy(
          ZkSyncBridgeProxyModule,
          {
            parameters,
            deploymentId,
          }
        ))
        proxyBridgeAddress = await proxyBridge.getAddress()
      }
      console.log(
        `✅ Zksync BridgeProxy contract deployed at ${proxyBridgeAddress}`
      )
    }

    // verify!
    await run('deploy:verify', {
      address: proxyBridgeAddress,
      constructorArguments: [
        ...constructorArguments,
        defaultProxyModuleArguments.relayPoolChainId,
        defaultProxyModuleArguments.relayPool,
        defaultProxyModuleArguments.l1BridgeProxy,
      ],
    })

    if (!isL2) {
      console.log(
        "\n ⚠️ Please update L1 addresses in './packages/addresses' to update "
      )
    }

    return proxyBridgeAddress
  })
