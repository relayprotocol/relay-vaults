// ABOUTME: ABI JSON converted to TypeScript format
// ABOUTME: Contains smart contract interface definitions and function signatures
export const RollupSepolia = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'anyTrustFastConfirmer',
        type: 'address',
      },
    ],
    name: 'AnyTrustFastConfirmerSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'sendRoot',
        type: 'bytes32',
      },
    ],
    name: 'AssertionConfirmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'parentAssertionHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'prevPrevAssertionHash',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'sequencerBatchAcc',
                type: 'bytes32',
              },
              {
                components: [
                  {
                    internalType: 'bytes32',
                    name: 'wasmModuleRoot',
                    type: 'bytes32',
                  },
                  {
                    internalType: 'uint256',
                    name: 'requiredStake',
                    type: 'uint256',
                  },
                  {
                    internalType: 'address',
                    name: 'challengeManager',
                    type: 'address',
                  },
                  {
                    internalType: 'uint64',
                    name: 'confirmPeriodBlocks',
                    type: 'uint64',
                  },
                  {
                    internalType: 'uint64',
                    name: 'nextInboxPosition',
                    type: 'uint64',
                  },
                ],
                internalType: 'struct ConfigData',
                name: 'configData',
                type: 'tuple',
              },
            ],
            internalType: 'struct BeforeStateData',
            name: 'beforeStateData',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'bytes32[2]',
                    name: 'bytes32Vals',
                    type: 'bytes32[2]',
                  },
                  {
                    internalType: 'uint64[2]',
                    name: 'u64Vals',
                    type: 'uint64[2]',
                  },
                ],
                internalType: 'struct GlobalState',
                name: 'globalState',
                type: 'tuple',
              },
              {
                internalType: 'enum MachineStatus',
                name: 'machineStatus',
                type: 'uint8',
              },
              {
                internalType: 'bytes32',
                name: 'endHistoryRoot',
                type: 'bytes32',
              },
            ],
            internalType: 'struct AssertionState',
            name: 'beforeState',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'bytes32[2]',
                    name: 'bytes32Vals',
                    type: 'bytes32[2]',
                  },
                  {
                    internalType: 'uint64[2]',
                    name: 'u64Vals',
                    type: 'uint64[2]',
                  },
                ],
                internalType: 'struct GlobalState',
                name: 'globalState',
                type: 'tuple',
              },
              {
                internalType: 'enum MachineStatus',
                name: 'machineStatus',
                type: 'uint8',
              },
              {
                internalType: 'bytes32',
                name: 'endHistoryRoot',
                type: 'bytes32',
              },
            ],
            internalType: 'struct AssertionState',
            name: 'afterState',
            type: 'tuple',
          },
        ],
        indexed: false,
        internalType: 'struct AssertionInputs',
        name: 'assertion',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'afterInboxBatchAcc',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'inboxMaxCount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'wasmModuleRoot',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'requiredStake',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'challengeManager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'confirmPeriodBlocks',
        type: 'uint64',
      },
    ],
    name: 'AssertionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
    ],
    name: 'AssertionForceConfirmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
    ],
    name: 'AssertionForceCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newBaseStake',
        type: 'uint256',
      },
    ],
    name: 'BaseStakeSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'challengeManager',
        type: 'address',
      },
    ],
    name: 'ChallengeManagerSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'newConfirmPeriod',
        type: 'uint64',
      },
    ],
    name: 'ConfirmPeriodBlocksSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'inbox',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'enabled',
        type: 'bool',
      },
    ],
    name: 'DelayedInboxSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'inbox',
        type: 'address',
      },
    ],
    name: 'InboxSet',
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
        indexed: false,
        internalType: 'address',
        name: 'newLoserStakerEscrow',
        type: 'address',
      },
    ],
    name: 'LoserStakeEscrowSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newPeriod',
        type: 'uint256',
      },
    ],
    name: 'MinimumAssertionPeriodSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'outbox',
        type: 'address',
      },
    ],
    name: 'OldOutboxRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'outbox',
        type: 'address',
      },
    ],
    name: 'OutboxSet',
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
        internalType: 'uint64',
        name: 'challengeIndex',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'asserter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'challenger',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'challengedAssertion',
        type: 'uint64',
      },
    ],
    name: 'RollupChallengeStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'machineHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
    ],
    name: 'RollupInitialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newSequencerInbox',
        type: 'address',
      },
    ],
    name: 'SequencerInboxSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'staker',
        type: 'address[]',
      },
    ],
    name: 'StakersForceRefunded',
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
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'UpgradedSecondary',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'withdrawalAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'initialBalance',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'finalBalance',
        type: 'uint256',
      },
    ],
    name: 'UserStakeUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'initialBalance',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'finalBalance',
        type: 'uint256',
      },
    ],
    name: 'UserWithdrawableFundsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newPeriod',
        type: 'uint256',
      },
    ],
    name: 'ValidatorAfkBlocksSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: '_validatorWhitelistDisabled',
        type: 'bool',
      },
    ],
    name: 'ValidatorWhitelistDisabledSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'validators',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'bool[]',
        name: 'enabled',
        type: 'bool[]',
      },
    ],
    name: 'ValidatorsSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'newWasmModuleRoot',
        type: 'bytes32',
      },
    ],
    name: 'WasmModuleRootSet',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: '_stakerMap',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountStaked',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'latestStakedAssertion',
        type: 'bytes32',
      },
      {
        internalType: 'uint64',
        name: 'index',
        type: 'uint64',
      },
      {
        internalType: 'bool',
        name: 'isStaked',
        type: 'bool',
      },
      {
        internalType: 'address',
        name: 'withdrawalAddress',
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
        name: 'staker',
        type: 'address',
      },
    ],
    name: 'amountStaked',
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
    name: 'anyTrustFastConfirmer',
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
    name: 'baseStake',
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
    inputs: [],
    name: 'chainId',
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
    name: 'challengeGracePeriodBlocks',
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
    inputs: [],
    name: 'challengeManager',
    outputs: [
      {
        internalType: 'contract IEdgeChallengeManager',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'confirmPeriodBlocks',
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
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'parentAssertionHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'bytes32[2]',
                name: 'bytes32Vals',
                type: 'bytes32[2]',
              },
              {
                internalType: 'uint64[2]',
                name: 'u64Vals',
                type: 'uint64[2]',
              },
            ],
            internalType: 'struct GlobalState',
            name: 'globalState',
            type: 'tuple',
          },
          {
            internalType: 'enum MachineStatus',
            name: 'machineStatus',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'endHistoryRoot',
            type: 'bytes32',
          },
        ],
        internalType: 'struct AssertionState',
        name: 'confirmState',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'inboxAcc',
        type: 'bytes32',
      },
    ],
    name: 'forceConfirmAssertion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'prevAssertionHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'prevPrevAssertionHash',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'sequencerBatchAcc',
                type: 'bytes32',
              },
              {
                components: [
                  {
                    internalType: 'bytes32',
                    name: 'wasmModuleRoot',
                    type: 'bytes32',
                  },
                  {
                    internalType: 'uint256',
                    name: 'requiredStake',
                    type: 'uint256',
                  },
                  {
                    internalType: 'address',
                    name: 'challengeManager',
                    type: 'address',
                  },
                  {
                    internalType: 'uint64',
                    name: 'confirmPeriodBlocks',
                    type: 'uint64',
                  },
                  {
                    internalType: 'uint64',
                    name: 'nextInboxPosition',
                    type: 'uint64',
                  },
                ],
                internalType: 'struct ConfigData',
                name: 'configData',
                type: 'tuple',
              },
            ],
            internalType: 'struct BeforeStateData',
            name: 'beforeStateData',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'bytes32[2]',
                    name: 'bytes32Vals',
                    type: 'bytes32[2]',
                  },
                  {
                    internalType: 'uint64[2]',
                    name: 'u64Vals',
                    type: 'uint64[2]',
                  },
                ],
                internalType: 'struct GlobalState',
                name: 'globalState',
                type: 'tuple',
              },
              {
                internalType: 'enum MachineStatus',
                name: 'machineStatus',
                type: 'uint8',
              },
              {
                internalType: 'bytes32',
                name: 'endHistoryRoot',
                type: 'bytes32',
              },
            ],
            internalType: 'struct AssertionState',
            name: 'beforeState',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'bytes32[2]',
                    name: 'bytes32Vals',
                    type: 'bytes32[2]',
                  },
                  {
                    internalType: 'uint64[2]',
                    name: 'u64Vals',
                    type: 'uint64[2]',
                  },
                ],
                internalType: 'struct GlobalState',
                name: 'globalState',
                type: 'tuple',
              },
              {
                internalType: 'enum MachineStatus',
                name: 'machineStatus',
                type: 'uint8',
              },
              {
                internalType: 'bytes32',
                name: 'endHistoryRoot',
                type: 'bytes32',
              },
            ],
            internalType: 'struct AssertionState',
            name: 'afterState',
            type: 'tuple',
          },
        ],
        internalType: 'struct AssertionInputs',
        name: 'assertion',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'expectedAssertionHash',
        type: 'bytes32',
      },
    ],
    name: 'forceCreateAssertion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'staker',
        type: 'address[]',
      },
    ],
    name: 'forceRefundStaker',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'genesisAssertionHash',
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
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
    ],
    name: 'getAssertion',
    outputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'firstChildBlock',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'secondChildBlock',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'createdAtBlock',
            type: 'uint64',
          },
          {
            internalType: 'bool',
            name: 'isFirstChild',
            type: 'bool',
          },
          {
            internalType: 'enum AssertionStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'configHash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct AssertionNode',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
    ],
    name: 'getAssertionCreationBlockForLogLookup',
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
        name: 'assertionHash',
        type: 'bytes32',
      },
    ],
    name: 'getFirstChildCreationBlock',
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
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
    ],
    name: 'getSecondChildCreationBlock',
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
        name: 'staker',
        type: 'address',
      },
    ],
    name: 'getStaker',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'amountStaked',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'latestStakedAssertion',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'index',
            type: 'uint64',
          },
          {
            internalType: 'bool',
            name: 'isStaked',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'withdrawalAddress',
            type: 'address',
          },
        ],
        internalType: 'struct IRollupCore.Staker',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'stakerNum',
        type: 'uint64',
      },
    ],
    name: 'getStakerAddress',
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
    name: 'getValidators',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'inbox',
    outputs: [
      {
        internalType: 'contract IInboxBase',
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
            internalType: 'uint64',
            name: 'confirmPeriodBlocks',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'stakeToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'baseStake',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'wasmModuleRoot',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'loserStakeEscrow',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'chainId',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'chainConfig',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'minimumAssertionPeriod',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'validatorAfkBlocks',
            type: 'uint64',
          },
          {
            internalType: 'uint256[]',
            name: 'miniStakeValues',
            type: 'uint256[]',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'delayBlocks',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'futureBlocks',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'delaySeconds',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'futureSeconds',
                type: 'uint256',
              },
            ],
            internalType: 'struct ISequencerInbox.MaxTimeVariation',
            name: 'sequencerInboxMaxTimeVariation',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'layerZeroBlockEdgeHeight',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'layerZeroBigStepEdgeHeight',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'layerZeroSmallStepEdgeHeight',
            type: 'uint256',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'bytes32[2]',
                    name: 'bytes32Vals',
                    type: 'bytes32[2]',
                  },
                  {
                    internalType: 'uint64[2]',
                    name: 'u64Vals',
                    type: 'uint64[2]',
                  },
                ],
                internalType: 'struct GlobalState',
                name: 'globalState',
                type: 'tuple',
              },
              {
                internalType: 'enum MachineStatus',
                name: 'machineStatus',
                type: 'uint8',
              },
              {
                internalType: 'bytes32',
                name: 'endHistoryRoot',
                type: 'bytes32',
              },
            ],
            internalType: 'struct AssertionState',
            name: 'genesisAssertionState',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'genesisInboxCount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'anyTrustFastConfirmer',
            type: 'address',
          },
          {
            internalType: 'uint8',
            name: 'numBigStepLevel',
            type: 'uint8',
          },
          {
            internalType: 'uint64',
            name: 'challengeGracePeriodBlocks',
            type: 'uint64',
          },
          {
            components: [
              {
                internalType: 'uint64',
                name: 'threshold',
                type: 'uint64',
              },
              {
                internalType: 'uint64',
                name: 'max',
                type: 'uint64',
              },
              {
                internalType: 'uint64',
                name: 'replenishRateInBasis',
                type: 'uint64',
              },
            ],
            internalType: 'struct BufferConfig',
            name: 'bufferConfig',
            type: 'tuple',
          },
        ],
        internalType: 'struct Config',
        name: 'config',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'contract IBridge',
            name: 'bridge',
            type: 'address',
          },
          {
            internalType: 'contract ISequencerInbox',
            name: 'sequencerInbox',
            type: 'address',
          },
          {
            internalType: 'contract IInboxBase',
            name: 'inbox',
            type: 'address',
          },
          {
            internalType: 'contract IOutbox',
            name: 'outbox',
            type: 'address',
          },
          {
            internalType: 'contract IRollupEventInbox',
            name: 'rollupEventInbox',
            type: 'address',
          },
          {
            internalType: 'contract IEdgeChallengeManager',
            name: 'challengeManager',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'rollupAdminLogic',
            type: 'address',
          },
          {
            internalType: 'contract IRollupUser',
            name: 'rollupUserLogic',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'validatorWalletCreator',
            type: 'address',
          },
        ],
        internalType: 'struct ContractDependencies',
        name: 'connectedContracts',
        type: 'tuple',
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
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
    ],
    name: 'isFirstChild',
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
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
    ],
    name: 'isPending',
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
        name: 'staker',
        type: 'address',
      },
    ],
    name: 'isStaked',
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
        name: 'validator',
        type: 'address',
      },
    ],
    name: 'isValidator',
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
    name: 'latestConfirmed',
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
        internalType: 'address',
        name: 'staker',
        type: 'address',
      },
    ],
    name: 'latestStakedAssertion',
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
    name: 'loserStakeEscrow',
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
    name: 'minimumAssertionPeriod',
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
    name: 'outbox',
    outputs: [
      {
        internalType: 'contract IOutbox',
        name: '',
        type: 'address',
      },
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
    name: 'proxiableUUID',
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
        internalType: 'address',
        name: '_outbox',
        type: 'address',
      },
    ],
    name: 'removeOldOutbox',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resume',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rollupDeploymentBlock',
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
    name: 'rollupEventInbox',
    outputs: [
      {
        internalType: 'contract IRollupEventInbox',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sequencerInbox',
    outputs: [
      {
        internalType: 'contract ISequencerInbox',
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
        name: '_anyTrustFastConfirmer',
        type: 'address',
      },
    ],
    name: 'setAnyTrustFastConfirmer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newBaseStake',
        type: 'uint256',
      },
    ],
    name: 'setBaseStake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_challengeManager',
        type: 'address',
      },
    ],
    name: 'setChallengeManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'newConfirmPeriod',
        type: 'uint64',
      },
    ],
    name: 'setConfirmPeriodBlocks',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_inbox',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_enabled',
        type: 'bool',
      },
    ],
    name: 'setDelayedInbox',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IInboxBase',
        name: 'newInbox',
        type: 'address',
      },
    ],
    name: 'setInbox',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newLoserStakerEscrow',
        type: 'address',
      },
    ],
    name: 'setLoserStakeEscrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newPeriod',
        type: 'uint256',
      },
    ],
    name: 'setMinimumAssertionPeriod',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IOutbox',
        name: '_outbox',
        type: 'address',
      },
    ],
    name: 'setOutbox',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'setOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sequencerInbox',
        type: 'address',
      },
    ],
    name: 'setSequencerInbox',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_validator',
        type: 'address[]',
      },
      {
        internalType: 'bool[]',
        name: '_val',
        type: 'bool[]',
      },
    ],
    name: 'setValidator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'newAfkBlocks',
        type: 'uint64',
      },
    ],
    name: 'setValidatorAfkBlocks',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_validatorWhitelistDisabled',
        type: 'bool',
      },
    ],
    name: 'setValidatorWhitelistDisabled',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'newWasmModuleRoot',
        type: 'bytes32',
      },
    ],
    name: 'setWasmModuleRoot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stakeToken',
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
    name: 'stakerCount',
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
    inputs: [],
    name: 'totalWithdrawableFunds',
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
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeSecondaryTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeSecondaryToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'bytes32[2]',
                name: 'bytes32Vals',
                type: 'bytes32[2]',
              },
              {
                internalType: 'uint64[2]',
                name: 'u64Vals',
                type: 'uint64[2]',
              },
            ],
            internalType: 'struct GlobalState',
            name: 'globalState',
            type: 'tuple',
          },
          {
            internalType: 'enum MachineStatus',
            name: 'machineStatus',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'endHistoryRoot',
            type: 'bytes32',
          },
        ],
        internalType: 'struct AssertionState',
        name: 'state',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'prevAssertionHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'inboxAcc',
        type: 'bytes32',
      },
    ],
    name: 'validateAssertionHash',
    outputs: [],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'assertionHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'wasmModuleRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'requiredStake',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'challengeManager',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'confirmPeriodBlocks',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'nextInboxPosition',
            type: 'uint64',
          },
        ],
        internalType: 'struct ConfigData',
        name: 'configData',
        type: 'tuple',
      },
    ],
    name: 'validateConfig',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'validatorAfkBlocks',
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
    inputs: [],
    name: 'validatorWalletCreator',
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
    name: 'validatorWhitelistDisabled',
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
    name: 'wasmModuleRoot',
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
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'withdrawableFunds',
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
        internalType: 'address',
        name: 'staker',
        type: 'address',
      },
    ],
    name: 'withdrawalAddress',
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
] as const
