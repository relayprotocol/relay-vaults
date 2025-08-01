// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const L1Messenger = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: '_bytecodeHash',
        type: 'bytes32',
      },
    ],
    name: 'BytecodeL1PublicationRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_message',
        type: 'bytes',
      },
    ],
    name: 'L1MessageSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          { internalType: 'uint8', name: 'l2ShardId', type: 'uint8' },
          { internalType: 'bool', name: 'isService', type: 'bool' },
          {
            internalType: 'uint16',
            name: 'txNumberInBlock',
            type: 'uint16',
          },
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'bytes32', name: 'key', type: 'bytes32' },
          { internalType: 'bytes32', name: 'value', type: 'bytes32' },
        ],
        indexed: false,
        internalType: 'structL2ToL1Log',
        name: '_l2log',
        type: 'tuple',
      },
    ],
    name: 'L2ToL1LogSent',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_totalL2ToL1PubdataAndStateDiffs',
        type: 'bytes',
      },
    ],
    name: 'publishPubdataAndClearState',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_bytecodeHash', type: 'bytes32' },
    ],
    name: 'requestBytecodeL1Publication',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bool', name: '_isService', type: 'bool' },
      { internalType: 'bytes32', name: '_key', type: 'bytes32' },
      { internalType: 'bytes32', name: '_value', type: 'bytes32' },
    ],
    name: 'sendL2ToL1Log',
    outputs: [
      {
        internalType: 'uint256',
        name: 'logIdInMerkleTree',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_message', type: 'bytes' }],
    name: 'sendToL1',
    outputs: [{ internalType: 'bytes32', name: 'hash', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
