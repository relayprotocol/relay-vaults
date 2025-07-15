import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('ArbitrumOrbitNativeBridgeProxy', (m) => {
  const routerGateway = m.getParameter('routerGateway') // l1GatewayRouter
  const relayPoolChainId = m.getParameter('relayPoolChainId')
  const relayPool = m.getParameter('relayPool')
  const l1BridgeProxy = m.getParameter('l1BridgeProxy')

  const bridge = m.contract('ArbitrumOrbitNativeBridgeProxy', [
    routerGateway,
    relayPoolChainId,
    relayPool,
    l1BridgeProxy,
  ])
  return { bridge }
})
