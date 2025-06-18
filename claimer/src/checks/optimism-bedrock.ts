import { JsonRpcProvider, Contract } from 'ethers'
import { ChildNetworkConfig } from '@relay-vaults/types'
import { L2Status } from './types'
import networks from '@relay-vaults/networks'

const DISPUTE_GAME_FACTORY_ABI = [
  'function gameAtIndex(uint256 _index) external view returns (uint32 gameType_, uint64 timestamp_, address proxy_)',
  'function gameCount() external view returns (uint256 count)',
]

async function getGame(l1ChainId: number, disputeGameFactoryAddress: string) {
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

export async function checkOptimismBedrockStatus(
  chain: ChildNetworkConfig,
  maxTimeWithoutProof = 3600 * 3
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

  const [, timestamp] = latestGame
  const timeSinceLastGame =
    Math.floor(Date.now() / 1000) - Number(timestamp.toString())

  return {
    isUp:
      timeSinceLastGame < chain.bridges.optimism?.parent.maxTimeWithoutProof!,
    lastProofBlock: 0,
    lastProofTimestamp: Number(timestamp.toString()),
    timeSinceLastProof: timeSinceLastGame,
  }
}
