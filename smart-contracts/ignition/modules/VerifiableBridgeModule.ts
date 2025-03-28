import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { ethers } from 'ethers'

export default buildModule('VerifiableBridgeModule', (m) => {
  const hyperlaneMailbox = ethers.ZeroAddress
  const asset = ethers.ZeroAddress
  const bridgeProxy = ethers.ZeroAddress

  const relayBridge = m.contract('RelayBridge', [
    asset,
    bridgeProxy,
    hyperlaneMailbox,
  ])
  return { relayBridge }
})
