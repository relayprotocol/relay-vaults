// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const Outbox = [
  {
    inputs: [],
    name: 'AlreadyInit',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'AlreadySpent',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BridgeCallFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'HadZeroInit',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'actualLength',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxProofLength',
        type: 'uint256',
      },
    ],
    name: 'MerkleProofTooLong',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'rollup',
        type: 'address',
      },
    ],
    name: 'NotRollup',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxIndex',
        type: 'uint256',
      },
    ],
    name: 'PathNotMinimal',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'proofLength',
        type: 'uint256',
      },
    ],
    name: 'ProofTooLong',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SimulationOnlyEntrypoint',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
    ],
    name: 'UnknownRoot',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'l2Sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'zero',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'transactionIndex',
        type: 'uint256',
      },
    ],
    name: 'OutBoxTransactionExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'outputRoot',
        type: 'bytes32',
      },
    ],
    name: 'SendRootUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'OUTBOX_VERSION',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bridge',
    outputs: [
      {
        internalType: 'contract IBridge',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'l2Sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'l2Block',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'l1Block',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'l2Timestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'calculateItemHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint256',
        name: 'path',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'item',
        type: 'bytes32',
      },
    ],
    name: 'calculateMerkleRoot',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'l2Sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'l2Block',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'l1Block',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'l2Timestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'executeTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'l2Sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'l2Block',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'l1Block',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'l2Timestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'executeTransactionSimulation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IBridge',
        name: '_bridge',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'isSpent',
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
  {
    inputs: [],
    name: 'l2ToL1BatchNum',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2ToL1Block',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2ToL1EthBlock',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2ToL1OutputId',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2ToL1Sender',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2ToL1Timestamp',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rollup',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'roots',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'spent',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'l2BlockHash',
        type: 'bytes32',
      },
    ],
    name: 'updateSendRoot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
