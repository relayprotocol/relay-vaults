// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const IL1SharedBridge = [
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
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'l1Token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalFinalizedSharedBridge',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
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
        internalType: 'bytes',
        name: '_message',
        type: 'bytes',
      },
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
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
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
    ],
    name: 'isWithdrawalFinalized',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
