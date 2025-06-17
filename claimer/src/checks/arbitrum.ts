import { JsonRpcProvider, Contract, EventLog } from 'ethers'
import { ChildNetworkConfig } from '@relay-protocol/types'
import { L2Status } from './types'
import networks from '@relay-protocol/networks'

export async function checkArbitrumStatus(
  chain: ChildNetworkConfig,
  maxBlocksWithoutProof = 1000
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
  const events = await contract.queryFilter(filter, -maxBlocksWithoutProof)

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

  return {
    isUp: true,
    lastProofBlock: Number(latestEvent.args.nodeNum),
    lastProofTimestamp: block.timestamp,
    timeSinceLastProof,
  }
}
