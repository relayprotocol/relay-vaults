import { task } from 'hardhat/config'

import { networks } from '@relay-protocol/networks'
import { boolean } from 'hardhat/internal/core/params/argumentTypes'

BigInt.prototype.toJSON = function () {
  return this.toString()
}

task('networks:list', 'List all suported networks')
  .addOptionalParam(
    'full',
    'shows the whole configuration of each network',
    false,
    boolean
  )
  .setAction(async (taskArgs) => {
    Object.values(networks).forEach((network) => {
      if (taskArgs.full) {
        console.log(`${network.name} (${network.chainId} ${network.slug}):`)
        console.log(JSON.stringify(network, null, 2))
      } else {
        console.log(`${network.name} (${network.chainId} ${network.slug})`)
      }
    })
  })
