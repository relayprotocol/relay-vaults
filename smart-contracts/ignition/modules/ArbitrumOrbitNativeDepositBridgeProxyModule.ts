import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('ArbitrumOrbitNativeDepositBridgeProxy', (m) => {
  // l1GatewayRouter / parent.routerGateway
  const routerGateway = m.getParameter('routerGateway')
  const inbox = m.getParameter('inbox')
  const relayPoolChainId = m.getParameter('relayPoolChainId')
  const relayPool = m.getParameter('relayPool')
  const l1BridgeProxy = m.getParameter('l1BridgeProxy')
  const bridge = m.contract('ArbitrumOrbitNativeDepositBridgeProxy', [
    routerGateway,
    inbox,
    relayPoolChainId,
    relayPool,
    l1BridgeProxy,
  ])
  return { bridge }
})
