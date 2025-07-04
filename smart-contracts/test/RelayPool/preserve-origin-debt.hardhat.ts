import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import networks from '@relay-vaults/networks'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyToken, MyYieldPool, RelayPool } from '../../typechain-types'
import { getEvent } from '@relay-vaults/helpers'
import { encodeData } from './hyperlane.hardhat'
import { getAddress, Signer } from 'ethers'

describe('RelayPool: curator', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let yieldPool: MyYieldPool
  let userAddress: string

  before(async () => {
    const [user] = await ethers.getSigners()
    userAddress = await user.getAddress()
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
        hyperlaneMailbox: userAddress,
        name: `${await myToken.name()} Relay Pool`,
        symbol: `${await myToken.symbol()}-REL`,
        thirdPartyPool: await yieldPool.getAddress(),
        weth: ethers.ZeroAddress,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))

    const liquidity = ethers.parseUnits('100', 18)
    await myToken.connect(user).mint(liquidity)
    await myToken.connect(user).approve(await relayPool.getAddress(), liquidity)
    await relayPool.connect(user).deposit(liquidity, await user.getAddress())
  })

  describe('addOrigin', async () => {
    it('should preserve the existing debt when adding back an origin', async () => {
      const newOrigin = {
        bridge: ethers.Wallet.createRandom().address,
        bridgeFee: 5,
        chainId: 10,
        coolDown: 0,
        curator: userAddress,
        maxDebt: ethers.parseEther('10'),
        proxyBridge: ethers.Wallet.createRandom().address,
      }
      await relayPool.addOrigin(newOrigin)
      expect(await relayPool.outstandingDebt()).to.be.equal(0)

      // Borrow from the pool so we can claim later
      const bridgedAmount = ethers.parseEther('0.2')

      await relayPool.handle(
        newOrigin.chainId,
        ethers.zeroPadValue(newOrigin.bridge, 32),
        encodeData(6n, userAddress, bridgedAmount)
      )
      expect(await relayPool.outstandingDebt()).to.be.equal(bridgedAmount)

      // disable an origin (debt unchanged)
      await relayPool.disableOrigin(newOrigin.chainId, newOrigin.bridge)
      expect(await relayPool.outstandingDebt()).to.be.equal(bridgedAmount)
      expect(
        (
          await relayPool.authorizedOrigins(
            newOrigin.chainId,
            newOrigin.proxyBridge
          )
        ).maxDebt
      ).to.be.equal(0)

      // adg same origin again (debt still unchanged)
      await relayPool.addOrigin(newOrigin)
      expect(await relayPool.outstandingDebt()).to.be.equal(bridgedAmount)
      expect(
        (await relayPool.authorizedOrigins(newOrigin.chainId, newOrigin.bridge))
          .maxDebt
      ).to.be.equal(newOrigin.maxDebt)
    })
  })
})
