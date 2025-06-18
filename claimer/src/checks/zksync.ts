import { JsonRpcProvider, Contract, EventLog } from 'ethers'
import { ChildNetworkConfig } from '@relay-protocol/types'
import { L2Status } from './types'
import networks from '@relay-protocol/networks'

export async function checkZkSyncStatus(
  chain: ChildNetworkConfig
): Promise<L2Status> {
  // diamond Proxy is main zkSync contract on L1
  const diamondProxyAddress = chain.bridges?.zksync?.parent?.diamondProxy
  if (!diamondProxyAddress) {
    throw new Error('Diamond Proxy address not configured')
  }
  // Get L1 provider for checking proofs
  const l1Provider = new JsonRpcProvider(networks[chain.parentChainId].rpc[0])
  const contract = new Contract(
    diamondProxyAddress,
    [
      'event BlockExecution(uint256 indexed blockNumber, bytes32 indexed blockHash, bytes32 indexed commitment)',
    ],
    l1Provider
  )
  // look back in blocks for events
  const filter = contract.filters.BlockExecution
  const events = await contract.queryFilter(
    filter,
    -chain.bridges.zksync?.parent.maxBlocksWithoutProof!
  )

  if (events.length === 0) {
    return {
      isUp: false,
      error: 'No block executions found',
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
    lastProofBlock: Number(latestEvent.args.blockNumber),
    blocksSinceLastProof:
      lastestBlock?.number! - Number(latestEvent.args.blockNumber),
    lastProofTimestamp: block.timestamp,
    timeSinceLastProof,
  }
}
