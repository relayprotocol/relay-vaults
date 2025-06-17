import { JsonRpcProvider, Contract, AbiCoder, EventLog } from 'ethers'
import networks from '@relay-protocol/networks'
import { ChildNetworkConfig } from '@relay-protocol/types'

// Constants for status checking
const MAX_BLOCKS_WITHOUT_PROOF = 2000 // Maximum number of blocks without a proof before considering chain down
const MAX_TIME_WITHOUT_PROOF = 3600 * 5 // 2 hours in seconds

export interface L2Status {
  isUp: boolean
  lastProofBlock?: number
  lastProofTimestamp?: number
  timeSinceLastProof?: number
  error?: string
}

// get all L2/L3 chains
export async function getL2s() {
  const l2Chains = Object.values(networks).filter(
    (chain): chain is ChildNetworkConfig =>
      'stack' in chain &&
      'parentChainId' in chain &&
      chain.chainId !== chain.parentChainId
  )

  return l2Chains
}

// Check status for each L2/L3 chain
export async function checkL2Chains() {
  const l2Chains = await getL2s()
  for (const chain of l2Chains) {
    try {
      const status = await checkL2Status(Number(chain.chainId))
      if (!status.isUp) {
        console.log(`\nL2 ${chain.name} ${chain.chainId} is down:`)
        console.log('------------------')
        console.log(`Chain is up: ${status.isUp}`)

        if (status.lastProofBlock) {
          console.log(`Last proof block: ${status.lastProofBlock}`)
        }

        if (status.lastProofTimestamp) {
          console.log(
            `Last proof timestamp: ${new Date(status.lastProofTimestamp * 1000).toISOString()}`
          )
        }

        if (status.timeSinceLastProof) {
          console.log(
            `Time since last proof: ${status.timeSinceLastProof} seconds`
          )
        }

        if (status.error) {
          console.log(`Error: ${status.error}`)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}

export async function checkL2Status(chainId: number): Promise<L2Status> {
  try {
    const chain = networks[chainId] as ChildNetworkConfig

    if (!chain) {
      throw new Error(`Chain ${chainId} not found in config`)
    }

    // Get L1 provider for checking proofs
    const l1Provider = new JsonRpcProvider(networks[chain.parentChainId].rpc[0])

    // Get current L1 block
    const currentL1Block = await l1Provider.getBlockNumber()

    // Different handling based on L2 stack type
    if (chain.stack === 'optimism') {
      return await checkOptimismBedrockStatus(chain, l1Provider, currentL1Block)
    } else if (chain.stack === 'optimism-alt') {
      return await checkOptimismStatus(chain, l1Provider, currentL1Block)
    } else if (chain.stack === 'arbitrum') {
      return await checkArbitrumStatus(chain, l1Provider, currentL1Block)
    } else if (chain.stack === 'zksync') {
      return await checkZkSyncStatus(chain, l1Provider, currentL1Block)
    } else {
      throw new Error(`Unsupported L2 stack type: ${chain.stack}`)
    }
  } catch (error) {
    return {
      isUp: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// deprec version of OP stack using l2OutputOracle (before bedrock)
// https://gov.optimism.io/t/final-protocol-upgrade-7-fault-proofs/8161
async function checkOptimismStatus(
  chain: ChildNetworkConfig,
  l1Provider: JsonRpcProvider
): Promise<L2Status> {
  const l2OutputOracleAddress =
    chain.bridges?.optimismAlt?.parent?.outputOracle!
  if (!l2OutputOracleAddress) {
    throw new Error('L2OutputOracle address not configured')
  }

  const L2OutputOracleABI = [
    'event OutputProposed(bytes32 indexed outputRoot, uint256 indexed outputIndex, uint256 indexed l2BlockNumber, uint256 l1Timestamp)',
  ]

  const contract = new Contract(
    l2OutputOracleAddress,
    L2OutputOracleABI,
    l1Provider
  )
  // look back in blocks
  const filter = contract.filters.OutputProposed
  const events = await contract.queryFilter(filter, -MAX_BLOCKS_WITHOUT_PROOF)

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
    isUp: timeSinceLastProof < MAX_TIME_WITHOUT_PROOF,
    lastProofBlock: Number(latestEvent.args.l2BlockNumber),
    lastProofTimestamp: Number(latestEvent.args.l1Timestamp),
    timeSinceLastProof,
  }
}

const DISPUTE_GAME_FACTORY_ABI = [
  'function gameAtIndex(uint256 _index) external view returns (uint32 gameType_, uint64 timestamp_, address proxy_)',
  'function gameCount() external view returns (uint256 count)',
]

export async function getGame(
  l1ChainId: number,
  disputeGameFactoryAddress: string
) {
  const provider = new JsonRpcProvider(networks[l1ChainId].rpc[0])
  const contract = new Contract(
    disputeGameFactoryAddress,
    DISPUTE_GAME_FACTORY_ABI,
    provider
  )

  // Get the latest game index
  const latestGameIndex = (await contract.gameCount()) - 1n
  if (latestGameIndex < 0n) {
    return null
  }

  // Get the latest game
  const game = await contract.gameAtIndex(latestGameIndex)
  return game
}

async function checkOptimismBedrockStatus(
  chain: ChildNetworkConfig
): Promise<L2Status> {
  const disputeGameFactoryAddress = chain.bridges?.optimism?.parent?.gameFactory

  if (!disputeGameFactoryAddress) {
    throw new Error(
      'Missing required gameFactory contract addresses for Bedrock status check'
    )
  }

  // Get the latest game
  const latestGame = await getGame(
    chain.parentChainId,
    disputeGameFactoryAddress
  )

  if (!latestGame) {
    return {
      isUp: false,
      error: 'No recent games found',
    }
  }

  // Get the L2 block number from the game

  const [, timestamp] = latestGame
  const timeSinceLastGame =
    Math.floor(Date.now() / 1000) - Number(timestamp.toString())

  return {
    isUp: timeSinceLastGame < MAX_TIME_WITHOUT_PROOF,
    lastProofBlock: 0,
    lastProofTimestamp: Number(timestamp.toString()),
    timeSinceLastProof: timeSinceLastGame,
  }
}

async function checkArbitrumStatus(
  chain: ChildNetworkConfig,
  l1Provider: JsonRpcProvider,
  currentL1Block: number
): Promise<L2Status> {
  const rollupAddress = chain.bridges?.arbitrum?.parent?.rollup
  if (!rollupAddress) {
    throw new Error('Rollup address not configured')
  }

  // TODO: use AssertionConfirmed ?
  const arbitrumRollupAbi = [
    'event AssertionConfirmed(bytes32 indexed assertionHash, bytes32 blockHash, bytes32 sendRoot)',
  ]

  const contract = new Contract(rollupAddress, arbitrumRollupAbi, l1Provider)
  const filter = contract.filters.AssertionConfirmed

  // look back in blocks
  const fromBlock = currentL1Block - MAX_BLOCKS_WITHOUT_PROOF
  const events = await contract.queryFilter(filter, fromBlock, 'latest')

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
  const blocksSinceLastProof = currentL1Block - latestEvent.blockNumber

  return {
    isUp:
      timeSinceLastProof < MAX_TIME_WITHOUT_PROOF &&
      blocksSinceLastProof < MAX_BLOCKS_WITHOUT_PROOF,
    lastProofBlock: Number(latestEvent.args.nodeNum),
    lastProofTimestamp: block.timestamp,
    timeSinceLastProof,
  }
}

async function checkZkSyncStatus(
  chain: ChildNetworkConfig,
  l1Provider: JsonRpcProvider,
  currentL1Block: number
): Promise<L2Status> {
  // diamond Proxy is main zkSync contract on L1
  const diamondProxyAddress = chain.bridges?.zksync?.parent?.diamondProxy
  if (!diamondProxyAddress) {
    throw new Error('Diamond Proxy address not configured')
  }

  const contract = new Contract(
    diamondProxyAddress,
    [
      'event BlockExecution(uint256 indexed blockNumber, bytes32 indexed blockHash, bytes32 indexed commitment)',
    ],
    l1Provider
  )
  const filter = contract.filters.BlockExecution

  // look back in blocks
  const fromBlock = currentL1Block - MAX_BLOCKS_WITHOUT_PROOF
  const events = await contract.queryFilter(filter, fromBlock, 'latest')

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
  const blocksSinceLastProof = currentL1Block - latestEvent.blockNumber

  return {
    isUp:
      timeSinceLastProof < MAX_TIME_WITHOUT_PROOF &&
      blocksSinceLastProof < MAX_BLOCKS_WITHOUT_PROOF,
    lastProofBlock: Number(latestEvent.args.blockNumber),
    lastProofTimestamp: block.timestamp,
    timeSinceLastProof,
  }
}
