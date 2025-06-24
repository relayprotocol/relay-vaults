// hardhat ignition is not supported rn
// https://github.com/NomicFoundation/hardhat-ignition/issues/825
import { type JsonRpcResult } from 'ethers'
import networks from '@relay-vaults/networks'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { outputJSON } from 'fs-extra'
import path from 'path'

// add json manifest to ignition deployments folder
async function createIgnitionManifest(
  deploymentId: string,
  contractName: string,
  deployedAddress: string
) {
  const key = `${contractName}#${contractName}`
  const data = {
    [key]: deployedAddress,
  }
  const manifestPath = path.join(
    __dirname,
    '..',
    `ignition/deployments/${deploymentId}/deployed_addresses.json`
  )
  await outputJSON(manifestPath, data, { spaces: 2 })
}

export async function getZkSyncBridgeContracts(chainId: bigint) {
  const { rpc } = networks[chainId!.toString()]
  const rpcURL = rpc[0]
  const resp = await fetch(rpcURL, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'zks_getBridgeContracts',
      params: [],
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const { result } = (await resp.json()) as JsonRpcResult
  return result
}

export const verifyContract = async ({
  hre,
  address,
  deployArgs,
  contract,
}: {
  hre: HardhatRuntimeEnvironment
  address: string
  deployArgs?: any
  contract: string
}) => {
  const { run } = hre
  let tries = 0
  while (tries < 5) {
    const fullyQualifiedNames = await hre.artifacts.getAllFullyQualifiedNames()
    const fullyQualifiedName = fullyQualifiedNames.find(
      (q) => q.split(':')[1] === 'RelayBridgeFactory'
    )
    try {
      await run('verify:verify', {
        address,
        constructorArguments: deployArgs,
        contract: fullyQualifiedName,
      })
      tries++
    } catch (error) {
      if (tries >= 5) {
        console.log(
          `FAIL: Verification failed for contract at ${address} with args : ${deployArgs.toString()} after 5 tries.`
        )
        console.log(error)
        return
      } else {
        console.log(
          `FAIL: Verification failed for contract at ${address} with args : ${deployArgs.toString()}. Retrying in 10 seconds`
        )
        await new Promise((resolve) => setTimeout(resolve, 10000))
      }
    }
  }
}

export async function deployContract(
  hre: HardhatRuntimeEnvironment,
  contractNameOrFullyQualifiedName: string,
  deployArgs = [],
  deploymentId?: string
) {
  console.log('Deploying for zksync...')
  // recompile contracts for zksync beforehand
  await hre.run('compile', { zksync: true })

  const artifact = await hre.deployer.loadArtifact(
    contractNameOrFullyQualifiedName
  )

  const deploymentFee = await hre.deployer.estimateDeployFee(
    artifact,
    deployArgs
  )
  const parsedFee = hre.ethers.formatEther(deploymentFee.toString())
  console.log(`Deployment is estimated to cost ${parsedFee} ETH`)

  const contract = await hre.deployer.deploy(artifact, deployArgs)
  await contract.waitForDeployment()
  const address = await contract.getAddress()

  // create ignition manifest by reproducing similar naming pattern
  const contractName = contractNameOrFullyQualifiedName.split(':')[0]
  if (!deploymentId) {
    const { chainId } = await hre.ethers.provider.getNetwork()
    deploymentId = `${contractName}-${chainId.toString()}`
  }
  await createIgnitionManifest(deploymentId, contractName, address)

  const { hash } = await contract.deploymentTransaction()

  // verify
  await verifyContract({
    address,
    contract: contractNameOrFullyQualifiedName,
    deployArgs,
    hre,
  })
  return {
    address,
    contract,
    hash,
  }
}
