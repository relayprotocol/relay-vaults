import { task } from 'hardhat/config'
import { Select, Input } from 'enquirer'
import { networks } from '@relay-protocol/networks'
import { L2NetworkConfig } from '@relay-protocol/types'
import { getPoolsForNetwork } from '../deploy/bridge-proxy'

task('pool:add-origin', 'Add origin for a pool')
  .addOptionalParam('pool', 'the pool address')
  .addOptionalParam('bridge', 'the address of the bridge contract on the L2')
  .addOptionalParam('l2ChainId', 'the chain id of the L2 network')
  .addOptionalParam('proxyBridge', 'the origin proxyBridge (on this L1)')
  .addOptionalParam('maxDebt', 'the maximum debt coming from the origin')
  .addOptionalParam('bridgeFee', 'the fee (basis point) applied to this bridge')
  .addOptionalParam('curator', "the curator's address for this origin")
  .addOptionalParam('coolDown', 'the cool down period for this origin')
  .setAction(
    async (
      {
        l2ChainId,
        pool: poolAddress,
        proxyBridge,
        bridge: bridgeAddress,
        maxDebt,
        bridgeFee,
        curator,
        coolDown,
      },
      { ethers }
    ) => {
      const { chainId } = await ethers.provider.getNetwork()
      const network = networks[chainId.toString()] as L2NetworkConfig

      if (network.l1ChainId) {
        throw Error('Origins can only be added on L1')
      }

      if (!poolAddress) {
        const pools = await getPoolsForNetwork(Number(chainId))
        poolAddress = await new Select({
          name: 'poolAddress',
          message: 'Please chose the relay vault address:',
          choices: pools.map((pool) => {
            return {
              message: pool.params.name,
              value: pool.address,
            }
          }),
        }).run()
      }

      if (!bridgeAddress) {
        // Read it from the files!
      }

      const pool = await ethers.getContractAt('RelayPool', poolAddress)

      if (!l2ChainId) {
        // We need to select the L2 chain!
        const possibleL2s = Object.values(networks).filter(
          (n) => (n as L2NetworkConfig).l1ChainId == chainId
        )
        const l2chainName = await new Select({
          message: 'On what network is this origin?',
          choices: possibleL2s.map((network) => network.name),
        }).run()
        l2ChainId = possibleL2s.find(
          (network) => network.name === l2chainName
        )?.chainId
      }

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

      const bridgeProxyAddress = await relayBridge.bridgeProxy()
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
          message: 'What is the maximum debt for this origin?',
          default: 100,
        }).run()
        maxDebt = ethers.parseUnits(maxDebtInDecimals.toString(), decimals)
      }

      if (!bridgeFee) {
        bridgeFee = await new Input({
          message: 'What is the bridge fee, in basis points?',
          default: 10,
        }).run()
      }
      if (!curator) {
        const poolCurator = await pool.owner()
        curator = await new Input({
          message:
            "Who should be curator for that origin? They can instantly suspend the origin. (default is the pool's curator)",
          default: poolCurator,
        }).run()
      }

      if (!coolDown) {
        coolDown = await new Input({
          message:
            'What should the shortest delay between a bridge initiation and the actual transfer from the pool? (in seconds)',
          default: 60 * 30, // 30 minutes
        }).run()
      }

      // Get the timelock that owns the pool
      const timelockAddress = await pool.owner()
      console.log(`Pool is owned by timelock at: ${timelockAddress}`)

      // Get the timelock contract
      const timelock = await ethers.getContractAt(
        'TimelockControllerUpgradeable',
        timelockAddress
      )

      // addOrigin parameters
      const addOriginParams = {
        curator,
        chainId: l2ChainId,
        bridge: bridgeAddress,
        proxyBridge,
        maxDebt,
        bridgeFee,
        coolDown,
      }

      // Encode the function call to addOrigin
      const encodedCall = pool.interface.encodeFunctionData('addOrigin', [
        addOriginParams,
      ])

      // Get the current timestamp for the timelock
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const delaySeconds = await timelock.getMinDelay()
      const eta = currentTimestamp + Number(delaySeconds)

      console.log(
        `Scheduling transaction through timelock with delay: ${delaySeconds} seconds`
      )
      console.log(
        `Estimated execution time: ${new Date(eta * 1000).toLocaleString()}`
      )

      // schedule the tx through the timelock
      const operation = [
        poolAddress, // target
        0n, // value
        encodedCall, // data
        ethers.ZeroHash, // predecessor
        ethers.id(`ADD_ORIGIN_${l2ChainId}_${Date.now()}`), //salt
        delaySeconds, // delay
      ]
      const tx = await timelock.schedule(...operation)

      await tx.wait()
      console.log('✅ Transaction scheduled through timelock!')
      console.log(
        `Transaction can be executed after: ${new Date(eta * 1000).toLocaleString()}`
      )

      // Print the execution command for reference
      console.log('\nTo execute this transaction use:')
      console.log(operation)
    }
  )
