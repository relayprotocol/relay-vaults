import { JsonRpcProvider, Contract, AbiCoder, EventLog } from 'ethers'
import networks from '@relay-protocol/networks'
import { ChildNetworkConfig } from '@relay-protocol/types'

// Constants for status checking
const MAX_BLOCKS_WITHOUT_PROOF = 100 // Maximum number of blocks without a proof before considering chain down
const MAX_TIME_WITHOUT_PROOF = 3600 * 2 // 2 hours in seconds

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
      console.log(`\nL2 Status Results for ${chain.name} ${chain.chainId}:`)
      console.log('------------------')
      console.log(`Chain is up: ${status.isUp}`)

      if (!status.isUp) {
        console.log(`FAIL: ${status.error}`)
      }

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
      return await checkOptimismStatus(chain, l1Provider, currentL1Block)
      // } else if (chain.stack === 'optimism-alt') {
      //   return await checkOptimismBedrockStatus(chain, l1Provider, currentL1Block)
      // } else if (chain.stack === 'arbitrum') {
      //   return await checkArbitrumStatus(chain, l1Provider, currentL1Block)
      // } else if (chain.stack === 'zksync') {
      //   return await checkZkSyncStatus(chain, l1Provider, currentL1Block)
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
  l1Provider: JsonRpcProvider,
  currentL1Block: number
): Promise<L2Status> {
  const l2OutputOracleAddress = chain.bridges?.optimism?.parent?.outputOracle
  if (!l2OutputOracleAddress) {
    throw new Error('L2OutputOracle address not configured')
  }

  const L2OutputOracleABI = [
    'event OutputProposed(uint256 indexed outputIndex, bytes32 outputRoot, uint256 l2BlockNumber, uint256 l1Timestamp)',
  ]

  const contract = new Contract(
    l2OutputOracleAddress,
    L2OutputOracleABI,
    l1Provider
  )
  const filter = contract.filters.OutputProposed()

  // look back in blocks
  const fromBlock = currentL1Block - MAX_BLOCKS_WITHOUT_PROOF
  const events = await contract.queryFilter(filter, fromBlock, 'latest')

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
  const blocksSinceLastProof =
    currentL1Block - Number(latestEvent.args.l2BlockNumber)

  return {
    isUp:
      timeSinceLastProof < MAX_TIME_WITHOUT_PROOF &&
      blocksSinceLastProof < MAX_BLOCKS_WITHOUT_PROOF,
    lastProofBlock: Number(latestEvent.args.l2BlockNumber),
    lastProofTimestamp: Number(latestEvent.args.l1Timestamp),
    timeSinceLastProof,
  }
}

const DISPUTE_GAME_FACTORY_ABI = [
  'function getGame(uint256 _index) external view returns (address gameProxy, uint256 timestamp, uint256 blockNumber, bytes32 rootClaim, bytes extraData)',
]

export async function getGame(
  l1ChainId: number,
  fromBlock: number,
  disputeGameFactoryAddress: string,
  portalAddress: string
) {
  const provider = new JsonRpcProvider(networks[l1ChainId].rpc[0])
  const contract = new Contract(
    disputeGameFactoryAddress,
    DISPUTE_GAME_FACTORY_ABI,
    provider
  )

  // Get the latest game index
  const latestGameIndex = (await contract.getGameCount()) - 1n
  if (latestGameIndex < 0n) {
    return null
  }

  // Get the latest game
  const game = await contract.getGame(latestGameIndex)
  return game
}

async function checkOptimismBedrockStatus(
  chain: ChildNetworkConfig,
  l1Provider: JsonRpcProvider,
  currentL1Block: number
): Promise<L2Status> {
  const disputeGameFactoryAddress = chain.bridges?.optimism?.parent?.portalProxy
  const portalAddress = chain.bridges?.optimism?.parent?.portalProxy

  if (!disputeGameFactoryAddress || !portalAddress) {
    throw new Error(
      'Missing required contract addresses for Bedrock status check'
    )
  }

  // Get the latest L2 block number
  const l2Provider = new JsonRpcProvider(chain.rpc[0])
  const currentL2Block = await l2Provider.getBlockNumber()

  // Get the latest game
  const latestGame = await getGame(
    chain.parentChainId,
    currentL2Block - MAX_BLOCKS_WITHOUT_PROOF, // Look for games within last 100 blocks
    disputeGameFactoryAddress,
    portalAddress
  )

  if (!latestGame) {
    return {
      isUp: false,
      error: 'No recent games found',
    }
  }

  // Get the L2 block number from the game
  const abiCoder = new AbiCoder()
  const l2Block = abiCoder.decode(['uint256'], latestGame[4])[0] as bigint
  const timeSinceLastGame =
    Math.floor(Date.now() / 1000) - Number(latestGame[2]) // timestamp is at index 2

  return {
    isUp: timeSinceLastGame < MAX_TIME_WITHOUT_PROOF,
    lastProofBlock: Number(l2Block),
    lastProofTimestamp: Number(latestGame[2]),
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

  const arbitrumRollupAbi = [
    'event AssertionCreated(uint64 assertionID, bytes32 vmHash, bytes32 inboxHash, uint256 afterInboxBatchAcc, bytes32 stateHash, uint256 parentID)',
  ]

  const contract = new Contract(rollupAddress, arbitrumRollupAbi, l1Provider)
  const filter = contract.filters.NodeCreated()

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
    ['event BlockExecution(uint256 indexed blockNumber)'],
    l1Provider
  )
  const filter = contract.filters.BlockExecution()

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
