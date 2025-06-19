import { JsonRpcProvider, Contract, EventLog } from 'ethers'
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

  // TODO: use AssertionConfirmed ?
  const arbitrumRollupAbi = [
    'event AssertionConfirmed(bytes32 indexed assertionHash, bytes32 blockHash, bytes32 sendRoot)',
  ]
  // Get L1 provider for checking proofs
  const l1Provider = new JsonRpcProvider(networks[chain.parentChainId].rpc[0])

  const contract = new Contract(rollupAddress, arbitrumRollupAbi, l1Provider)
  const filter = contract.filters.AssertionConfirmed

  // look back in blocks
  const events = await contract.queryFilter(
    filter,
    -chain.bridges.arbitrum?.parent.maxBlocksWithoutProof!
  )

  if (events.length === 0) {
    return {
      isUp: false,
      error: 'No new rollup nodes found',
    }
  }

  // Get the latest event
  const latestEvent = events[events.length - 1]
  if (!(latestEvent instanceof EventLog)) {
    return {
      isUp: false,
      error: 'Invalid event format',
    }
  }

  const block = await l1Provider.getBlock(latestEvent.blockNumber)
  if (!block) {
    return {
      isUp: false,
      error: 'Block not found',
    }
  }

  const timeSinceLastProof = Math.floor(Date.now() / 1000) - block.timestamp
  const lastestBlock = await l1Provider.getBlock('latest')
  return {
    isUp: true,
    lastProofBlock: latestEvent.blockNumber,
    lastProofTimestamp: block.timestamp,
    blocksSinceLastProof: lastestBlock?.number! - latestEvent.blockNumber,
    timeSinceLastProof,
  }
}
