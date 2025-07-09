import { task } from 'hardhat/config'
import { networks } from '@relay-vaults/networks'
import { type BaseContract } from 'ethers'
import { Select } from 'enquirer'
import fs from 'fs'

import CCTPBridgeProxyModule from '../../ignition/modules/CCTPBridgeProxyModule'
import OPStackNativeBridgeProxyModule from '../../ignition/modules/OPStackNativeBridgeProxyModule'
import ArbitrumOrbitNativeBridgeProxyModule from '../../ignition/modules/ArbitrumOrbitNativeBridgeProxyModule'
import { deployContract } from '../../lib/zksync'
import ZkSyncBridgeProxyModule from '../../ignition/modules/ZkSyncBridgeProxyModule'
import { VaultNetworkConfig, OriginNetworkConfig } from '@relay-vaults/types'
import { getProvider } from '@relay-vaults/helpers'

const ignitionPath = __dirname + '/../../ignition/deployments/'

export const getPoolsForNetwork = async (chainId: number) => {
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

task(
  'deploy:bridge-proxy',
  "Deploy a bridge proxy contract pair. The hardhat network should be the network on which you want to deploy a proxyBridge contract. I can either be the pool's network or the origin network."
)
  .addOptionalParam('type', 'the type of bridge to deploy')
  .addOptionalParam(
    'poolAddress',
    'the relay vault address where the funds are eventually sent on this network'
  )
  .addOptionalParam('originChainId', 'the chain ID of the origin')
  .addOptionalParam('poolChainId', 'the chain ID of the pool')
  .setAction(
    async (
      { type, poolAddress, originChainId, poolChainId },
      { ethers, ignition }
    ) => {
      const { chainId } = await ethers.provider.getNetwork()
      if (!poolChainId) {
        // We need to get a network from the networks!
        poolChainId = await new Select({
          choices: Object.values(networks).map((network) => {
            return {
              message: network.name,
              value: network.chainId.toString(),
            }
          }),
          message: 'Please, select the pool network:',
        }).run()
      }

      const poolNetworkConfig = networks[poolChainId] as VaultNetworkConfig

      if (!originChainId) {
        // We need to get a network from the networks!
        originChainId = await new Select({
          choices: Object.values(networks).map((network) => {
            return {
              message: network.name,
              value: network.chainId.toString(),
            }
          }),
          message: 'Please, select the origin network:',
        }).run()
      }
      const originNetworkConfig = networks[originChainId] as OriginNetworkConfig

      const types = Object.keys(originNetworkConfig.bridges)
      if (!type) {
        type = await new Select({
          choices: types,
          message: 'Please choose a proxy type?',
          name: 'type',
        }).run()
      }

      if (!poolAddress) {
        const pools = await getPoolsForNetwork(Number(poolChainId))
        poolAddress = await new Select({
          choices: pools.map((pool) => {
            return {
              message: `${pool.params.name} (${pool.address})`,
              value: pool.address,
            }
          }),
          message: `Please choose the relay vault address on ${poolNetworkConfig.name}:`,
          name: 'poolAddress',
        }).run()
      }

      // parse args for all proxies
      const defaultProxyModuleArguments = {
        parentBridgeProxy: ethers.ZeroAddress,
        relayPool: poolAddress,
        relayPoolChainId: poolChainId, // default
      }

      if (Number(chainId) !== Number(poolChainId)) {
        // We need to get the l1BridgeProxy
        const parentDeploymentId = `BridgeProxy-${originChainId}-${poolAddress}-${type}-${poolChainId}`
        try {
          const deploymentData = require(
            ignitionPath + `${parentDeploymentId}/deployed_addresses.json`
          )
          defaultProxyModuleArguments.parentBridgeProxy =
            Object.values(deploymentData)[0]
        } catch (error) {
          console.error(
            'Please make sure you deploy the proxyBridge on the pool chain first!'
          )
          process.exit(1)
        }
      }

      // for verification
      let constructorArguments: any[]

      // get args value
      const { name } = networks[chainId.toString()]
      console.log(
        `📦 Deploying ${type} proxy bridge on ${name} (${chainId})...`
      )

      // deploy bridge proxy
      let proxyBridgeAddress
      let proxyBridge: BaseContract

      const deploymentId = `BridgeProxy-${originChainId}-${poolAddress}-${type}-${chainId}`

      if (type === 'cctp') {
        console.error('Missing implementation for CCTP!')
        process.exit(1)
      } else if (type === 'optimism') {
        // Do we have a parent bridge proxy?
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
        console.error('Missing implementation for Arbitrum!')
        process.exit(1)
      } else if (type === 'zksync') {
        console.error('Missing implementation for Zksync!')
        process.exit(1)
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
    }
  )
