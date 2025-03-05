import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { ZeroAddress } from 'ethers'

export default buildModule('TimelockTemplateModule', (m) => {
  const timelockTemplate = m.contract('TimelockControllerUpgradeable')
  m.call(timelockTemplate, 'initialize', [
    0, // minDelay
    [], // proposers
    [], // executors
    ZeroAddress, // admin
  ])
  return { timelockTemplate }
})
