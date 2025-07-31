import {
  ABIs,
  estimateNativeBridgeTicketCost,
  getBalance,
  checkAllowance,
  getEvent,
} from '@relay-vaults/helpers'
import { Select, Input, Confirm } from 'enquirer'
import { task } from 'hardhat/config'
import { networks } from '@relay-vaults/networks'
import { getBridgesForNetwork } from './deploy/bridge-proxy'
import { AbiCoder } from 'ethers'

task('bridge:send', 'Send tokens to a pool across a relay bridge')
  .addOptionalParam('asset', 'The address of the asset you want to bridge')
  .addOptionalParam('bridge', 'The Relay Bridge contract address')
  .addOptionalParam('amount', 'the amount of tokens to send')
  .addOptionalParam('recipient', 'The recipient of the funds (default to self)')
  .setAction(
    async (
      { bridge: bridgeAddress, amount, recipient, asset },
      { ethers: rawEthers, zksyncEthers }
    ) => {
      const { chainId } = await rawEthers.provider.getNetwork()
      const net = networks[chainId.toString()]

      if (!net) {
        throw Error(
          `Unsupported network ${chainId}. Please add it to networks.ts`
        )
      }
      const ethers = net.stack === 'zksync' ? zksyncEthers : rawEthers

      const [user] = await ethers.getSigners()
      if (!user) {
        throw Error('Please use a valid signer')
      }
      const userAddress = await user.getAddress()

      if (!asset) {
        const assetName = await new Select({
          choices: ['native', ...Object.keys(net.assets)],
          message: 'Please choose the asset you want to bridge:',
          name: 'asset',
        }).run()
        if (assetName === 'native') {
          asset = rawEthers.ZeroAddress
        } else {
          asset = net.assets[assetName]
        }
      }

      if (!bridgeAddress) {
        const bridges = await getBridgesForNetwork(Number(chainId))

        for (let i = 0; i < bridges.length; i++) {
          const bridgeContract = await rawEthers.getContractAt(
            'RelayBridge',
            bridges[i].address
          )
          const bridgeAsset = await bridgeContract.ASSET()
          if (bridgeAsset === asset) {
            bridgeAddress = bridges[i].address
            break
          }
        }
        if (!bridgeAddress) {
          throw Error(
            `No relay bridge found for asset ${asset} on network ${net.name}`
          )
        }
      }

      const bridge = await rawEthers.getContractAt('RelayBridge', bridgeAddress)
      const assetAddress = await bridge.ASSET()
      const l2BridgeProxy = await bridge.BRIDGE_PROXY()
      const bridgeProxyContract = await rawEthers.getContractAt(
        'BridgeProxy',
        l2BridgeProxy
      )
      const poolChainId = await bridgeProxyContract.RELAY_POOL_CHAIN_ID()
      const poolAddress = await bridgeProxyContract.RELAY_POOL()
      const l1BridgeProxyAddress = await bridgeProxyContract.L1_BRIDGE_PROXY()

      let decimals = 18n
      if (assetAddress !== rawEthers.ZeroAddress) {
        const asset = await rawEthers.getContractAt('MyToken', assetAddress)
        decimals = await asset.decimals()
      }

      if (!amount) {
        const fullBalance = await getBalance(
          userAddress,
          assetAddress,
          rawEthers.provider
        )

        const amountInDecimals = await new Input({
          default: '0.1',
          message: `How much do you want to bridge (full balance ${rawEthers.formatUnits(fullBalance, decimals)})?`,
          name: 'amount',
        }).run()
        amount = rawEthers.parseUnits(amountInDecimals, decimals)
      }

      // parse default values
      if (!recipient) recipient = userAddress

      const poolNetwork = networks[poolChainId]
      const provider = new rawEthers.JsonRpcProvider(poolNetwork.rpc[0])
      const pool = new rawEthers.Contract(
        poolAddress,
        (await ethers.getContractAt('RelayPool', ethers.ZeroAddress)).interface,
        provider
      )
      const origin = await pool.authorizedOrigins(chainId, bridgeAddress)
      const fractionalBpsDenominator = await pool.FRACTIONAL_BPS_DENOMINATOR()

      const totalAssets = await pool.totalAssets()
      const outstandingDebt = await pool.outstandingDebt()

      if (origin.outstandingDebt + amount > origin.maxDebt) {
        throw Error(
          `The amount you are trying to bridge (${amount}) exceeds the maximum debt (${origin.maxDebt}) from this origin (${origin})`
        )
      }

      if (outstandingDebt + amount > totalAssets) {
        throw Error(
          `The pool currently does not have enough assets (${totalAssets}) to cover the amount you are trying to bridge (${amount})`
        )
      }

      const l1BridgeProxy = await new rawEthers.Contract(
        l1BridgeProxyAddress,
        (
          await ethers.getContractAt('BridgeProxy', ethers.ZeroAddress)
        ).interface,
        provider
      )
      const l1BridgeProxyPool = await l1BridgeProxy.RELAY_POOL()
      const l1BridgeProxyChainId = await l1BridgeProxy.RELAY_POOL_CHAIN_ID()

      if (l1BridgeProxyAddress !== origin.proxyBridge) {
        throw Error(
          `The bridge proxy on the pool's chain (${l1BridgeProxyAddress}) does not match the origin (${origin.proxyBridge})`
        )
      }

      if (
        !(
          l1BridgeProxyPool === poolAddress &&
          Number(l1BridgeProxyChainId) === Number(poolChainId)
        )
      ) {
        throw Error(
          `The bridge proxy on the pool's chain (${l1BridgeProxyPool} - ${l1BridgeProxyChainId}) does not match the pool (${poolAddress} - ${poolChainId})`
        )
      }

      const confirm = await new Confirm({
        message: `Are you sure you want to bridge ${rawEthers.formatUnits(amount, decimals)} of ${asset === rawEthers.ZeroAddress ? 'native asset' : asset} to the pool ${poolAddress} on ${poolChainId}? There is a ${Number(origin.bridgeFee / fractionalBpsDenominator)}% fee and you will get it in at least ${origin.coolDown} seconds.`,
        name: 'confirm',
      }).run()

      if (!confirm) {
        process.exit()
      }

      // check balance of asset to transfer
      const balance = await getBalance(
        userAddress,
        assetAddress,
        ethers.provider
      )

      if (balance < amount) {
        throw Error(
          `Insufficient balance (actual: ${balance}, expected: ${amount})`
        )
      }

      // check allowance
      if (assetAddress != rawEthers.ZeroAddress) {
        const asset = await ethers.getContractAt('MyToken', assetAddress)
        await checkAllowance(asset, bridgeAddress, amount, userAddress)
      }

      const nonce = await bridge.transferNonce()
      const abiCoder = new AbiCoder()
      const types = ['uint256', 'address', 'uint256', 'uint256']
      const bridgeData = abiCoder.encode(types, [
        nonce,
        recipient,
        amount,
        Math.floor(new Date().getTime() / 1000) - Number(origin.coolDown) - 60, // 1 minute before
      ])

      const handleTx = await pool.handle.populateTransaction(
        chainId,
        rawEthers.zeroPadValue(bridgeAddress, 32),
        bridgeData
      )
      const l1Gas = await provider.estimateGas({
        ...handleTx,
        from: poolNetwork.hyperlaneMailbox,
      })

      const hyperlaneFee = await bridge.getFee(
        amount,
        recipient,
        (l1Gas * 11n) / 10n // add 10%
      )

      const value =
        assetAddress === rawEthers.ZeroAddress
          ? BigInt(amount) + hyperlaneFee
          : hyperlaneFee

      // check the balance of native to pay for value + hyperlaneFee
      const balanceNative = await getBalance(
        userAddress,
        rawEthers.ZeroAddress,
        ethers.provider
      )

      if (balanceNative < value) {
        throw Error(
          `Insufficient balance to cover for Hyperlane fee (actual: ${balanceNative}, expected: ${value})`
        )
      }

      const l1Asset = ethers.ZeroAddress
      if (assetAddress !== ethers.ZeroAddress) {
        throw Error('Not implemented yet')
      }

      // if we are doing a deposit to Arbitrum, pass gas params
      // using the extraData field
      let data = '0x'
      if (chainId === 1n && poolNetwork.stack === 'arbitrum') {
        const gasEstimate = await estimateNativeBridgeTicketCost({
          amount,
          bridgeAddress,
          destProxyBridgeAddress: l1BridgeProxyAddress,
          destinationChainId: poolChainId,
          from: userAddress,
          originChainId: chainId,
        })
        const abiCoder = new AbiCoder()
        const encodedGasEstimate = abiCoder.encode(
          ['tuple(uint,uint,uint,uint)', 'bytes'],
          [
            [
              gasEstimate.maxFeePerGas,
              gasEstimate.gasLimit,
              gasEstimate.maxSubmissionCost,
              gasEstimate.deposit,
            ],
            '0x',
          ]
        )
        data = encodedGasEstimate
        console.log({ amount, gasEstimate, value })
      }

      const tx = await bridge.bridge.populateTransaction(
        amount,
        recipient,
        l1Asset,
        l1Gas,
        data,
        {
          value,
        }
      )

      console.log(tx)
      const sentTx = await user.sendTransaction(tx)

      // TODO: parse tx results
      const receipt = await sentTx.wait()

      const event = await getEvent(
        receipt!,
        'DispatchId',
        new ethers.Interface(ABIs.Mailbox)
      )
      const dispatchId = event.args[0].substring(2)

      console.log(
        `Tx. ${tx.hash}. \nHyperlane message: https://explorer.hyperlane.xyz/message/${dispatchId} `
      )
    }
  )

task('bridge:pay-gas', 'Pay extra gas when a message is stuck')
  .addParam('messageId', 'The Hyperlane message id')
  .addParam('destChain', 'the chain destination of the pool')
  .addParam('gasAmount', 'the amount of tokens to send')
  .setAction(async ({ messageId, destChain, gasAmount }, { ethers }) => {
    const [user] = await ethers.getSigners()
    const { chainId } = await ethers.provider.getNetwork()
    const networkConfig = networks[chainId.toString()]
    const { hyperlaneHook } = networkConfig
    if (!hyperlaneHook) {
      throw Error('Hyperlane hook not found')
    }
    const paymaster = await new ethers.Contract(
      hyperlaneHook,
      ABIs.InterchainGasPaymaster,
      user
    )
    const userAddress = await user.getAddress()
    const value = await paymaster.quoteGasPayment(destChain, gasAmount)
    const tx = await paymaster.payForGas(
      messageId,
      destChain,
      gasAmount,
      userAddress,
      {
        value,
      }
    )

    console.log(tx)

    // const receipt = await tx.wait()
    // console.log(receipt)
    // const ethers = isZksync ? zksyncEthers : rawEthers
    // const bridge = await ethers.getContractAt('BridgeProxy', bridgeAddress)
    // const [user] = await ethers.getSigners()
    // const userAddress = await user.getAddress()

    // // parse default values
    // if (!assetAddress) assetAddress = ethers.ZeroAddress
    // if (!recipient) recipient = userAddress
    // if (!destChain) destChain = 1

    // // check balance
    // const balance = await getBalance(
    //   userAddress,
    //   assetAddress,
    //   ethers.provider
    // )
    // if (balance < amount) {
    //   throw Error(
    //     `Insufficient balance (actual: ${balance}, expected: ${amount})`
    //   )
    // }

    // // check allowance
    // if (assetAddress != ethers.ZeroAddress) {
    //   const asset = await ethers.getContractAt('MyToken', assetAddress)
    //   await checkAllowance(asset, bridgeAddress, amount, userAddress)
    // }

    // // send tx
    // const tx = await bridge.bridge(
    //   userAddress, // sender
    //   destChain, // destinationChainId,
    //   recipient, // recipient
    //   assetAddress, // asset
    //   amount, // amount
    //   '0x', // data
    //   {
    //     value: assetAddress === ethers.ZeroAddress ? amount : 0,
    //   }
    // )

    // // parse tx results
    // const receipt = await tx.wait()
    // console.log(receipt?.logs)
    // // TODO: check for AssetsDepositedIntoYieldPool or similar
    // // const event = await getEvent(receipt, 'MessagePassed')
  })
