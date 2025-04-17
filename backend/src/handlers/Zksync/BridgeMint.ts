import networks from '@relay-protocol/networks'
import { eq, and } from 'ponder'
import { Context, Event } from 'ponder:registry'
import { bridgeTransaction } from 'ponder:schema'
import { decodeFunctionData, keccak256 } from 'viem'

export default async function ({
  event,
  context,
}: {
  event: Event<'L1NativeTokenVault:BridgeMint'>
  context: Context<'L1NativeTokenVault:BridgeMint'>
}) {
  const originNetwork = networks[event.args.chainId]
  if (originNetwork?.bridges?.zksync?.parent.nativeTokenVault) {
    // If it was sent to the sharedDefaultBridge
    if (
      event.transaction.to.toLowerCase() ==
      originNetwork?.bridges?.zksync?.parent.sharedDefaultBridge.toLowerCase()
    ) {
      console.log(event.transaction.hash)
      // decode finalizeWithdrawal function data
      const { functionName, args } = decodeFunctionData({
        abi: [
          {
            inputs: [
              {
                internalType: 'contract IBridgehub',
                name: '_bridgehub',
                type: 'address',
              },
              { internalType: 'uint256', name: '_eraChainId', type: 'uint256' },
              {
                internalType: 'address',
                name: '_eraDiamondProxy',
                type: 'address',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'constructor',
          },
          {
            inputs: [
              { internalType: 'address', name: 'addr', type: 'address' },
            ],
            name: 'AddressAlreadySet',
            type: 'error',
          },
          { inputs: [], name: 'DepositDoesNotExist', type: 'error' },
          { inputs: [], name: 'DepositExists', type: 'error' },
          { inputs: [], name: 'EthTransferFailed', type: 'error' },
          {
            inputs: [
              { internalType: 'bytes32', name: 'assetId', type: 'bytes32' },
              {
                internalType: 'address',
                name: 'tokenAddress',
                type: 'address',
              },
            ],
            name: 'IncorrectTokenAddressFromNTV',
            type: 'error',
          },
          { inputs: [], name: 'InvalidNTVBurnData', type: 'error' },
          { inputs: [], name: 'InvalidProof', type: 'error' },
          {
            inputs: [{ internalType: 'bytes4', name: 'func', type: 'bytes4' }],
            name: 'InvalidSelector',
            type: 'error',
          },
          {
            inputs: [
              { internalType: 'uint256', name: 'messageLen', type: 'uint256' },
            ],
            name: 'L2WithdrawalMessageWrongLength',
            type: 'error',
          },
          { inputs: [], name: 'LegacyBridgeNotSet', type: 'error' },
          { inputs: [], name: 'LegacyMethodForNonL1Token', type: 'error' },
          { inputs: [], name: 'NativeTokenVaultAlreadySet', type: 'error' },
          { inputs: [], name: 'NotInitializedReentrancyGuard', type: 'error' },
          { inputs: [], name: 'Reentrancy', type: 'error' },
          {
            inputs: [
              { internalType: 'enum SharedBridgeKey', name: '', type: 'uint8' },
            ],
            name: 'SharedBridgeValueNotSet',
            type: 'error',
          },
          { inputs: [], name: 'SlotOccupied', type: 'error' },
          {
            inputs: [
              { internalType: 'address', name: 'caller', type: 'address' },
            ],
            name: 'Unauthorized',
            type: 'error',
          },
          { inputs: [], name: 'UnsupportedEncodingVersion', type: 'error' },
          { inputs: [], name: 'WithdrawalAlreadyFinalized', type: 'error' },
          {
            inputs: [
              {
                internalType: 'address',
                name: 'providedL2Sender',
                type: 'address',
              },
            ],
            name: 'WrongL2Sender',
            type: 'error',
          },
          {
            inputs: [
              { internalType: 'uint256', name: 'expected', type: 'uint256' },
              { internalType: 'uint256', name: 'length', type: 'uint256' },
            ],
            name: 'WrongMsgLength',
            type: 'error',
          },
          { inputs: [], name: 'ZeroAddress', type: 'error' },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: 'uint256',
                name: 'chainId',
                type: 'uint256',
              },
              {
                indexed: true,
                internalType: 'bytes32',
                name: 'txDataHash',
                type: 'bytes32',
              },
              {
                indexed: true,
                internalType: 'bytes32',
                name: 'l2DepositTxHash',
                type: 'bytes32',
              },
            ],
            name: 'BridgehubDepositFinalized',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'uint8',
                name: 'version',
                type: 'uint8',
              },
            ],
            name: 'Initialized',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
              },
              {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
              },
            ],
            name: 'OwnershipTransferStarted',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
              },
              {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
              },
            ],
            name: 'OwnershipTransferred',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
              },
            ],
            name: 'Paused',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
              },
            ],
            name: 'Unpaused',
            type: 'event',
          },
          {
            inputs: [],
            name: 'BRIDGE_HUB',
            outputs: [
              {
                internalType: 'contract IBridgehub',
                name: '',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: '__DEPRECATED_admin',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: 'chainId', type: 'uint256' },
              { internalType: 'address', name: 'l1Token', type: 'address' },
            ],
            name: '__DEPRECATED_chainBalance',
            outputs: [
              { internalType: 'uint256', name: 'balance', type: 'uint256' },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: 'chainId', type: 'uint256' },
            ],
            name: '__DEPRECATED_l2BridgeAddress',
            outputs: [
              { internalType: 'address', name: 'l2Bridge', type: 'address' },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: '__DEPRECATED_pendingAdmin',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'acceptOwnership',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: '_chainId', type: 'uint256' },
              {
                internalType: 'address',
                name: '_depositSender',
                type: 'address',
              },
              { internalType: 'bytes32', name: '_assetId', type: 'bytes32' },
              { internalType: 'bytes', name: '_assetData', type: 'bytes' },
              { internalType: 'bytes32', name: '_l2TxHash', type: 'bytes32' },
              {
                internalType: 'uint256',
                name: '_l2BatchNumber',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_l2MessageIndex',
                type: 'uint256',
              },
              {
                internalType: 'uint16',
                name: '_l2TxNumberInBatch',
                type: 'uint16',
              },
              {
                internalType: 'bytes32[]',
                name: '_merkleProof',
                type: 'bytes32[]',
              },
            ],
            name: 'bridgeRecoverFailedTransfer',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: '_chainId', type: 'uint256' },
              { internalType: 'bytes32', name: '_txDataHash', type: 'bytes32' },
              { internalType: 'bytes32', name: '_txHash', type: 'bytes32' },
            ],
            name: 'bridgehubConfirmL2TransactionForwarded',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: '_chainId', type: 'uint256' },
              { internalType: 'address', name: '_token', type: 'address' },
            ],
            name: 'chainBalance',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: '_chainId', type: 'uint256' },
              {
                internalType: 'address',
                name: '_depositSender',
                type: 'address',
              },
              { internalType: 'address', name: '_l1Token', type: 'address' },
              { internalType: 'uint256', name: '_amount', type: 'uint256' },
              { internalType: 'bytes32', name: '_l2TxHash', type: 'bytes32' },
              {
                internalType: 'uint256',
                name: '_l2BatchNumber',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_l2MessageIndex',
                type: 'uint256',
              },
              {
                internalType: 'uint16',
                name: '_l2TxNumberInBatch',
                type: 'uint16',
              },
              {
                internalType: 'bytes32[]',
                name: '_merkleProof',
                type: 'bytes32[]',
              },
            ],
            name: 'claimFailedDeposit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '_depositSender',
                type: 'address',
              },
              { internalType: 'address', name: '_l1Token', type: 'address' },
              { internalType: 'uint256', name: '_amount', type: 'uint256' },
              { internalType: 'bytes32', name: '_l2TxHash', type: 'bytes32' },
              {
                internalType: 'uint256',
                name: '_l2BatchNumber',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_l2MessageIndex',
                type: 'uint256',
              },
              {
                internalType: 'uint16',
                name: '_l2TxNumberInBatch',
                type: 'uint16',
              },
              {
                internalType: 'bytes32[]',
                name: '_merkleProof',
                type: 'bytes32[]',
              },
            ],
            name: 'claimFailedDepositLegacyErc20Bridge',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: 'chainId', type: 'uint256' },
              {
                internalType: 'bytes32',
                name: 'l2DepositTxHash',
                type: 'bytes32',
              },
            ],
            name: 'depositHappened',
            outputs: [
              {
                internalType: 'bytes32',
                name: 'depositDataHash',
                type: 'bytes32',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'bytes1',
                name: '_encodingVersion',
                type: 'bytes1',
              },
              {
                internalType: 'address',
                name: '_originalCaller',
                type: 'address',
              },
              { internalType: 'bytes32', name: '_assetId', type: 'bytes32' },
              { internalType: 'bytes', name: '_transferData', type: 'bytes' },
            ],
            name: 'encodeTxDataHash',
            outputs: [
              { internalType: 'bytes32', name: 'txDataHash', type: 'bytes32' },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                components: [
                  { internalType: 'uint256', name: 'chainId', type: 'uint256' },
                  {
                    internalType: 'uint256',
                    name: 'l2BatchNumber',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'l2MessageIndex',
                    type: 'uint256',
                  },
                  {
                    internalType: 'address',
                    name: 'l2Sender',
                    type: 'address',
                  },
                  {
                    internalType: 'uint16',
                    name: 'l2TxNumberInBatch',
                    type: 'uint16',
                  },
                  { internalType: 'bytes', name: 'message', type: 'bytes' },
                  {
                    internalType: 'bytes32[]',
                    name: 'merkleProof',
                    type: 'bytes32[]',
                  },
                ],
                internalType: 'struct FinalizeL1DepositParams',
                name: '_finalizeWithdrawalParams',
                type: 'tuple',
              },
            ],
            name: 'finalizeDeposit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: '_chainId', type: 'uint256' },
              {
                internalType: 'uint256',
                name: '_l2BatchNumber',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_l2MessageIndex',
                type: 'uint256',
              },
              {
                internalType: 'uint16',
                name: '_l2TxNumberInBatch',
                type: 'uint16',
              },
              { internalType: 'bytes', name: '_message', type: 'bytes' },
              {
                internalType: 'bytes32[]',
                name: '_merkleProof',
                type: 'bytes32[]',
              },
            ],
            name: 'finalizeWithdrawal',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'address', name: '_owner', type: 'address' },
              {
                internalType: 'uint256',
                name: '_eraPostDiamondUpgradeFirstBatch',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_eraPostLegacyBridgeUpgradeFirstBatch',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_eraLegacyBridgeLastDepositBatch',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_eraLegacyBridgeLastDepositTxNumber',
                type: 'uint256',
              },
            ],
            name: 'initialize',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: 'chainId', type: 'uint256' },
              {
                internalType: 'uint256',
                name: 'l2BatchNumber',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'l2ToL1MessageNumber',
                type: 'uint256',
              },
            ],
            name: 'isWithdrawalFinalized',
            outputs: [
              { internalType: 'bool', name: 'isFinalized', type: 'bool' },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'l1AssetRouter',
            outputs: [
              {
                internalType: 'contract IL1AssetRouter',
                name: '',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'l1NativeTokenVault',
            outputs: [
              {
                internalType: 'contract IL1NativeTokenVault',
                name: '',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: '_chainId', type: 'uint256' },
            ],
            name: 'l2BridgeAddress',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'legacyBridge',
            outputs: [
              {
                internalType: 'contract IL1ERC20Bridge',
                name: '',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: '_chainId', type: 'uint256' },
              { internalType: 'address', name: '_token', type: 'address' },
            ],
            name: 'nullifyChainBalanceByNTV',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [],
            name: 'owner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'pause',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [],
            name: 'paused',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'pendingOwner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'renounceOwnership',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '_l1AssetRouter',
                type: 'address',
              },
            ],
            name: 'setL1AssetRouter',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'contract IL1ERC20Bridge',
                name: '_legacyBridge',
                type: 'address',
              },
            ],
            name: 'setL1Erc20Bridge',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'contract IL1NativeTokenVault',
                name: '_l1NativeTokenVault',
                type: 'address',
              },
            ],
            name: 'setL1NativeTokenVault',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'address', name: 'newOwner', type: 'address' },
            ],
            name: 'transferOwnership',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'address', name: '_token', type: 'address' },
            ],
            name: 'transferTokenToNTV',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [],
            name: 'unpause',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        data: event.transaction.input,
      })
      if (functionName == 'finalizeWithdrawal') {
        // get _message param and compute the key
        const expectedKey = keccak256(args![4])
        await context.db.sql
          .update(bridgeTransaction)
          .set({
            nativeBridgeFinalizedTxHash: event.transaction.hash,
            nativeBridgeStatus: 'FINALIZED',
          })
          .where(and(eq(bridgeTransaction.zksyncWithdrawalHash, expectedKey)))
      }
    }
  }
}
