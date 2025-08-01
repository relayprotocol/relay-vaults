// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const Mailbox = [
  {
    inputs: [{ internalType: 'uint32', name: '_localDomain', type: 'uint32' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'hook',
        type: 'address',
      },
    ],
    name: 'DefaultHookSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'DefaultIsmSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint32',
        name: 'destination',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'recipient',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'message',
        type: 'bytes',
      },
    ],
    name: 'Dispatch',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32',
      },
    ],
    name: 'DispatchId',
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
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'origin',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'sender',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'Process',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32',
      },
    ],
    name: 'ProcessId',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'hook',
        type: 'address',
      },
    ],
    name: 'RequiredHookSet',
    type: 'event',
  },
  {
    inputs: [],
    name: 'VERSION',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultHook',
    outputs: [
      {
        internalType: 'contract IPostDispatchHook',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultIsm',
    outputs: [
      {
        internalType: 'contract IInterchainSecurityModule',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
    name: 'delivered',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deployedBlock',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'destinationDomain',
        type: 'uint32',
      },
      {
        internalType: 'bytes32',
        name: 'recipientAddress',
        type: 'bytes32',
      },
      { internalType: 'bytes', name: 'messageBody', type: 'bytes' },
      { internalType: 'bytes', name: 'metadata', type: 'bytes' },
      {
        internalType: 'contract IPostDispatchHook',
        name: 'hook',
        type: 'address',
      },
    ],
    name: 'dispatch',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'destinationDomain',
        type: 'uint32',
      },
      {
        internalType: 'bytes32',
        name: 'recipientAddress',
        type: 'bytes32',
      },
      { internalType: 'bytes', name: 'messageBody', type: 'bytes' },
      { internalType: 'bytes', name: 'hookMetadata', type: 'bytes' },
    ],
    name: 'dispatch',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: '_destinationDomain',
        type: 'uint32',
      },
      {
        internalType: 'bytes32',
        name: '_recipientAddress',
        type: 'bytes32',
      },
      { internalType: 'bytes', name: '_messageBody', type: 'bytes' },
    ],
    name: 'dispatch',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_owner', type: 'address' },
      { internalType: 'address', name: '_defaultIsm', type: 'address' },
      { internalType: 'address', name: '_defaultHook', type: 'address' },
      { internalType: 'address', name: '_requiredHook', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestDispatchedId',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'localDomain',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nonce',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
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
    inputs: [
      { internalType: 'bytes', name: '_metadata', type: 'bytes' },
      { internalType: 'bytes', name: '_message', type: 'bytes' },
    ],
    name: 'process',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
    name: 'processedAt',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
    name: 'processor',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'destinationDomain',
        type: 'uint32',
      },
      {
        internalType: 'bytes32',
        name: 'recipientAddress',
        type: 'bytes32',
      },
      { internalType: 'bytes', name: 'messageBody', type: 'bytes' },
      { internalType: 'bytes', name: 'metadata', type: 'bytes' },
      {
        internalType: 'contract IPostDispatchHook',
        name: 'hook',
        type: 'address',
      },
    ],
    name: 'quoteDispatch',
    outputs: [{ internalType: 'uint256', name: 'fee', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'destinationDomain',
        type: 'uint32',
      },
      {
        internalType: 'bytes32',
        name: 'recipientAddress',
        type: 'bytes32',
      },
      { internalType: 'bytes', name: 'messageBody', type: 'bytes' },
    ],
    name: 'quoteDispatch',
    outputs: [{ internalType: 'uint256', name: 'fee', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'destinationDomain',
        type: 'uint32',
      },
      {
        internalType: 'bytes32',
        name: 'recipientAddress',
        type: 'bytes32',
      },
      { internalType: 'bytes', name: 'messageBody', type: 'bytes' },
      {
        internalType: 'bytes',
        name: 'defaultHookMetadata',
        type: 'bytes',
      },
    ],
    name: 'quoteDispatch',
    outputs: [{ internalType: 'uint256', name: 'fee', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_recipient', type: 'address' }],
    name: 'recipientIsm',
    outputs: [
      {
        internalType: 'contract IInterchainSecurityModule',
        name: '',
        type: 'address',
      },
    ],
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
    inputs: [],
    name: 'requiredHook',
    outputs: [
      {
        internalType: 'contract IPostDispatchHook',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_hook', type: 'address' }],
    name: 'setDefaultHook',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_module', type: 'address' }],
    name: 'setDefaultIsm',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_hook', type: 'address' }],
    name: 'setRequiredHook',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
