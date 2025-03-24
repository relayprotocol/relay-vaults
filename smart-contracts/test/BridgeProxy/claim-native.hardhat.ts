import { ethers, ignition } from 'hardhat'
import { expect } from 'chai'
import { networks } from '@relay-protocol/networks'
import CCTPBridgeProxyModule from '../../ignition/modules/CCTPBridgeProxyModule'
import OPStackNativeBridgeProxyModule from '../../ignition/modules/OPStackNativeBridgeProxyModule'
import ArbitrumOrbitNativeBridgeProxyModule from '../../ignition/modules/ArbitrumOrbitNativeBridgeProxyModule'
import ZkSyncBridgeProxyModule from '../../ignition/modules/ZkSyncBridgeProxyModule'
import { reverts } from '../utils/errors'
import { impersonate } from '../utils/hardhat'
import { ZeroAddress } from 'ethers'

const relayPool = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const l1BridgeProxy = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'

describe('BridgeProxies accept native token', function () {
  const amount = ethers.parseEther('1')

  describe('CCTP Bridge Proxy', () => {
    it('should reject native tokens', async () => {
      const [user] = await ethers.getSigners()
      const chainId = 10 // Optimism
      const {
        bridges: { cctp },
        assets,
      } = networks[chainId]

      if (!cctp) {
        throw new Error('CCTP bridge configuration not found')
      }

      const parameters = {
        CCTPBridgeProxy: {
          messenger: cctp.messenger,
          usdc: assets.usdc,
          relayPoolChainId: 1,
          relayPool,
          l1BridgeProxy,
        },
      }
      const { bridge } = await ignition.deploy(CCTPBridgeProxyModule, {
        parameters,
      })

      const initialBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )

      // Send the funds to the bridgeProxy (simulate successful bridging)
      await reverts(
        user.sendTransaction({
          to: bridge.getAddress(),
          value: amount,
        }),
        "function selector was not recognized and there's no fallback nor receive function"
      )

      const finalBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )
      expect(initialBalance).to.equal(finalBalance)
    })
  })

  describe('OPStack Native Bridge Proxy', () => {
    it('should handle native token', async () => {
      const [user] = await ethers.getSigners()
      const {
        bridges: { op },
      } = networks[1] // Ethereum mainnet

      if (!op?.portalProxy) {
        throw new Error('OPStack bridge configuration not found')
      }

      const parameters = {
        OPStackNativeBridgeProxy: {
          portalProxy: op.portalProxy,
          relayPoolChainId: 31337,
          relayPool,
          l1BridgeProxy,
        },
      } as const // Use const assertion to fix type error

      const { bridge } = await ignition.deploy(OPStackNativeBridgeProxyModule, {
        parameters,
      })

      const initialBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )

      // Send the funds to the bridgeProxy (simulate successful bridging)
      await user.sendTransaction({
        to: bridge.getAddress(),
        value: amount,
      })

      const finalBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )
      expect(finalBalance - initialBalance).to.equal(amount)

      // tokens can be claimed
      const poolSigner = await impersonate(relayPool)
      const balanceBeforeClaim = await ethers.provider.getBalance(relayPool)
      const tx = await bridge.connect(poolSigner).claim(ZeroAddress, amount)
      const receipt = await tx.wait()
      const gas = receipt!.gasUsed * receipt!.gasPrice
      const balanceAfterClaim = await ethers.provider.getBalance(relayPool)
      expect(balanceAfterClaim).to.equal(
        balanceBeforeClaim - BigInt(gas) + amount
      )
    })
  })

  describe('Arbitrum Orbit Native Bridge Proxy', () => {
    it('should handle native token', async () => {
      const [user] = await ethers.getSigners()
      const chainId = 42161 // Arbitrum One
      const {
        bridges: { arb },
      } = networks[chainId]

      if (!arb?.routerGateway) {
        throw new Error('Arbitrum bridge configuration not found')
      }

      const parameters = {
        ArbitrumOrbitNativeBridgeProxy: {
          routerGateway: arb.routerGateway,
          outbox: arb.outbox || ethers.ZeroAddress,
          relayPoolChainId: 31337,
          relayPool,
          l1BridgeProxy,
        },
      } as const // Use const assertion to fix type error

      const { bridge } = await ignition.deploy(
        ArbitrumOrbitNativeBridgeProxyModule,
        { parameters }
      )

      const initialBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )

      // Send the funds to the bridgeProxy (simulate successful bridging)
      await user.sendTransaction({
        to: bridge.getAddress(),
        value: amount,
      })

      const finalBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )
      expect(finalBalance - initialBalance).to.equal(amount)

      // tokens can be claimed
      const poolSigner = await impersonate(relayPool)
      const balanceBeforeClaim = await ethers.provider.getBalance(relayPool)
      const tx = await bridge.connect(poolSigner).claim(ZeroAddress, amount)
      const receipt = await tx.wait()
      const gas = receipt!.gasUsed * receipt!.gasPrice
      const balanceAfterClaim = await ethers.provider.getBalance(relayPool)
      expect(balanceAfterClaim).to.equal(
        balanceBeforeClaim - BigInt(gas) + amount
      )
    })
  })

  describe('ZkSync Bridge Proxy', () => {
    it('should handle native token', async () => {
      const [user] = await ethers.getSigners()
      const chainId = 324 // zkSync Era mainnet
      const {
        bridges: { zksync },
      } = networks[chainId]

      if (!zksync?.l2SharedDefaultBridge) {
        throw new Error('ZkSync bridge configuration not found')
      }

      const parameters = {
        ZkSyncBridgeProxy: {
          l2SharedDefaultBridge: zksync.l2SharedDefaultBridge,
          relayPoolChainId: 31337,
          relayPool,
          l1BridgeProxy,
        },
      } as const // Use const assertion to fix type error

      const { bridge } = await ignition.deploy(ZkSyncBridgeProxyModule, {
        parameters,
      })

      const initialBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )

      // Send the funds to the bridgeProxy (simulate successful bridging)
      await user.sendTransaction({
        to: bridge.getAddress(),
        value: amount,
      })

      const finalBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )
      expect(finalBalance - initialBalance).to.equal(amount)

      // tokens can be claimed
      const poolSigner = await impersonate(relayPool)
      const balanceBeforeClaim = await ethers.provider.getBalance(relayPool)
      const tx = await bridge.connect(poolSigner).claim(ZeroAddress, amount)
      const receipt = await tx.wait()
      const gas = receipt!.gasUsed * receipt!.gasPrice
      const balanceAfterClaim = await ethers.provider.getBalance(relayPool)
      expect(balanceAfterClaim).to.equal(
        balanceBeforeClaim - BigInt(gas) + amount
      )
    })
  })
})
