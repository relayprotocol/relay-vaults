import { task } from 'hardhat/config'
import { Select, Input, Confirm } from 'enquirer'
import { networks } from '@relay-vaults/networks'
import { OriginNetworkConfig } from '@relay-vaults/types'
import {
  getPoolsForNetwork,
  getBridgesForNetwork,
} from '../deploy/bridge-proxy'
import { executeThruTimelock } from '../../lib/multisig'

task('pool:add-origin', 'Add origin for a pool')
  .addOptionalParam('pool', 'the pool address')
  .addOptionalParam('bridge', 'the address of the bridge contract on the L2')
  .addOptionalParam('l2ChainId', 'the chain id of the L2 network')
  .addOptionalParam('proxyBridge', 'the origin proxyBridge (on this L1)')
  .addOptionalParam('maxDebt', 'the maximum debt coming from the origin')
  .addOptionalParam(
    'bridgeFee',
    'the fee applied to this bridge (in fractional basis point)'
  )
  .addOptionalParam('curator', "the curator's address for this origin")
  .addOptionalParam('coolDown', 'the cool down period for this origin')
  .setAction(
    async (
      {
        pool: poolAddress,
        l2ChainId,
        bridge: bridgeAddress,
        proxyBridge,
        maxDebt,
        bridgeFee,
        curator,
        coolDown,
      },
      { ethers }
    ) => {
      const [user] = await ethers.getSigners()
      const userAddress = await user.getAddress()
      const { chainId } = await ethers.provider.getNetwork()
      const network = networks[chainId.toString()] as OriginNetworkConfig

      if (network.parentChainId) {
        throw Error('Origins can only be added on L1')
      }

      if (!poolAddress) {
        const pools = await getPoolsForNetwork(Number(chainId))
        poolAddress = await new Select({
          choices: pools.map((pool) => {
            return {
              message: pool.params.name,
              value: pool.address,
            }
          }),
          message: 'Please choose the relay vault address:',
          name: 'poolAddress',
        }).run()
      }

      const pool = await ethers.getContractAt('RelayPool', poolAddress)

      if (!l2ChainId) {
        // We need to select the L2 chain!
        const possibleL2s = Object.values(networks).filter(
          (n) => (n as OriginNetworkConfig).parentChainId == chainId
        )
        const l2chainName = await new Select({
          choices: possibleL2s.map((network) => network.name),
          message: 'On what network is this origin?',
        }).run()
        l2ChainId = possibleL2s.find(
          (network) => network.name === l2chainName
        )?.chainId
      }

      if (!bridgeAddress) {
        const bridges = await getBridgesForNetwork(Number(l2ChainId))
        bridgeAddress = await new Select({
          choices: bridges.map((bridge) => {
            return {
              message: bridge.params.name,
              value: bridge.address,
            }
          }),
          message: 'Please choose the bridge address:',
          name: 'bridgeAddress',
        }).run()
      }

      // Check that the bridge asset matches the pool?

      // get L2 bridge contracts settings
      const l2Network = networks[l2ChainId.toString()]
      const l2provider = new ethers.JsonRpcProvider(l2Network.rpc[0])

      // Create contract instances with the L2 provider (read-only)
      const relayBridgeInterface = (
        await ethers.getContractAt('RelayBridge', ethers.ZeroAddress)
      ).interface
      const relayBridge = new ethers.Contract(
        bridgeAddress,
        relayBridgeInterface,
        l2provider
      )

      const bridgeProxyAddress = await relayBridge.BRIDGE_PROXY()
      console.log(`BridgeProxy L2 address: ${bridgeProxyAddress}`)

      const bridgeProxyInterface = (
        await ethers.getContractAt('BridgeProxy', ethers.ZeroAddress)
      ).interface
      const l2BridgeProxy = new ethers.Contract(
        bridgeProxyAddress,
        bridgeProxyInterface,
        l2provider
      )

      if (
        (await l2BridgeProxy.RELAY_POOL_CHAIN_ID()) !== chainId ||
        (await l2BridgeProxy.RELAY_POOL()) !== poolAddress
      ) {
        throw Error(
          `Wrong bridge config on L2 chain (${l2ChainId}): ${bridgeAddress}`
        )
      }

      // get L1 bridge proxy from L2 contract
      if (!proxyBridge) {
        proxyBridge = await l2BridgeProxy.L1_BRIDGE_PROXY()
      }

      let decimals = 18n
      if ((await pool.asset()) !== ethers.ZeroAddress) {
        const asset = await ethers.getContractAt('MyToken', await pool.asset())
        decimals = await asset.decimals()
      }

      if (!maxDebt) {
        const maxDebtInDecimals = await new Input({
          default: 100,
          message: 'What is the maximum debt for this origin?',
        }).run()
        maxDebt = ethers.parseUnits(maxDebtInDecimals.toString(), decimals)
      }

      if (!bridgeFee) {
        const fractionalBpsDenominator = await pool.FRACTIONAL_BPS_DENOMINATOR()
        const bpsValue = (1 / Number(fractionalBpsDenominator)) * 10000 // Convert to basis points
        bridgeFee = await new Input({
          default: 10,
          message: `What is the bridge fee, in fractional basis points (1 = ${bpsValue.toFixed(8)} bps, denominator = ${fractionalBpsDenominator})?`,
        }).run()
      }

      const timelockAddress = await pool.owner()
      if (!curator) {
        curator = await new Input({
          default: userAddress,
          message:
            'Who should be curator for that origin? They can instantly suspend the origin. (default is you)',
        }).run()
      }

      if (!coolDown) {
        coolDown = await new Input({
          default: 60 * 30,
          message:
            'What should the shortest delay between a bridge initiation and the actual transfer from the pool? (in seconds)', // 30 minutes
        }).run()
      }

      // Get the timelock that owns the pool
      console.log(`Pool is owned by timelock at: ${timelockAddress}`)

      // addOrigin parameters
      const addOriginParams = {
        bridge: bridgeAddress,
        bridgeFee,
        chainId: l2ChainId,
        coolDown,
        curator,
        maxDebt,
        proxyBridge,
      }

      // Encode the function call to addOrigin
      const encodedCall = pool.interface.encodeFunctionData('addOrigin', [
        addOriginParams,
      ])

      // schedule the tx through the timelock
      const target = poolAddress // target
      const value = 0n // value
      const payload = encodedCall // data
      await executeThruTimelock(ethers, timelockAddress, payload, target, value)
    }
  )

task('pool:remove-origin', 'Removes an origin from a pool')
  .addOptionalParam('pool', 'the pool address')
  .addOptionalParam('bridge', 'the address of the bridge contract on the L2')
  .addOptionalParam('l2ChainId', 'the chain id of the L2 network')
  .setAction(
    async (
      { pool: poolAddress, l2ChainId, bridge: bridgeAddress },
      { ethers }
    ) => {
      const [user] = await ethers.getSigners()
      const userAddress = await user.getAddress()
      const { chainId } = await ethers.provider.getNetwork()
      const network = networks[chainId.toString()] as OriginNetworkConfig

      if (network.parentChainId) {
        throw Error('Origins can only be added on L1')
      }

      if (!poolAddress) {
        const pools = await getPoolsForNetwork(Number(chainId))
        poolAddress = await new Select({
          choices: pools.map((pool) => {
            return {
              message: pool.params.name,
              value: pool.address,
            }
          }),
          message: 'Please choose the relay vault address:',
          name: 'poolAddress',
        }).run()
      }

      const pool = await ethers.getContractAt('RelayPool', poolAddress)

      if (!l2ChainId) {
        // We need to select the L2 chain!
        const possibleL2s = Object.values(networks).filter(
          (n) => (n as OriginNetworkConfig).parentChainId == chainId
        )
        const l2chainName = await new Select({
          choices: possibleL2s.map((network) => network.name),
          message: 'On what network is this origin?',
        }).run()
        l2ChainId = possibleL2s.find(
          (network) => network.name === l2chainName
        )?.chainId
      }

      if (!bridgeAddress) {
        const bridges = await getBridgesForNetwork(Number(l2ChainId))
        bridgeAddress = await new Select({
          choices: bridges.map((bridge) => {
            return {
              message: bridge.params.name,
              value: bridge.address,
            }
          }),
          message: 'What is the address of the bridge you want to remove?',
          name: 'bridgeAddress',
        }).run()
      }

      const origin = await pool.authorizedOrigins(l2ChainId, bridgeAddress)
      if (origin.curator !== userAddress) {
        throw Error(
          `You are not the curator of this origin! (${origin.curator}), so you can't disable it`
        )
      }
      if (origin.maxDebt === 0n) {
        throw Error('This origin is already disabled!')
      }

      const confirm = await new Confirm({
        message: `Are you sure you want to disable ${bridgeAddress} on ${l2ChainId} .`,
        name: 'confirm',
      }).run()

      if (!confirm) {
        process.exit()
      }

      const tx = await pool.disableOrigin(l2ChainId, bridgeAddress)
      console.log(`✅ Transaction sent! ${tx.hash}`)
    }
  )

task(
  'pool:copy',
  'Copy all the origins from the "old" pool to the "new" pool'
).setAction(async (_, { ethers }) => {
  console.log('COPY!')
  const oldVaults = {
    contractAddress: '0x19426e122E0988e1f6ad246Af9B6553492C6D446',
    name: 'Wrapped Ether Relay Vault',
    origins: {
      items: [
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 185,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 690,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '69330716518957831920',
          maxDebt: '100000000000000000000',
          originChainId: 1135,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '72710201266063535797',
          maxDebt: '100000000000000000000',
          originChainId: 1868,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 1923,
        },
        {
          bridgeFee: 1,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 2741,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 7560,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 42170,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 43111,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 60808,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '100000000000000',
          maxDebt: '100000000000000000000',
          originChainId: 543210,
        },
        {
          bridgeFee: 5,
          coolDown: 120,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '200000000000000000000',
          originChainId: 7777777,
        },
        {
          bridgeFee: 5,
          coolDown: 60,
          curator: '0x1D682340264cF209257f24C3EDcb2a9fc0592535',
          currentOutstandingDebt: '0',
          maxDebt: '100000000000000000000',
          originChainId: 888888888,
        },
      ],
      totalCount: 13,
    },
    outstandingDebt: '231786760187260303225',
    totalAssets: '250861188412059610705',
  }

  const newVault = '0x57B68c4EA221ee8Da6eb14ebdfcCEE5177567771'
  for (let i = 0; i < oldVaults.origins.totalCount; i++) {
    const origin = oldVaults.origins.items[i]
    console.log(`Adding origin ${origin.originChainId}...`)
    // Check if we have an origin for this chainId!
    const pool = await ethers.getContractAt('RelayPool', newVault)
    // await hre.run('pool:add-origin', {
    //   pool: newVault,
    //   l2ChainId: origin.originChainId,
    //   bridge: oldVaults.contractAddress,
    //   maxDebt: origin.maxDebt,
    //   bridgeFee: origin.bridgeFee,
    //   curator: origin.curator,
    //   coolDown: origin.coolDown,
    // })
  }
})
