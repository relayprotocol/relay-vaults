import { ethers, zksyncEthers, ignition } from 'hardhat'
import { AbiCoder, Interface } from 'ethers'
import { expect } from 'chai'

import { ZkSyncBridgeProxy } from '../../typechain-types'
import { networks } from '@relay-protocol/networks'
import { getEvent, getBalance } from '@relay-protocol/helpers'
import { ERC20 as ERC20_ABI } from '@relay-protocol/helpers/abis'
import ZkSyncBridgeProxyModule from '../../ignition/modules/ZkSyncBridgeProxyModule'

const ETH_CHAIN_ID = 11155111n
const ZKSYNC_CHAIN_ID = 300n
const {
  bridges: {
    zksync: { l2SharedDefaultBridge, l1SharedDefaultBridge },
  },
  assets: { weth: USDC },
} = networks[ETH_CHAIN_ID.toString()]

// Native bridge tx on Zksync/ethereum
// https://era.zksync.network/tx/0x44ee1a78cded74543cae05e70dd936043bbae441ec2c7f968af4a6e888ccb07f

// TODO: USDC bridge tx on Mainnet
// https://sepolia-era.zksync.network/tx/0x94372eed4202154a87527eed4f24ec1cabd77630db7b7172ea82a52fe1608274
const recipientAddress = '0x246A13358Fb27523642D86367a51C2aEB137Ac6C'
const amount = 1000n

// construct the actual proof usinc cli
// ZK_SYNC=1 yarn hardhat claim:zksync --tx-hash 0x44ee1a78cded74543cae05e70dd936043bbae441ec2c7f968af4a6e888ccb07f --network zksync
// NB: to retrieve the actual proof, we use the `ethers-zksync` method `wallet.finalizeWithdrawalParams()`
// as demonstrated in `smart-contracts/tasks/claim/zksync.ts`
// https://sdk.zksync.io/js/ethers/api/v6/accounts/wallet#finalizewithdrawal
const returnedProof = {
  l1BatchNumber: 497156,
  l2MessageIndex: 1,
  l2TxNumberInBlock: 2167,
  message:
    '0x6c0960f9246a13358fb27523642d86367a51c2aeb137ac6c00000000000000000000000000000000000000000000000000005af3107a4000',
  sender: '0x000000000000000000000000000000000000800A',
  proof: [
    '0x2a2fc476929fb8931053b5fa78f90a04be9eedfb59414f3106577d467079f59b',
    '0x3652191e0bc321081da56af84ae0af0674501378707a1e794a37f5b4da459eb3',
    '0xe3697c7f33c31a9b0f0aeb8542287d0d21e8c4cf82163d0c44c7a98aa11aa111',
    '0x199cc5812543ddceeddd0fc82807646a4899444240db2c0d2f20c3cceb5f51fa',
    '0xe4733f281f18ba3ea8775dd62d2fcd84011c8c938f16ea5790fd29a03bf8db89',
    '0x1798a1fd9c8fbb818c98cff190daa7cc10b6e5ac9716b4a2649f7c2ebcef2272',
    '0x66d7c5983afe44cf15ea8cf565b34c6c31ff0cb4dd744524f7842b942d08770d',
    '0xb04e5ee349086985f74b73971ce9dfe76bbed95c84906c5dffd96504e1e5396c',
    '0xac506ecb5465659b3a927143f6d724f91d8d9c4bdb2463aee111d9aa869874db',
    '0x124b05ec272cecd7538fdafe53b6628d31188ffb6f345139aac3c3c1fd2e470f',
    '0xc3be9cbd19304d84cca3d045e06b8db3acd68c304fc9cd4cbffe6d18036cb13f',
    '0xfef7bd9f889811e59e4076a0174087135f080177302763019adaf531257e3a87',
    '0xa707d1c62d8be699d34cb74804fdd7b4c568b6c1a821066f126c680d4b83e00b',
    '0xf6e093070e0389d2e529d60fadb855fdded54976ec50ac709e3a36ceaa64c291',
  ],
}

// encode args to pass to pool
const args = [
  ZKSYNC_CHAIN_ID,
  returnedProof.l1BatchNumber,
  returnedProof.l2MessageIndex,
  returnedProof.l2TxNumberInBlock,
  returnedProof.message,
  returnedProof.proof,
]

// send claim to the pool
const abiCoder = new AbiCoder()
const bridgeParams = abiCoder.encode(
  ['uint256', 'uint256', 'uint256', 'uint16', 'bytes', 'bytes32[]'],
  args
)

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

describe('ZkSyncBridgeProxy', function () {
  let bridge: ZkSyncBridgeProxy

  before(async () => {
    // deploy using ignition
    const parameters = {
      ZkSyncBridgeProxy: {
        l2SharedDefaultBridge,
        relayPoolChainId: 1,
        relayPool,
        l1BridgeProxy,
      },
    }

    ;({ bridge } = await ignition.deploy(ZkSyncBridgeProxyModule, {
      parameters,
    }))
  })

  it('constructor values are correct', async () => {
    expect(await bridge.L2_SHARED_BRIDGE()).to.be.equal(l2SharedDefaultBridge)
  })

  describe('claim using BridgeProxy', () => {
    it('works with native tokens', async () => {
      const balanceBefore = await getBalance(
        recipientAddress,
        ethers.ZeroAddress,
        ethers.provider
      )
      const amount = ethers.parseEther('0.01')
      const tx = await bridge.claim(ethers.ZeroAddress, amount)
      const balanceAfter = await getBalance(
        recipientAddress,
        ethers.ZeroAddress,
        ethers.provider
      )

      const receipt = await tx.wait()

      // weth transfer happened
      const { event: erc20TransferEvent } = await getEvent(
        receipt!,
        'Transfer',
        new Interface(ERC20_ABI)
      )
      expect(erc20TransferEvent.args.to).to.equals(recipientAddress)
      expect(erc20TransferEvent.args.value).to.equals(amount.toString())
    })

    it.skip('works with ERC20 (USDC)', async () => {
      const balanceBefore = await getBalance(
        recipientAddress,
        USDC!,
        ethers.provider
      )
      const tx = await bridge.claim(ethers.ZeroAddress, bridgeParams)
      const balanceAfter = await getBalance(
        recipientAddress,
        USDC!,
        ethers.provider
      )

      const receipt = await tx.wait()

      // weth transfer happened
      const { event: erc20TransferEvent } = await getEvent(
        receipt!,
        'Transfer',
        new Interface(ERC20_ABI)
      )
      expect(erc20TransferEvent.args.to).to.equals(recipientAddress)
      expect(erc20TransferEvent.args.value).to.equals(amount.toString())
    })
  })
})
