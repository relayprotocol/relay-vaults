import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import networks from '@relay-vaults/networks'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyWeth } from '../../typechain-types'

describe('RelayPool: receive', () => {
  let myWeth: MyWeth

  before(async () => {
    myWeth = await ethers.deployContract('MyWeth')
  })

  it('should handle receiving eth and wrap it instantly if the pool is configured with WETH', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()

    // deploy 3rd party pool
    const thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myWeth.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])
    const thirdPartyPoolAddress = await thirdPartyPool.getAddress()

    // deploy using ignition
    const parameters = {
      RelayPool: {
        asset: await myWeth.getAddress(),
        curator: userAddress,
        hyperlaneMailbox: networks[1].hyperlaneMailbox,
        name: `${await myWeth.name()} Relay Pool`,
        symbol: `${await myWeth.symbol()}-REL`,
        thirdPartyPool: thirdPartyPoolAddress,
        weth: await myWeth.getAddress(),
      },
    }
    const { relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    })

    await user.sendTransaction({
      to: relayPool,
      value: ethers.parseEther('1'), // 1 ether
    })
    expect(await ethers.provider.getBalance(relayPool)).to.equal(0)
    expect(await myWeth.balanceOf(relayPool)).to.equal(ethers.parseEther('1'))
  })

  it('should fail to receive ETH if the pool was not configured with WETH', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()

    const myToken = await ethers.deployContract('MyToken', [
      'My Token',
      'TOKEN',
    ])

    // deploy 3rd party pool
    const thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])

    const thirdPartyPoolAddress = await thirdPartyPool.getAddress()

    const parameters = {
      RelayPool: {
        asset: await myToken.getAddress(),
        curator: userAddress,
        hyperlaneMailbox: networks[1].hyperlaneMailbox,
        name: `${await myWeth.name()} Relay Pool`,
        symbol: `${await myWeth.symbol()}-REL`,
        thirdPartyPool: thirdPartyPoolAddress,
        weth: await myWeth.getAddress(),
      },
    }
    const { relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    })

    await expect(
      user.sendTransaction({
        to: relayPool,
        value: ethers.parseEther('1'), // 1 ether
      })
    ).to.be.revertedWithCustomError(relayPool, 'NotAWethPool')
    expect(await ethers.provider.getBalance(relayPool)).to.equal(0)
    expect(await myToken.balanceOf(relayPool)).to.equal(0)
  })
})
