import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('OPStackNativeWithdrawBridgeProxy', (m) => {
  const relayPoolChainId = m.getParameter('relayPoolChainId')
  const relayPool = m.getParameter('relayPool')
  const l1BridgeProxy = m.getParameter('l1BridgeProxy')

  const bridge = m.contract('OPStackNativeWithdrawBridgeProxy', [
    relayPoolChainId,
    relayPool,
    l1BridgeProxy,
  ])
  return { bridge }
})
