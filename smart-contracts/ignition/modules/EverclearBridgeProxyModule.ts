import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('EverclearBridgeProxy', (m) => {
  // unpack args
  const relayPoolChainId = m.getParameter('relayPoolChainId')
  const relayPool = m.getParameter('relayPool')
  const l1BridgeProxy = m.getParameter('l1BridgeProxy')
  const feeAdapter = m.getParameter('feeAdapter')
  const destinationDomainId = m.getParameter('destinationDomainId')

  const bridge = m.contract('EverclearBridgeProxy', [
    relayPoolChainId,
    relayPool,
    l1BridgeProxy,
    feeAdapter,
    destinationDomainId,
  ])

  return { bridge }
})
