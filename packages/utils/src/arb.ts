import { ethers } from 'ethers'
import networks from '@relay-vaults/networks'
import { INodeInterface } from '@relay-vaults/abis'
import { OriginNetworkConfig } from '@relay-vaults/types'

function hexDataLength(hexString: string) {
  if (hexString.startsWith('0x')) hexString = hexString.slice(2)
  if (hexString.length % 2 !== 0) throw new Error('Invalid hex string')
  return hexString.length / 2
}

const getProvider = (chainId: bigint | number) => {
  const { rpc } = networks[chainId.toString()]
  const provider = new ethers.JsonRpcProvider(rpc[0]) // pick the first rpc endpoint
  return provider
}

export const estimateRetryableFee = async (
  originChainId: bigint,
  destinationChainId: bigint,
  data = '0x'
) => {
  const srcProvider = await getProvider(originChainId)
  const destProvider = await getProvider(destinationChainId)

  // 2. Get current L2 gas price
  const blockDest = await destProvider.getBlock('latest')
  const maxFeePerGas = blockDest!.baseFeePerGas

  // 3. Estimate the submission fee for calldata size
  const callDataSize = hexDataLength(data)
  const block = await srcProvider.getBlock('latest')
  const parentBaseFee = block!.baseFeePerGas

  // get submission cost
  const { inbox: inboxAddress } = (
    networks[destinationChainId.toString()] as OriginNetworkConfig
  ).bridges.arbitrum!.parent

  const inboxContract = new ethers.Contract('IInbox', inboxAddress, srcProvider)
  const maxSubmissionCost = await inboxContract.calculateRetryableSubmissionFee(
    callDataSize,
    parentBaseFee
  )

  return {
    maxFeePerGas,
    maxSubmissionCost,
  }
}

export const estimateNativeBridgeTicketCost = async ({
  originChainId,
  destinationChainId,
  destProxyBridgeAddress,
  from,
  bridgeAddress,
  amount,
  data = '0x',
}: {
  originChainId: bigint
  destinationChainId: bigint
  destProxyBridgeAddress: string
  from: string
  bridgeAddress: string
  amount: bigint
  data: string
}) => {
  const destProvider = await getProvider(destinationChainId)

  // You will need to implement these contract ABIs and addresses yourself
  const NodeInterface = new ethers.Interface(INodeInterface)
  const nodeInterface = new ethers.Contract(
    '0x00000000000000000000000000000000000000C8',
    NodeInterface,
    destProvider
  )

  // 1. Estimate gasLimit for the retryable ticket
  const gasLimit = await nodeInterface.estimateRetryableTicket.estimateGas(
    from, // from,
    amount + ethers.parseEther('1'), // senderDeposit, // can be a dummy value (e.g., l2CallValue + 1 ether)
    destProxyBridgeAddress, // to
    amount, // l2CallValue
    bridgeAddress, // excessFeeRefundAddress
    bridgeAddress, // callValueRefundAddress (receives msg.value on l2)
    data // data
  )

  const { maxFeePerGas, maxSubmissionCost } = await estimateRetryableFee(
    originChainId,
    destinationChainId,
    data
  )

  // 4. Compute deposit (sum of all costs, plus l2CallValue)
  const deposit = gasLimit * maxFeePerGas! + maxSubmissionCost + amount

  // 5. Return all values as an object (in BN/BigInt/string as needed)
  return {
    deposit,
    gasLimit,
    maxFeePerGas,
    maxSubmissionCost,
  }
}
