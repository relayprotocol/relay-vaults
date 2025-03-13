import { task } from 'hardhat/config'
import { getZkSyncBridgeContracts } from '../../lib/zksync'

task('zksync-contracts', 'Show addresses of Zksync bridge contracts')
  .addParam('chain', 'The id of a zksync chain')
  .setAction(async ({ chain }) => {
    console.log(await getZkSyncBridgeContracts(chain))
  })
