import { Provider, types, L1Signer } from 'zksync-ethers'
import { ethers, JsonRpcSigner } from 'ethers'

/**
 * Finalizes a ZKSync withdrawal transaction
 * @param signer - The signer that will finalize the withdrawal
 * @param withdrawalHash - The hash of the withdrawal transaction to finalize
 * @param network - The network to use (defaults to Sepolia)
 * @returns The transaction receipt of the finalization
 */
export async function finalizeZksyncWithdrawal(
  signer: JsonRpcSigner,
  withdrawalHash: string,
  network: types.Network = types.Network.Mainnet
) {
  const ethProvider = ethers.getDefaultProvider(network)
  const l1Signer = L1Signer.from(signer, ethProvider as Provider)
  const finalizeWithdrawHandle =
    await l1Signer.finalizeWithdrawal(withdrawalHash)
  return finalizeWithdrawHandle
}
