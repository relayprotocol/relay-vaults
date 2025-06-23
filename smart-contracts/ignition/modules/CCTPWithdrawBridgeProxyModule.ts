import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('CCTPWithdrawBridgeProxy', (m) => {
  // unpack args
  const USDC = m.getParameter('usdc')
  const messenger = m.getParameter('messenger')
  const relayPoolChainId = m.getParameter('relayPoolChainId')
  const relayPool = m.getParameter('relayPool')
  const l1BridgeProxy = m.getParameter('l1BridgeProxy')

  const bridge = m.contract('CCTPWithdrawBridgeProxy', [
    messenger,
    USDC,
    relayPoolChainId,
    relayPool,
    l1BridgeProxy,
  ])
  return { bridge }
})
