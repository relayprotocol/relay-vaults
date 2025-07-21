// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const L1NativeTokenVault = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_l1WethAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_l1AssetRouter',
        type: 'address',
      },
      {
        internalType: 'contract IL1Nullifier',
        name: '_l1Nullifier',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { internalType: 'address', name: 'expected', type: 'address' },
      { internalType: 'address', name: 'supplied', type: 'address' },
    ],
    name: 'AddressMismatch',
    type: 'error',
  },
  { inputs: [], name: 'AmountMustBeGreaterThanZero', type: 'error' },
  { inputs: [], name: 'AssetIdAlreadyRegistered', type: 'error' },
  {
    inputs: [
      { internalType: 'bytes32', name: 'expected', type: 'bytes32' },
      { internalType: 'bytes32', name: 'supplied', type: 'bytes32' },
    ],
    name: 'AssetIdMismatch',
    type: 'error',
  },
  { inputs: [], name: 'BurningNativeWETHNotSupported', type: 'error' },
  { inputs: [], name: 'ClaimFailedDepositFailed', type: 'error' },
  {
    inputs: [],
    name: 'DeployingBridgedTokenForNativeToken',
    type: 'error',
  },
  { inputs: [], name: 'EmptyDeposit', type: 'error' },
  { inputs: [], name: 'EmptyToken', type: 'error' },
  { inputs: [], name: 'InsufficientChainBalance', type: 'error' },
  { inputs: [], name: 'InvalidNTVBurnData', type: 'error' },
  { inputs: [], name: 'NoFundsTransferred', type: 'error' },
  { inputs: [], name: 'NonEmptyMsgValue', type: 'error' },
  { inputs: [], name: 'OriginChainIdNotFound', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'TokenNotSupported',
    type: 'error',
  },
  { inputs: [], name: 'TokensWithFeesNotSupported', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'caller', type: 'address' }],
    name: 'Unauthorized',
    type: 'error',
  },
  { inputs: [], name: 'UnsupportedEncodingVersion', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'expected', type: 'uint256' },
      { internalType: 'uint256', name: 'actual', type: 'uint256' },
    ],
    name: 'ValueMismatch',
    type: 'error',
  },
  { inputs: [], name: 'WithdrawFailed', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'balance', type: 'uint256' },
      {
        internalType: 'uint256',
        name: 'nullifierChainBalance',
        type: 'uint256',
      },
    ],
    name: 'WrongAmountTransferred',
    type: 'error',
  },
  { inputs: [], name: 'WrongCounterpart', type: 'error' },
  { inputs: [], name: 'ZeroAddress', type: 'error' },
  { inputs: [], name: 'ZeroAmountToTransfer', type: 'error' },
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
        name: 'assetId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'BridgeBurn',
    type: 'event',
  },
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
        name: 'assetId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'BridgeMint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'bridgedTokenBeacon',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'bridgedTokenProxyBytecodeHash',
        type: 'bytes32',
      },
    ],
    name: 'BridgedTokenBeaconUpdated',
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
        indexed: true,
        internalType: 'address',
        name: 'l2TokenBeacon',
        type: 'address',
      },
    ],
    name: 'TokenBeaconUpdated',
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
    name: 'ASSET_ROUTER',
    outputs: [
      {
        internalType: 'contract IAssetRouterBase',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'BASE_TOKEN_ASSET_ID',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'L1_CHAIN_ID',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'L1_NULLIFIER',
    outputs: [
      { internalType: 'contract IL1Nullifier', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WETH_TOKEN',
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
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
    ],
    name: 'assetId',
    outputs: [{ internalType: 'bytes32', name: 'assetId', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_chainId', type: 'uint256' },
      { internalType: 'uint256', name: '_l2MsgValue', type: 'uint256' },
      { internalType: 'bytes32', name: '_assetId', type: 'bytes32' },
      {
        internalType: 'address',
        name: '_originalCaller',
        type: 'address',
      },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
    ],
    name: 'bridgeBurn',
    outputs: [
      { internalType: 'bytes', name: '_bridgeMintData', type: 'bytes' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'address', name: '', type: 'address' },
      {
        internalType: 'address',
        name: '_assetHandlerAddressOnCounterpart',
        type: 'address',
      },
    ],
    name: 'bridgeCheckCounterpartAddress',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_chainId', type: 'uint256' },
      { internalType: 'bytes32', name: '_assetId', type: 'bytes32' },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
    ],
    name: 'bridgeMint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_chainId', type: 'uint256' },
      { internalType: 'bytes32', name: '_assetId', type: 'bytes32' },
      {
        internalType: 'address',
        name: '_depositSender',
        type: 'address',
      },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
    ],
    name: 'bridgeRecoverFailedTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bridgedTokenBeacon',
    outputs: [{ internalType: 'contract IBeacon', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_originChainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_nonNativeToken',
        type: 'address',
      },
    ],
    name: 'calculateCreate2TokenAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'chainId', type: 'uint256' },
      { internalType: 'bytes32', name: 'assetId', type: 'bytes32' },
    ],
    name: 'chainBalance',
    outputs: [{ internalType: 'uint256', name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_nativeToken', type: 'address' },
    ],
    name: 'ensureTokenIsRegistered',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_originChainId', type: 'uint256' },
    ],
    name: 'getERC20Getters',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_owner', type: 'address' },
      {
        internalType: 'address',
        name: '_bridgedTokenBeacon',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'assetId', type: 'bytes32' }],
    name: 'originChainId',
    outputs: [
      { internalType: 'uint256', name: 'originChainId', type: 'uint256' },
    ],
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
    name: 'registerEthToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_nativeToken', type: 'address' },
    ],
    name: 'registerToken',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [{ internalType: 'bytes32', name: 'assetId', type: 'bytes32' }],
    name: 'tokenAddress',
    outputs: [
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_erc20Data', type: 'bytes' }],
    name: 'tokenDataOriginChainId',
    outputs: [
      {
        internalType: 'uint256',
        name: 'tokenOriginChainId',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
    name: 'transferFundsFromSharedBridge',
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
  {
    inputs: [
      { internalType: 'bytes', name: '_burnData', type: 'bytes' },
      {
        internalType: 'bytes32',
        name: '_expectedAssetId',
        type: 'bytes32',
      },
    ],
    name: 'tryRegisterTokenFromBurnData',
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
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_targetChainId', type: 'uint256' },
    ],
    name: 'updateChainBalancesFromSharedBridge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const
