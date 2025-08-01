// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const Portal2 = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_proofMaturityDelaySeconds',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_disputeGameFinalityDelaySeconds',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
  {
    inputs: [],
    name: 'balance',
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
    inputs: [
      {
        internalType: 'contract IDisputeGame',
        name: '_disputeGame',
        type: 'address',
      },
    ],
    name: 'blacklistDisputeGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_withdrawalHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_proofSubmitter',
        type: 'address',
      },
    ],
    name: 'checkWithdrawal',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_mint',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: '_gasLimit',
        type: 'uint64',
      },
      {
        internalType: 'bool',
        name: '_isCreation',
        type: 'bool',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'depositERC20Transaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: '_gasLimit',
        type: 'uint64',
      },
      {
        internalType: 'bool',
        name: '_isCreation',
        type: 'bool',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'depositTransaction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IDisputeGame',
        name: '',
        type: 'address',
      },
    ],
    name: 'disputeGameBlacklist',
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
    name: 'disputeGameFactory',
    outputs: [
      {
        internalType: 'contract DisputeGameFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'disputeGameFinalityDelaySeconds',
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
    name: 'donateETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
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
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct Types.WithdrawalTransaction',
        name: '_tx',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: '_proofSubmitter',
        type: 'address',
      },
    ],
    name: 'finalizeWithdrawalTransactionExternalProof',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'finalizedWithdrawals',
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
    name: 'guardian',
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
        internalType: 'contract DisputeGameFactory',
        name: '_disputeGameFactory',
        type: 'address',
      },
      {
        internalType: 'contract SystemConfig',
        name: '_systemConfig',
        type: 'address',
      },
      {
        internalType: 'contract SuperchainConfig',
        name: '_superchainConfig',
        type: 'address',
      },
      {
        internalType: 'GameType',
        name: '_initialRespectedGameType',
        type: 'uint32',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2Sender',
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
        internalType: 'uint64',
        name: '_byteCount',
        type: 'uint64',
      },
    ],
    name: 'minimumGasLimit',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_withdrawalHash',
        type: 'bytes32',
      },
    ],
    name: 'numProofSubmitters',
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
    name: 'params',
    outputs: [
      {
        internalType: 'uint128',
        name: 'prevBaseFee',
        type: 'uint128',
      },
      {
        internalType: 'uint64',
        name: 'prevBoughtGas',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'prevBlockNum',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
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
    name: 'proofMaturityDelaySeconds',
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
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'proofSubmitters',
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
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct Types.WithdrawalTransaction',
        name: '_tx',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: '_disputeGameIndex',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'version',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'stateRoot',
            type: 'bytes32',
          },
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
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'provenWithdrawals',
    outputs: [
      {
        internalType: 'contract IDisputeGame',
        name: 'disputeGameProxy',
        type: 'address',
      },
      {
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'respectedGameType',
    outputs: [
      {
        internalType: 'GameType',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'respectedGameTypeUpdatedAt',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: '_decimals',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: '_name',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_symbol',
        type: 'bytes32',
      },
    ],
    name: 'setGasPayingToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'GameType',
        name: '_gameType',
        type: 'uint32',
      },
    ],
    name: 'setRespectedGameType',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'superchainConfig',
    outputs: [
      {
        internalType: 'contract SuperchainConfig',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'systemConfig',
    outputs: [
      {
        internalType: 'contract SystemConfig',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IDisputeGame',
        name: 'disputeGame',
        type: 'address',
      },
    ],
    name: 'DisputeGameBlacklisted',
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
        internalType: 'GameType',
        name: 'newGameType',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'Timestamp',
        name: 'updatedAt',
        type: 'uint64',
      },
    ],
    name: 'RespectedGameTypeSet',
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
        name: 'proofSubmitter',
        type: 'address',
      },
    ],
    name: 'WithdrawalProvenExtension1',
    type: 'event',
  },
  {
    inputs: [],
    name: 'AlreadyFinalized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BadTarget',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Blacklisted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CallPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ContentLengthMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyItem',
    type: 'error',
  },
  {
    inputs: [],
    name: 'GasEstimation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDataRemainder',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDisputeGame',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidGameType',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidHeader',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidMerkleProof',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidProof',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LargeCalldata',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NonReentrant',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyCustomGasToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OutOfGas',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ProposalNotValidated',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SmallGasLimit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnexpectedList',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnexpectedString',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Unproven',
    type: 'error',
  },
] as const
