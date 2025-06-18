import networks from '@relay-vaults/networks'
import { ChildNetworkConfig } from '@relay-vaults/types'
import { L2Status } from './checks/types'
import { checkOptimismBedrockStatus } from './checks/optimism-bedrock'
import { checkOptimismStatus } from './checks/optimism'
import { checkArbitrumStatus } from './checks/arbitrum'
import { checkZkSyncStatus } from './checks/zksync'

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
