import { expect } from 'chai'
import { AbiCoder, Signer } from 'ethers'
import { ethers } from 'hardhat'
import { networks } from '@relay-vaults/networks'
import { IWETH, RelayPool } from '../../typechain-types'
import { getEvents } from '@relay-vaults/helpers'
import { impersonate } from '../utils/hardhat'

// ZORA
const ZORA_CHAIN_ID = 7777777
const ZORA_AMOUNT = 100000000000000n // 0.0001 ETH
const ZORA_BRIDGE = '0x1Ed47efb9252E6FE586C8bda9af7bc67e97D4f2D'

// Lisk
const LISK_CHAIN_ID = 1135
const LISK_BRIDGE = '0x9551c38fA964cd0c9f753AA6FbC9f6383DB1B718'
const LISK_AMOUNT = 15000000000000000n // 0.015 ETH

// Existing RelayPool address
const RELAY_POOL_ADDRESS = '0x57B68c4EA221ee8Da6eb14ebdfcCEE5177567771'

const now = () => Math.floor(new Date().getTime() / 1000)

export const encodeData = (
  nonce: bigint,
  recipient: string,
  amount: bigint,
  timestamp?: number
) => {
  const abiCoder = new AbiCoder()
  const types = ['uint256', 'address', 'uint256', 'uint256']
  return abiCoder.encode(types, [nonce, recipient, amount, timestamp || now()])
}

describe.only('RelayPool: processFailedHandler debt correction for WETH pool', () => {
  let pool: RelayPool
  let weth: IWETH
  let userAddress: string
  let curatorAddress: string
  let signer: Signer
  let originLisk: any
  let originZora: any

  before(async () => {
    const [user, curator] = await ethers.getSigners()
    userAddress = await user.getAddress()
    curatorAddress = await curator.getAddress()

    // Get the existing RelayPool contract
    pool = await ethers.getContractAt('RelayPool', RELAY_POOL_ADDRESS)

    // Get WETH contract
    weth = await ethers.getContractAt('IWETH', await pool.asset())

    originLisk = await pool.authorizedOrigins(LISK_CHAIN_ID, LISK_BRIDGE)
    console.log('lisk', originLisk)

    originZora = await pool.authorizedOrigins(ZORA_CHAIN_ID, ZORA_BRIDGE)
    console.log('zora', originZora)

    // impersonate timelock
    const timelockAddress = await pool.owner()
    signer = await impersonate(timelockAddress)
    pool = pool.connect(signer)
  })

  it('should correct outstanding debt offset for Zora using processFailedHandler', async () => {
    const [user] = await ethers.getSigners()
    const nonce = BigInt(now())

    // Get initial outstanding debt
    const originZora = await pool.authorizedOrigins(ZORA_CHAIN_ID, ZORA_BRIDGE)
    const initialDebt = originZora.outstandingDebt

    // fund the bridge proxy
    await user.sendTransaction({
      to: originZora.proxyBridge,
      value: ZORA_AMOUNT * 2n,
    })

    // encode data for the failed message
    const encodedData = encodeData(nonce, await pool.getAddress(), ZORA_AMOUNT)
    console.log({ ZORA_BRIDGE, ZORA_CHAIN_ID, encodedData })

    // process
    await pool.processFailedHandler(ZORA_CHAIN_ID, ZORA_BRIDGE, encodedData)

    // outstanding debt has been decreased correctly
    const updatedOriginZora = await pool.authorizedOrigins(
      ZORA_CHAIN_ID,
      ZORA_BRIDGE
    )

    expect(updatedOriginZora.outstandingDebt).to.equal(
      initialDebt - ZORA_AMOUNT
    )

    // Check that the user received the funds
    // const userBalance = await weth.balanceOf(userAddress)
    // expect(userBalance).to.be.greaterThan(0)
  })
})
