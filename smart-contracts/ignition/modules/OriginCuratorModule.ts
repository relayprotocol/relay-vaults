import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('OriginCurator', (m) => {
  const multisig = m.getParameter('multisig')

  const originCurator = m.contract('OriginCurator', [multisig])
  return { originCurator }
})
