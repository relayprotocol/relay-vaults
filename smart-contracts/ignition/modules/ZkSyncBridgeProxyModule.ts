import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('ZkSyncBridgeProxy', (m) => {
  // unpack args
  const l2SharedDefaultBridge = m.getParameter('l2SharedDefaultBridge')
  const relayPoolChainId = m.getParameter('relayPoolChainId')
  const relayPool = m.getParameter('relayPool')
  const l1BridgeProxy = m.getParameter('l1BridgeProxy')

  const bridge = m.contract('ZkSyncBridgeProxy', [
    l2SharedDefaultBridge,
    relayPoolChainId,
    relayPool,
    l1BridgeProxy,
  ])
  return { bridge }
})
