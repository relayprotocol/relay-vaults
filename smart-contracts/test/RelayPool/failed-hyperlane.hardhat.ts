import { expect } from 'chai'
import { AbiCoder } from 'ethers'
import { ethers, ignition } from 'hardhat'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { MyToken, MyWeth, MyYieldPool, RelayPool } from '../../typechain-types'

const relayBridgeOptimism = '0x0000000000000000000000000000000000000010'
const oPStackNativeBridgeProxy = '0x0000000000000000000000000000000000000010'
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

describe('ERC20 RelayBridge: when a message was never received from Hyperlane', () => {
  let relayPool: RelayPool
  let myToken: MyToken
  let thirdPartyPool: MyYieldPool
  let myWeth: MyWeth

  before(async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    myToken = await ethers.deployContract('MyToken', ['My Token', 'TOKEN'])
    expect(await myToken.totalSupply()).to.equal(1000000000000000000000000000n)

    myWeth = await ethers.deployContract('MyWeth')

    // deploy 3rd party pool
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await myToken.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])
    // deploy the pool using ignition
    const parameters = {
      RelayPool: {
        hyperlaneMailbox: userAddress, // using the user address as the mailbox so we can send transactions!
        asset: await myToken.getAddress(),
        name: 'ERC20 RELAY POOL',
        symbol: 'ERC20-REL',

        thirdPartyPool: await thirdPartyPool.getAddress(),
        weth: await myWeth.getAddress(),
        curator: userAddress,
      },
    }
    ;({ relayPool } = await ignition.deploy(RelayPoolModule, {
      parameters,
    }))

    await relayPool.addOrigin({
      chainId: 10,
      bridge: relayBridgeOptimism,
      maxDebt: ethers.parseEther('10'),
      proxyBridge: oPStackNativeBridgeProxy,
      bridgeFee: 0,
      curator: userAddress,
      coolDown: 10, // 10 seconds!
    })

    const liquidity = ethers.parseUnits('100', 18)
    await myToken.connect(user).mint(liquidity)
    await myToken.connect(user).approve(await relayPool.getAddress(), liquidity)
    await relayPool.connect(user).deposit(liquidity, await user.getAddress())
  })

  it('should ensure the handle function can only be called by the curator', async () => {
    const [, anotherUser] = await ethers.getSigners()
    const anotherUserAddress = await anotherUser.getAddress()
    await expect(
      relayPool
        .connect(anotherUser)
        .processFailedHandler(
          10,
          relayBridgeOptimism,
          encodeData(1n, anotherUserAddress, ethers.parseUnits('1'))
        )
    )
      .to.be.revertedWithCustomError(relayPool, 'OwnableUnauthorizedAccount')
      .withArgs(anotherUserAddress)
  })

  it('should refuse to handle messages that have already been handled', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()

    // should work!
    await relayPool.processFailedHandler(
      10,
      relayBridgeOptimism,
      encodeData(2n, userAddress, ethers.parseUnits('1'))
    )

    // should fail!
    await expect(
      relayPool.processFailedHandler(
        10,
        relayBridgeOptimism,
        encodeData(2n, userAddress, ethers.parseUnits('1'))
      )
    )
      .to.be.revertedWithCustomError(relayPool, 'MessageAlreadyProcessed')
      .withArgs(10, relayBridgeOptimism, 2n)
  })

  it('should refuse to handle messages that have already been handled regularly', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()

    const message = await encodeData(3n, userAddress, ethers.parseUnits('1'))

    // should work!
    await relayPool
      .connect(user)
      .handle(10, ethers.zeroPadValue(relayBridgeOptimism, 32), message)

    // should fail!
    await expect(
      relayPool.processFailedHandler(10, relayBridgeOptimism, message)
    )
      .to.be.revertedWithCustomError(relayPool, 'MessageAlreadyProcessed')
      .withArgs(10, relayBridgeOptimism, 3n)
  })

  it('should send funds to the recipient', async () => {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()

    const userBalanceBefore = await myToken.balanceOf(userAddress)
    // should work!
    await relayPool.processFailedHandler(
      10,
      relayBridgeOptimism,
      encodeData(4n, userAddress, ethers.parseUnits('1'))
    )
    const userBalanceAfter = await myToken.balanceOf(userAddress)
    expect(userBalanceAfter - userBalanceBefore).to.equal(
      ethers.parseUnits('1')
    )
  })
})
