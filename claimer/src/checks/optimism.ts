import { JsonRpcProvider, Contract, EventLog } from 'ethers'
import { OriginNetworkConfig } from '@relay-vaults/types'
import { L2Status } from './types'
import networks from '@relay-vaults/networks'

// deprec version of OP stack using l2OutputOracle (before bedrock)
// https://gov.optimism.io/t/final-protocol-upgrade-7-fault-proofs/8161
export async function checkOptimismStatus(
  chain: OriginNetworkConfig
): Promise<L2Status> {
  const parent = chain.bridges?.optimism?.parent
  if (!parent || !('outputOracle' in parent)) {
    throw new Error(
      'L2OutputOracle address not configured - this function is for legacy Optimism chains only'
    )
  }

  const l2OutputOracleAddress = parent.outputOracle
  if (!l2OutputOracleAddress) {
    throw new Error('L2OutputOracle address not configured')
  }

  const L2OutputOracleABI = [
    'event OutputProposed(bytes32 indexed outputRoot, uint256 indexed outputIndex, uint256 indexed l2BlockNumber, uint256 l1Timestamp)',
  ]

  // Get L1 provider for checking proofs
  const l1Provider = new JsonRpcProvider(networks[chain.parentChainId].rpc[0])

  const contract = new Contract(
    l2OutputOracleAddress,
    L2OutputOracleABI,
    l1Provider
  )
  // look back in blocks
  const filter = contract.filters.OutputProposed
  const events = await contract.queryFilter(
    filter,
    -parent.maxBlocksWithoutProof
  )

  if (events.length === 0) {
    return {
      error: 'No output proposals found',
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

  const timeSinceLastProof =
    Math.floor(Date.now() / 1000) - Number(latestEvent.args.l1Timestamp)

  const lastestBlock = await l1Provider.getBlock('latest')

  return {
    blocksSinceLastProof:
      lastestBlock!.number! - Number(latestEvent.blockNumber),
    isUp: true,
    lastProofBlock: Number(latestEvent.blockNumber),
    lastProofTimestamp: Number(latestEvent.args.l1Timestamp),
    timeSinceLastProof,
  }
}
