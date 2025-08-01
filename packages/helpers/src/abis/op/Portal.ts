// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const Portal = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
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
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'version',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'opaqueData',
        type: 'bytes',
      },
    ],
    name: 'TransactionDeposited',
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'withdrawalHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'success',
        type: 'bool',
      },
    ],
    name: 'WithdrawalFinalized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'withdrawalHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'WithdrawalProven',
    type: 'event',
  },
  {
    inputs: [],
    name: 'GUARDIAN',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'L2_ORACLE',
    outputs: [
      {
        internalType: 'contract L2OutputOracle',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SYSTEM_CONFIG',
    outputs: [
      { internalType: 'contract SystemConfig', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_value', type: 'uint256' },
      { internalType: 'uint64', name: '_gasLimit', type: 'uint64' },
      { internalType: 'bool', name: '_isCreation', type: 'bool' },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
    ],
    name: 'depositTransaction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'donateETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'uint256', name: 'gasLimit', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct Types.WithdrawalTransaction',
        name: '_tx',
        type: 'tuple',
      },
    ],
    name: 'finalizeWithdrawalTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'finalizedWithdrawals',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'guardian',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract L2OutputOracle',
        name: '_l2Oracle',
        type: 'address',
      },
      { internalType: 'address', name: '_guardian', type: 'address' },
      {
        internalType: 'contract SystemConfig',
        name: '_systemConfig',
        type: 'address',
      },
      { internalType: 'bool', name: '_paused', type: 'bool' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_l2OutputIndex', type: 'uint256' },
    ],
    name: 'isOutputFinalized',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2Oracle',
    outputs: [
      {
        internalType: 'contract L2OutputOracle',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2Sender',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint64', name: '_byteCount', type: 'uint64' }],
    name: 'minimumGasLimit',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'params',
    outputs: [
      { internalType: 'uint128', name: 'prevBaseFee', type: 'uint128' },
      { internalType: 'uint64', name: 'prevBoughtGas', type: 'uint64' },
      { internalType: 'uint64', name: 'prevBlockNum', type: 'uint64' },
    ],
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
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'uint256', name: 'gasLimit', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct Types.WithdrawalTransaction',
        name: '_tx',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: '_l2OutputIndex',
        type: 'uint256',
      },
      {
        components: [
          { internalType: 'bytes32', name: 'version', type: 'bytes32' },
          { internalType: 'bytes32', name: 'stateRoot', type: 'bytes32' },
          {
            internalType: 'bytes32',
            name: 'messagePasserStorageRoot',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'latestBlockhash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct Types.OutputRootProof',
        name: '_outputRootProof',
        type: 'tuple',
      },
      {
        internalType: 'bytes[]',
        name: '_withdrawalProof',
        type: 'bytes[]',
      },
    ],
    name: 'proveWithdrawalTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'provenWithdrawals',
    outputs: [
      { internalType: 'bytes32', name: 'outputRoot', type: 'bytes32' },
      { internalType: 'uint128', name: 'timestamp', type: 'uint128' },
      { internalType: 'uint128', name: 'l2OutputIndex', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'systemConfig',
    outputs: [
      { internalType: 'contract SystemConfig', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const
