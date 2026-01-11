import { JsonRpcProvider, Contract, EventLog, TopicFilter } from 'ethers'
import { OriginNetworkConfig } from '@relay-vaults/types'
import { L2Status } from './types'
import networks from '@relay-vaults/networks'

export async function checkArbitrumStatus(
  chain: OriginNetworkConfig
): Promise<L2Status> {
  const rollupAddress = chain.bridges?.arbitrum?.parent?.rollup
  if (!rollupAddress) {
    throw new Error('Rollup address not configured')
  }

  const arbitrumRollupAbi = [
    'event AssertionConfirmed(bytes32 indexed assertionHash, bytes32 blockHash, bytes32 sendRoot)',
    'event NodeConfirmed(uint64 indexed nodeNum, bytes32 blockHash, bytes32 sendRoot)',
  ]

  // Get L1 provider for checking proofs
  const l1Provider = new JsonRpcProvider(networks[chain.parentChainId].rpc[0])
  const contract = new Contract(rollupAddress, arbitrumRollupAbi, l1Provider)
  const filterNodeConfirmed = await contract.filters
    .NodeConfirmed()
    .getTopicFilter()
  const filterAssertionConfirmed = await contract.filters
    .AssertionConfirmed()
    .getTopicFilter()
  const filter = [
    filterNodeConfirmed.concat(filterAssertionConfirmed),
  ] as TopicFilter

  // look back in blocks
  const events = await contract.queryFilter(
    filter,
    -chain.bridges.arbitrum!.parent.maxBlocksWithoutProof!
  )

  if (events.length === 0) {
    return {
      error: 'No new rollup nodes found',
      isUp: false,
    }
  }

  // Get the latest event
  const latestEvent = events[events.length - 1]
  if (!(latestEvent instanceof EventLog)) {
    return {
      error: 'Invalid event format',
      isUp: false,
    }
  }

  const block = await l1Provider.getBlock(latestEvent.blockNumber)
  if (!block) {
    return {
      error: 'Block not found',
      isUp: false,
    }
  }

  const timeSinceLastProof = Math.floor(Date.now() / 1000) - block.timestamp
  const lastestBlock = await l1Provider.getBlock('latest')
  return {
    blocksSinceLastProof: lastestBlock!.number! - latestEvent.blockNumber,
    isUp: true,
    lastProofBlock: latestEvent.blockNumber,
    lastProofTimestamp: block.timestamp,
    timeSinceLastProof,
  }
}
