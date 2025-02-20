import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('OPStackNativeBridgeProxy', (m) => {
  const portalProxy = m.getParameter('portalProxy')
  const relayPoolChainId = m.getParameter('relayPoolChainId')
  const relayPool = m.getParameter('relayPool')
  const l1BridgeProxy = m.getParameter('l1BridgeProxy')

  const bridge = m.contract('OPStackNativeBridgeProxy', [
    portalProxy,
    relayPoolChainId,
    relayPool,
    l1BridgeProxy,
  ])
  return { bridge }
})
