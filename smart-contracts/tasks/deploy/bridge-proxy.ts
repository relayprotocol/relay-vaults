import { task } from 'hardhat/config'
import { networks } from '@relay-vaults/networks'
import { type BaseContract } from 'ethers'
import { Select, Confirm, Input } from 'enquirer'
import fs from 'fs'

import CCTPBridgeProxyModule from '../../ignition/modules/CCTPBridgeProxyModule'
import OPStackNativeBridgeProxyModule from '../../ignition/modules/OPStackNativeBridgeProxyModule'
import ArbitrumOrbitNativeBridgeProxyModule from '../../ignition/modules/ArbitrumOrbitNativeBridgeProxyModule'
import { deployContract } from '../../lib/zksync'
import ZkSyncBridgeProxyModule from '../../ignition/modules/ZkSyncBridgeProxyModule'
import { VaultNetworkConfig, OriginNetworkConfig } from '@relay-vaults/types'
import { getProvider } from '@relay-vaults/helpers'

const ignitionPath = __dirname + '/../../ignition/deployments'

export const getPoolsForNetwork = async (chainId: number) => {
  console.log(`${ignitionPath}/pools/${chainId}`)
  const pools = await fs.promises.readdir(`${ignitionPath}/pools/${chainId}`)
  return pools.map((address) => {
    return {
      address: address,
      params: require(
        `${ignitionPath}/pools/${chainId}/${address}/params.json`
      ),
    }
  })
}

export const getBridgesForNetwork = async (chainId: number) => {
  const bridges = await fs.promises.readdir(
    `${ignitionPath}/bridges/${chainId}`
  )
  return bridges.map((address) => {
    return {
      address: address,
      params: require(
        `${ignitionPath}/bridges/${chainId}/${address}/params.json`
      ),
    }
  })
}

task('deploy:bridge-proxy', 'Deploy a bridge proxy')
  .addOptionalParam('type', 'the type of bridge to deploy')
  .addOptionalParam(
    'poolAddress',
    'the relay vault address where the funds are eventually sent'
  )
  .addOptionalParam(
    'parentBridgeProxy',
    'The address of the bridge proxy on L1'
  )
  .setAction(async ({ type, poolAddress, parentBridgeProxy }, hre) => {
    const { ethers, ignition } = hre
    const { chainId } = await ethers.provider.getNetwork()
    const networkConfig = networks[chainId.toString()]
    const { bridges, name: networkName } = networkConfig as VaultNetworkConfig

    // eslint-disable-next-line prefer-const
    let { parentChainId, stack } = networkConfig as OriginNetworkConfig

    const isL2 = !!parentChainId

    // pick a type
    const types = ['cctp', 'optimism', 'arbitrum', 'zksync']
    if (!type) {
      type = await new Select({
        choices: types,
        default: stack,
        message: 'Please choose a proxy type?',
        name: 'type',
      }).run()
    }
    console.log(
      `Deploying ${isL2 ? Number(parentChainId) : Number(chainId)} bridge proxy...`
    )

    if (!poolAddress) {
      const poolNetwork = isL2 ? Number(parentChainId) : Number(chainId)
      const pools = await getPoolsForNetwork(poolNetwork)
      poolAddress = await new Select({
        choices: pools.map((pool) => {
          return {
            message: `${pool.params.name} (${pool.address})`,
            value: pool.address,
          }
        }),
        message: `Please choose the relay vault address on ${poolNetwork}:`,
        name: 'poolAddress',
      }).run()
    }

    // double check if our L2 stack is correct
    if (isL2) {
      if (stack != type && type != 'cctp') {
        const confirmType = await new Confirm({
          message: `Are you sure ${type} is correct stack for ${networkName} ?`,
          name: 'confirmType',
        }).run()
        if (!confirmType) {
          return
        }
      }
    }

    if (isL2) {
      if (!parentBridgeProxy) {
        // Get it from the file!
        try {
          const parentBridgeProxyFile = `BridgeProxy-${parentChainId}-${poolAddress}-${type}/deployed_addresses.json`
          const addresses = require(ignitionPath + parentBridgeProxyFile)
          parentBridgeProxy = Object.values(addresses)[0]
        } catch (error) {
          // Ignore
        }

        if (!parentBridgeProxy) {
          parentBridgeProxy = await new Input({
            message:
              'Please enter the address of the corresponding BridgeProxy on the l1 :',
            name: 'parentBridgeProxy',
          }).run()
        }
        // check that pool settings on L1 are correct
        const parentProvider = await getProvider(parentChainId)
        const parentBridgeProxyContract = await new ethers.Contract(
          parentBridgeProxy,
          (
            await ethers.getContractAt('BridgeProxy', ethers.ZeroAddress)
          ).interface,
          parentProvider
        )
        const vaultChainBridgeProxyPool =
          await parentBridgeProxyContract.RELAY_POOL()
        const vaultChainBridgeProxyChainId =
          await parentBridgeProxyContract.RELAY_POOL_CHAIN_ID()

        // l1BridgeProxy
        if (
          !(
            vaultChainBridgeProxyPool === poolAddress &&
            Number(vaultChainBridgeProxyChainId) === Number(parentChainId)
          )
        ) {
          throw Error(
            `The bridge proxy on the vault chain (${vaultChainBridgeProxyPool} - ${vaultChainBridgeProxyChainId}) does not match the pool (${poolAddress} = ${parentChainId})`
          )
        }

        // TODO: can we check that this is the same type of bridge?
      }
    } else {
      // We are deploying the BridgeProxy on an L1 chain
      parentChainId = chainId
      parentBridgeProxy = ethers.ZeroAddress // The parentBridgeProxy is the one to be deployed!
    }

    // parse args for all proxies
    const defaultProxyModuleArguments = {
      parentBridgeProxy,
      relayPool: poolAddress,
      relayPoolChainId: parentChainId,
    }

    // for verification
    let constructorArguments: any[]

    // get args value
    const { name } = networks[chainId.toString()]
    console.log(`deploying ${type} proxy bridge on ${name} (${chainId})...`)

    // deploy bridge proxy
    let proxyBridgeAddress
    let proxyBridge: BaseContract

    const deploymentId = `BridgeProxy-${chainId}-${poolAddress}-${type}`

    if (type === 'cctp') {
      const {
        bridges: {
          cctp: { messenger },
        },
        assets: { usdc: USDC },
      } = networks[chainId.toString()]
      const parameters = {
        CCTPBridgeProxy: {
          messenger,
          usdc: USDC,
          ...defaultProxyModuleArguments,
        },
      }

      // for verification
      constructorArguments = [messenger, USDC]

      // deploy CCTP bridge
      ;({ bridge: proxyBridge } = await ignition.deploy(CCTPBridgeProxyModule, {
        deploymentId,
        parameters,
      }))
      proxyBridgeAddress = await proxyBridge.getAddress()
      console.log(`✅ CCTP bridge deployed at: ${proxyBridgeAddress}`)
    } else if (type === 'optimism') {
      const parameters = {
        OPStackNativeBridgeProxy: {
          l1BridgeProxy: defaultProxyModuleArguments.parentBridgeProxy,
          relayPool: defaultProxyModuleArguments.relayPool,
          relayPoolChainId: defaultProxyModuleArguments.relayPoolChainId,
        },
      }

      // deploy OP bridge
      ;({ bridge: proxyBridge } = await ignition.deploy(
        OPStackNativeBridgeProxyModule,
        {
          deploymentId,
          parameters,
        }
      ))
      proxyBridgeAddress = await proxyBridge.getAddress()

      // for verification
      constructorArguments = []
      console.log(`✅ OPStack bridge deployed at: ${proxyBridgeAddress}`)
    } else if (type === 'arbitrum') {
      // on L1 we don't need the routerGateway as it is only used in the `bridge` call
      const routerGateway = isL2
        ? bridges?.arbitrum?.child.routerGateway
        : ethers.ZeroAddress

      const parameters = {
        ArbitrumOrbitNativeBridgeProxy: {
          l1BridgeProxy: defaultProxyModuleArguments.parentBridgeProxy,
          relayPool: defaultProxyModuleArguments.relayPool,
          relayPoolChainId: defaultProxyModuleArguments.relayPoolChainId,
          routerGateway,
        },
      }
      // deploy ARB bridge
      ;({ bridge: proxyBridge } = await ignition.deploy(
        ArbitrumOrbitNativeBridgeProxyModule,
        {
          deploymentId,
          parameters,
        }
      ))
      proxyBridgeAddress = await proxyBridge.getAddress()

      // for verification
      constructorArguments = [routerGateway]
      console.log(`✅ ArbOrbit bridge deployed at: ${proxyBridgeAddress}`)
    } else if (type === 'zksync') {
      const l2SharedDefaultBridge = bridges.zksync!.child.sharedDefaultBridge!
      const l1SharedDefaultBridge = bridges.zksync!.parent.sharedDefaultBridge!
      // for verification
      constructorArguments = [l2SharedDefaultBridge]
      if (stack === 'zksync') {
        // deploy using `deployContract` helper (for zksync L2s)
        ;({ address: proxyBridgeAddress } = await deployContract(
          hre,
          'ZkSyncBridgeProxy',
          [
            l2SharedDefaultBridge,
            parentChainId,
            poolAddress,
            parentBridgeProxy,
          ],
          deploymentId
        ))
      } else {
        // used ignition to deploy bridge on L1
        const parameters = {
          ZkSyncBridgeProxy: {
            l1SharedDefaultBridge,
            l2SharedDefaultBridge,
            ...defaultProxyModuleArguments,
          },
        }
        ;({ bridge: proxyBridge } = await ignition.deploy(
          ZkSyncBridgeProxyModule,
          {
            deploymentId,
            parameters,
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
        defaultProxyModuleArguments.parentBridgeProxy,
      ],
    })

    return proxyBridgeAddress
  })
