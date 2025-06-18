import { task } from 'hardhat/config'
import { getPoolsForNetwork } from '../deploy/bridge-proxy'
import networks from '@relay-vaults/networks'
import { Select, Confirm } from 'enquirer'
import { executeThruTimelock } from '../../lib/multisig'
import { ZeroAddress } from 'ethers'
import TokenSwapModule from '../../ignition/modules/TokenSwapModule'
import { quote } from '../../lib/uniswap'

task(
  'pool:collect-morpho',
  "Collects MORPHO rewards for a pool contract and instantly swaps them in the pool's assets."
)
  .addOptionalParam('pool', 'the pool address')
  .setAction(async ({ pool: poolAddress }, { ethers, ignition }) => {
    const [user] = await ethers.getSigners()
    const { chainId } = await ethers.provider.getNetwork()
    const network = networks[chainId.toString()]

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

    // Get the amount of rewards!
    const rewardResponse = await fetch(
      `https://rewards.morpho.org/v1/users/${poolAddress}/distributions`
    )
    const { data: rewards } = await rewardResponse.json()

    if (rewards.length === 0) {
      console.log('No rewards to claim.')
      return
    }
    for (const reward of rewards) {
      const token = await ethers.getContractAt('MyToken', reward.asset.address)
      const [decimals, symbol] = await Promise.all([
        token.decimals(),
        token.symbol(),
      ])
      const amount = ethers.formatUnits(reward.claimable, decimals)
      const confirmClaim = await new Confirm({
        message: `The pool is elligible for ${amount} ${symbol}. Do you want to claim, convert and add to the pool's assets?`,
        name: 'confirmClaim',
      }).run()
      if (!confirmClaim) {
        return
      }
      const claimTx = await user.sendTransaction({
        data: reward.tx_data,
        to: reward.distributor.address,
      })
      await claimTx.wait()

      const balance = await token.balanceOf(poolAddress)
      if (balance === 0n) {
        console.log(
          `The pool has no ${symbol} balance. Please make sure to claim the rewards first.`
        )
        return
      }
      const pool = await ethers.getContractAt('RelayPool', poolAddress)
      const timelockAddress = await pool.owner()
      const asset = await pool.asset()

      // Check if the pool has a token swap contract
      const tokenSwapContract = await pool.tokenSwapAddress()
      if (tokenSwapContract == ZeroAddress) {
        const confirmDeploy = await new Confirm({
          message:
            'The pool currently does not have a token swap contract. Do you want to deploy one?',
          name: 'confirmDeploy',
        }).run()
        if (!confirmDeploy) {
          return
        }
        if (!network.uniswapV3?.universalRouterAddress) {
          console.error(
            'No uniswap router address found for this network configured for this network.'
          )
          return
        }
        const { universalRouterAddress } = network.uniswapV3
        const { tokenSwap } = await ignition.deploy(TokenSwapModule, {
          parameters: {
            TokenSwap: {
              uniswapUniversalRouter: universalRouterAddress,
            },
          },
        })

        const tokenSwapAddress = await tokenSwap.getAddress()
        console.log(`Deploying token swap contract at ${tokenSwapAddress}.`)
        await run('deploy:verify', {
          address: tokenSwapAddress,
          constructorArguments: [universalRouterAddress],
        })

        const encodedCall = pool.interface.encodeFunctionData('setTokenSwap', [
          tokenSwapAddress,
        ])
        console.log('Setting the token swap address on the pool.')

        await executeThruTimelock(
          ethers,
          timelockAddress,
          user,
          encodedCall,
          poolAddress,
          0n
        )
      }

      // And now prepare the swap
      const deadline = Math.floor(Date.now() / 1000) + 300
      const uniswapPoolFeeWethToAsset = asset === network.assets.weth ? 0 : 3000 // We assume 3000 for most assets... this may not be correct.
      console.log(
        `Swapping ${ethers.formatUnits(balance, decimals)} ${symbol} for the pool's asset and depositing it.`
      )

      const minimumAmount = await quote({
        amount: balance,
        ethers,
        poolFee: uniswapPoolFeeWethToAsset,
        tokenIn: reward.asset.address,
        tokenOut: asset,
        weth: network.assets.weth,
      })

      const encodedCall = pool.interface.encodeFunctionData('swapAndDeposit', [
        reward.asset.address,
        balance,
        3000, // uniswapPoolFee morpho > WETH
        uniswapPoolFeeWethToAsset,
        deadline,
        minimumAmount,
      ])

      await executeThruTimelock(
        ethers,
        timelockAddress,
        user,
        encodedCall,
        poolAddress,
        minimumAmount
      )
    }
  })
