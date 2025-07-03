import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import networks from '@relay-vaults/networks'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyToken, MyYieldPool, RelayPool } from '../../typechain-types'
import { getEvent } from '@relay-vaults/helpers'
import { encodeData } from './hyperlane.hardhat'
import { Signer } from 'ethers'

describe('RelayPool: curator', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let yieldPool: MyYieldPool
  let user: Signer

  before(async () => {
    ;[user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    myToken = await ethers.deployContract('MyToken', ['My Token', 'TOKEN'])
    expect(await myToken.totalSupply()).to.equal(1000000000000000000000000000n)
    // deploy 3rd party pool
    yieldPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])
    // deploy the pool using ignition
    const parameters = {
      RelayPool: {
        asset: await myToken.getAddress(),
        curator: userAddress,
        hyperlaneMailbox: networks[1].hyperlaneMailbox,
        name: `${await myToken.name()} Relay Pool`,
        symbol: `${await myToken.symbol()}-REL`,
        thirdPartyPool: await yieldPool.getAddress(),
        weth: ethers.ZeroAddress,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))
  })

  describe('addOrigin should preserve existing debt', async () => {
    it('should preserve the origin', async () => {
      const [user] = await ethers.getSigners()
      const newOrigin = {
        bridge: ethers.Wallet.createRandom().address,
        bridgeFee: 5,
        chainId: 10,
        coolDown: 0,
        curator: ethers.Wallet.createRandom().address,
        maxDebt: ethers.parseEther('10'),
        proxyBridge: ethers.Wallet.createRandom().address,
      }

      // Borrow from the pool so we can claim later
      const bridgedAmount = ethers.parseEther('0.2')
      await relayPool.handle(
        newOrigin.chainId,
        ethers.zeroPadValue(newOrigin.bridge, 32),
        encodeData(6n, await user.getAddress(), bridgedAmount)
      )
      expect(await relayPool.outstandingDebt()).to.be.equal(bridgedAmount)

      // adg same origin again
      await relayPool.addOrigin(newOrigin)
      expect(await relayPool.outstandingDebt()).to.be.equal(bridgedAmount)
    })
  })
})
