import { Signer } from 'ethers'
import { MyWeth, MyYieldPool, RelayPool } from '../../typechain-types'
import { ignition } from 'hardhat'
import RelayPoolModule from '../../ignition/modules/RelayPoolModule'
import { encodeData } from './hyperlane.hardhat'

const { expect } = require('chai')
const { ethers } = require('hardhat')

const encodedMessage = (recipient: string, amount: bigint) =>
  ethers.defaultAbiCoder.encode(
    [
      'tuple(uint256 nonce, address recipient, uint256 amount, uint256 timestamp)',
    ],
    [[1, recipient, amount, 0]]
  )

describe('RelayPool Debt Inconsistency', function () {
  let relayPool: RelayPool
  let thirdPartyPool: MyYieldPool
  let asset: MyWeth
  let assetAddress: string
  let owner: Signer
  let ownerAddress: string
  let proxyBridgeAddresses: string[]
  let bridgeSigners: Signer[]
  let bridges: string[]

  const chainIds = [1234, 5678, 9012] // Multiple chain IDs
  const chainNames = ['Chain A', 'Chain B', 'Chain C']

  beforeEach(async () => {
    const signers = await ethers.getSigners()
    owner = signers[0]
    bridgeSigners = [signers[1], signers[2], signers[3]] // Multiple bridge signers
    ownerAddress = await owner.getAddress()

    // Deploy mocks ERC20 asset
    asset = await ethers.deployContract('MyWeth')
    assetAddress = await asset.getAddress()

    // Fund bridges with WETH
    bridges = await Promise.all(
      bridgeSigners.map((signer) => signer.getAddress())
    )
    for (const bridgeSigner of bridgeSigners) {
      await asset
        .connect(bridgeSigner)
        .deposit({ value: ethers.parseEther('200') })
    }

    // deploy 3rd party pool
    thirdPartyPool = await ethers.deployContract('MyYieldPool', [
      await asset.getAddress(),
      'My Yield Pool',
      'YIELD',
    ])

    // Deploy multiple mock bridge proxies
    proxyBridgeAddresses = []
    for (let i = 0; i < chainIds.length; i++) {
      const BridgeMock = await ethers.getContractFactory('MockBridgeProxy')
      const mockBridgeProxy = await BridgeMock.deploy(assetAddress)
      proxyBridgeAddresses.push(await mockBridgeProxy.getAddress())
    }

    // Deploy the pool
    const deployment = await ignition.deploy(RelayPoolModule, {
      deploymentId: 'RelayPoolFactory',
      parameters: {
        RelayPool: {
          asset: await asset.getAddress(),
          curator: ownerAddress,
          // using the owner address as the mailbox to send tx
          hyperlaneMailbox: ownerAddress,
          name: 'ERC20 RELAY POOL',
          symbol: 'ERC20-REL',
          thirdPartyPool: await thirdPartyPool.getAddress(),
          weth: await asset.getAddress(),
        },
      },
    })
    relayPool = deployment.relayPool as unknown as RelayPool

    // add liquidity
    const liquidity = ethers.parseEther('100')
    await asset.connect(owner).deposit({ value: liquidity })
    await asset.connect(owner).approve(await relayPool.getAddress(), liquidity)
    await relayPool.connect(owner).deposit(liquidity, await owner.getAddress())

    // Setup multiple origins with different chains
    for (let i = 0; i < chainIds.length; i++) {
      await relayPool.addOrigin({
        bridge: bridges[i],
        bridgeFee: 0,
        chainId: chainIds[i],
        coolDown: 0,
        curator: await owner.getAddress(),
        maxDebt: ethers.parseEther('1000'),
        proxyBridge: proxyBridgeAddresses[i],
      })

      // Simulate `handle()` call with a message to increase outstanding debt for each origin
      const debtAmount = ethers.parseEther('10')
      await relayPool.handle(
        chainIds[i],
        ethers.zeroPadValue(bridges[i], 32),
        encodeData(12345n + BigInt(i), ownerAddress, debtAmount)
      )

      // Set up bridge to return only 6 ETH instead of 10 for each origin
      const underpaidAmount = ethers.parseEther('6')
      await asset
        .connect(bridgeSigners[i])
        .transfer(proxyBridgeAddresses[i], underpaidAmount)
    }
  })

  it('should cause outstandingDebt desync if claim() receives less than expected for multiple origins', async () => {
    const totalDebtBefore = await relayPool.outstandingDebt()
    console.log('Total Debt Before:', ethers.formatEther(totalDebtBefore))

    // Check each origin's debt before claiming
    const originsBefore = []
    for (let i = 0; i < chainIds.length; i++) {
      const origin = await relayPool.authorizedOrigins(chainIds[i], bridges[i])
      originsBefore.push(origin)
      console.log(
        `${chainNames[i]} Origin Debt Before:`,
        ethers.formatEther(origin.outstandingDebt)
      )
    }

    // Call claim for each origin (bridges will return only 6 instead of 10)
    for (let i = 0; i < chainIds.length; i++) {
      console.log(`\nClaiming for ${chainNames[i]}...`)
      await relayPool.claim(chainIds[i], bridges[i])
    }

    const totalDebtAfter = await relayPool.outstandingDebt()
    console.log('\nTotal Debt After:', ethers.formatEther(totalDebtAfter))

    // Check each origin's debt after claiming
    const originsAfter = []
    for (let i = 0; i < chainIds.length; i++) {
      const origin = await relayPool.authorizedOrigins(chainIds[i], bridges[i])
      originsAfter.push(origin)
      console.log(
        `${chainNames[i]} Origin Debt After:`,
        ethers.formatEther(origin.outstandingDebt)
      )
    }

    // Verify that total debt and individual origin debts are out of sync
    let totalOriginDebtAfter = 0n
    for (const origin of originsAfter) {
      totalOriginDebtAfter += origin.outstandingDebt
    }

    console.log(
      '\nTotal Origin Debts Sum:',
      ethers.formatEther(totalOriginDebtAfter)
    )
    console.log('Total Pool Debt:', ethers.formatEther(totalDebtAfter))

    // This will now fail because they are out of sync
    expect(totalDebtAfter).to.not.equal(totalOriginDebtAfter)
  })

  it('should handle debt inconsistency for individual origins', async () => {
    // Test individual origin debt inconsistency
    for (let i = 0; i < chainIds.length; i++) {
      const originBefore = await relayPool.authorizedOrigins(
        chainIds[i],
        bridges[i]
      )
      const expectedDebt = ethers.parseEther('10') // Original debt amount

      console.log(
        `${chainNames[i]} Expected Debt:`,
        ethers.formatEther(expectedDebt)
      )
      console.log(
        `${chainNames[i]} Actual Debt:`,
        ethers.formatEther(originBefore.outstandingDebt)
      )

      // The origin debt should still be 10 ETH even though bridge only returned 6 ETH
      expect(originBefore.outstandingDebt).to.equal(expectedDebt)
    }
  })
})
