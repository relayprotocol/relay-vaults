import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import TimelockTemplateModule from './TimelockTemplateModule'

export default buildModule('RelayPoolFactory', (m) => {
  const hyperlaneMailbox = m.getParameter('hyperlaneMailbox')
  const weth = m.getParameter('weth')

  // Deploy timelock template as part of the factory init
  const { timelockTemplate } = m.useModule(TimelockTemplateModule)

  const relayPoolFactory = m.contract('RelayPoolFactory', [
    hyperlaneMailbox,
    weth,
    timelockTemplate,
  ])
  return { relayPoolFactory, timelockTemplate }
})
