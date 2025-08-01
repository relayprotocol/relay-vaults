// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const IArbSys = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'requested',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'current',
        type: 'uint256',
      },
    ],
    name: 'InvalidBlockNumber',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'destination',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'uniqueId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchNumber',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'indexInBatch',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'arbBlockNum',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ethBlockNum',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'callvalue',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'L2ToL1Transaction',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'destination',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'hash',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'position',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'arbBlockNum',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ethBlockNum',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'callvalue',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'L2ToL1Tx',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'reserved',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'position',
        type: 'uint256',
      },
    ],
    name: 'SendMerkleUpdate',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'arbBlockNum',
        type: 'uint256',
      },
    ],
    name: 'arbBlockHash',
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
    name: 'arbBlockNumber',
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
    name: 'arbChainID',
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
    name: 'arbOSVersion',
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
    name: 'getStorageGasAvailable',
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
    name: 'isTopLevelCall',
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
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'unused',
        type: 'address',
      },
    ],
    name: 'mapL1SenderContractAddressToL2Alias',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'myCallersAddressWithoutAliasing',
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
    name: 'sendMerkleTreeState',
    outputs: [
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32[]',
        name: 'partials',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'destination',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'sendTxToL1',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wasMyCallersAddressAliased',
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
    inputs: [
      {
        internalType: 'address',
        name: 'destination',
        type: 'address',
      },
    ],
    name: 'withdrawEth',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
