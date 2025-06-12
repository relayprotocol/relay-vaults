import networks from '@relay-protocol/networks'
import { readFileSync, writeFile, writeFileSync } from 'fs'
import { task } from 'hardhat/config'

const EARLIEST_BLOCKS_FILE =
  __dirname + '/../../../packages/networks/src/earliestBlocks.json'

function roundDownToThousand(num: number): number {
  return Math.floor(num / 1000) * 1000
}

task(
  'set-earliest-block',
  'Set the earliest block for a network, if not set yet!'
).setAction(async (_, { ethers }) => {
  const { chainId } = await ethers.provider.getNetwork()
  const network = networks[chainId.toString()]
  if (!network.earliestBlock) {
    const data = readFileSync(EARLIEST_BLOCKS_FILE, 'utf-8')
    const earliestBlocks = JSON.parse(data)
    const latestBlock = await ethers.provider.getBlockNumber()
    earliestBlocks[network.slug!] = roundDownToThousand(latestBlock)

    await writeFileSync(
      EARLIEST_BLOCKS_FILE,
      JSON.stringify(earliestBlocks, null, 2)
    )
    console.log(
      `Set earliest block for ${network.slug} to ${earliestBlocks[network.slug!]}`
    )

    return
  }
})
