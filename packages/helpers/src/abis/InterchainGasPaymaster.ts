// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const InterchainGasPaymaster = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
    ],
    name: 'BeneficiarySet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint32',
        name: 'remoteDomain',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'gasOracle',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint96',
        name: 'gasOverhead',
        type: 'uint96',
      },
    ],
    name: 'DestinationGasConfigSet',
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
      {
        indexed: true,
        internalType: 'uint32',
        name: 'destinationDomain',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'gasAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'payment',
        type: 'uint256',
      },
    ],
    name: 'GasPayment',
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
    inputs: [],
    name: 'beneficiary',
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
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deployedBlock',
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
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    name: 'destinationGasConfigs',
    outputs: [
      {
        internalType: 'contract IGasOracle',
        name: 'gasOracle',
        type: 'address',
      },
      {
        internalType: 'uint96',
        name: 'gasOverhead',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
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
        internalType: 'uint256',
        name: '_gasLimit',
        type: 'uint256',
      },
    ],
    name: 'destinationGasLimit',
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
        internalType: 'uint32',
        name: '_destinationDomain',
        type: 'uint32',
      },
    ],
    name: 'getExchangeRateAndGasPrice',
    outputs: [
      {
        internalType: 'uint128',
        name: 'tokenExchangeRate',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'gasPrice',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hookType',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_beneficiary',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
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
        name: '_messageId',
        type: 'bytes32',
      },
      {
        internalType: 'uint32',
        name: '_destinationDomain',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_gasLimit',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_refundAddress',
        type: 'address',
      },
    ],
    name: 'payForGas',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'message',
        type: 'bytes',
      },
    ],
    name: 'postDispatch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'message',
        type: 'bytes',
      },
    ],
    name: 'quoteDispatch',
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
        internalType: 'uint32',
        name: '_destinationDomain',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: '_gasLimit',
        type: 'uint256',
      },
    ],
    name: 'quoteGasPayment',
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
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_beneficiary',
        type: 'address',
      },
    ],
    name: 'setBeneficiary',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'remoteDomain',
            type: 'uint32',
          },
          {
            components: [
              {
                internalType: 'contract IGasOracle',
                name: 'gasOracle',
                type: 'address',
              },
              {
                internalType: 'uint96',
                name: 'gasOverhead',
                type: 'uint96',
              },
            ],
            internalType: 'struct InterchainGasPaymaster.DomainGasConfig',
            name: 'config',
            type: 'tuple',
          },
        ],
        internalType: 'struct InterchainGasPaymaster.GasParam[]',
        name: '_configs',
        type: 'tuple[]',
      },
    ],
    name: 'setDestinationGasConfigs',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
    ],
    name: 'supportsMetadata',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
