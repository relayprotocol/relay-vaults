import networks from '@relay-vaults/networks'
import { OriginNetworkConfig } from '@relay-vaults/types'
import { L2Status } from './checks/types'
import { checkOptimismBedrockStatus } from './checks/optimism-bedrock'
import { checkOptimismStatus } from './checks/optimism'
import { checkArbitrumStatus } from './checks/arbitrum'
import { checkZkSyncStatus } from './checks/zksync'
import { logger } from './logger'

// get all L2/L3 chains
export async function getL2s() {
  const l2Chains = Object.values(networks).filter(
    (chain): chain is OriginNetworkConfig =>
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
        logger.error({
          message: `L2 ${chain.name} ${chain.chainId} is down`,
          ...status,
        })
      }
    } catch (error) {
      logger.error(error)
    }
  }
}

export async function checkL2Status(chainId: number): Promise<L2Status> {
  try {
    const chain = networks[chainId] as OriginNetworkConfig

    if (!chain) {
      throw new Error(`Chain ${chainId} not found in config`)
    }

    // Different handling based on L2 stack type
    if (chain.stack === 'optimism') {
      return await checkOptimismBedrockStatus(chain)
    } else if (chain.stack === 'optimism-alt') {
      return await checkOptimismStatus(chain)
    } else if (chain.stack === 'arbitrum') {
      return await checkArbitrumStatus(chain)
    } else if (chain.stack === 'zksync') {
      return await checkZkSyncStatus(chain)
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
