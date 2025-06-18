import { expect } from 'chai'
import { ethers, ignition } from 'hardhat'
import networks from '@relay-vaults/networks'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyToken, MyYieldPool, RelayPool } from '../../typechain-types'

describe('RelayPool: initialization of ERC20 pool', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let thirdPartyPool: MyYieldPool

  before(async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    myToken = await ethers.deployContract('MyToken', ['My Token', 'TOKEN'])
    expect(await myToken.totalSupply()).to.equal(1000000000000000000000000000n)
    // deploy 3rd party pool
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
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
        thirdPartyPool: await thirdPartyPool.getAddress(),
        weth: ethers.ZeroAddress,
      },
    }

    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))
  })

  it('should let user initiate the pool by using the ERC20', async () => {
    expect(await relayPool.decimals()).to.equal(18)
    expect(await relayPool.name()).to.equal('My Token Relay Pool')
    expect(await relayPool.symbol()).to.equal('TOKEN-REL')
    expect(await relayPool.asset()).to.equal(await myToken.getAddress())
    expect(await relayPool.totalAssets()).to.equal(0)
    expect(await relayPool.totalSupply()).to.equal(0)
    expect(await relayPool.HYPERLANE_MAILBOX()).to.equal(
      networks[1].hyperlaneMailbox
    )
    expect(await relayPool.outstandingDebt()).to.equal(0)
  })
})
