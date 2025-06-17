import { JsonRpcProvider, Contract, EventLog } from 'ethers'
import { ChildNetworkConfig } from '@relay-protocol/types'
import { L2Status } from './types'
import networks from '@relay-protocol/networks'

// deprec version of OP stack using l2OutputOracle (before bedrock)
// https://gov.optimism.io/t/final-protocol-upgrade-7-fault-proofs/8161
export async function checkOptimismStatus(
  chain: ChildNetworkConfig,
  maxBlocksWithoutProof = 4000
): Promise<L2Status> {
  const l2OutputOracleAddress =
    chain.bridges?.optimismAlt?.parent?.outputOracle!
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
  const events = await contract.queryFilter(filter, -maxBlocksWithoutProof)

  if (events.length === 0) {
    return {
      isUp: false,
      error: 'No output proposals found',
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

  const timeSinceLastProof =
    Math.floor(Date.now() / 1000) - Number(latestEvent.args.l1Timestamp)

  return {
    isUp: true,
    lastProofBlock: Number(latestEvent.args.l2BlockNumber),
    lastProofTimestamp: Number(latestEvent.args.l1Timestamp),
    timeSinceLastProof,
  }
}
