// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IEverclear} from "./IEverclear.sol";

interface IFeeAdapter {
  struct OrderParameters {
    uint32[] destinations;
    address receiver;
    address inputAsset;
    address outputAsset;
    uint256 amount;
    uint24 maxFee;
    uint48 ttl;
    bytes data;
  }

  struct FeeParams {
    uint256 fee;
    uint256 deadline;
    bytes sig;
  }

  /**
   * @notice Emitted when a new intent is created with fees
   * @param _intentId The ID of the created intent
   * @param _initiator The address of the user who initiated the intent
   * @param _tokenFee The amount of token fees paid
   * @param _nativeFee The amount of native token fees paid
   */
  event IntentWithFeesAdded(
    bytes32 indexed _intentId, bytes32 indexed _initiator, uint256 _tokenFee, uint256 _nativeFee
  );

  /**
   * @notice Emitted when a new order containing multiple intents is created
   * @param _orderId The unique identifier for the created order
   * @param _initiator The address of the user who initiated the order
   * @param _intentIds Array of intent IDs that make up this order
   * @param _tokenFee The amount of token fees paid for the order
   * @param _nativeFee The amount of native token fees paid for the order
   */
  event OrderCreated(
    bytes32 indexed _orderId, bytes32 indexed _initiator, bytes32[] _intentIds, uint256 _tokenFee, uint256 _nativeFee
  );

  /**
   * @notice Emitted when the fee recipient is updated
   * @param _updated The new fee recipient address
   * @param _previous The previous fee recipient address
   */
  event FeeRecipientUpdated(address indexed _updated, address indexed _previous);

  /**
   * @notice Emitted when the fee signer is updated
   * @param _updated The new fee signer address
   * @param _previous The previous fee signer address
   */
  event FeeSignerUpdated(address indexed _updated, address indexed _previous);

  /**
   * @notice Thrown when there are multiple assets included in a single order request.
   */
  error MultipleOrderAssets();

  /**
   * @notice Thrown when the signature is invalid on fees
   */
  error FeeAdapter_InvalidSignature();

  /**
   * @notice Thrown when the deadline has elapsed
   */
  error FeeAdapter_InvalidDeadline();

  /**
   * @notice Returns the spoke contract address
   * @return The EverclearSpoke contract interface
   */
  function spoke() external view returns (address);

  /**
   * @notice returns the permit2 contract
   * @return _permit2 The Permit2 singleton address
   */
  function PERMIT2() external view returns (address);

  /**
   * @notice Returns the current fee recipient address
   * @return The address that receives fees
   */
  function feeRecipient() external view returns (address);

  /**
   * @notice Returns the current fee signer address
   * @return The address whos signature is verified
   */
  function feeSigner() external view returns (address);

  /**
   * @notice Creates a new intent with fees
   * @param _destinations Array of destination domains, preference ordered
   * @param _receiver Address of the receiver on the destination chain
   * @param _inputAsset Address of the input asset
   * @param _outputAsset Address of the output asset
   * @param _amount Amount of input asset to use for the intent
   * @param _maxFee Maximum fee percentage allowed for the intent
   * @param _ttl Time-to-live for the intent in seconds
   * @param _data Additional data for the intent
   * @param _feeParams Fee parameters including fee amount, deadline, and signature
   * @return _intentId The ID of the created intent
   * @return _intent The created intent object
   */
  function newIntent(
    uint32[] memory _destinations,
    bytes32 _receiver,
    address _inputAsset,
    bytes32 _outputAsset,
    uint256 _amount,
    uint24 _maxFee,
    uint48 _ttl,
    bytes calldata _data,
    FeeParams calldata _feeParams
  ) external payable returns (bytes32, IEverclear.Intent memory);

  /**
   * @notice Creates a new intent with fees
   * @param _destinations Array of destination domains, preference ordered
   * @param _receiver Address of the receiver on the destination chain
   * @param _inputAsset Address of the input asset
   * @param _outputAsset Address of the output asset
   * @param _amount Amount of input asset to use for the intent
   * @param _maxFee Maximum fee percentage allowed for the intent
   * @param _ttl Time-to-live for the intent in seconds
   * @param _data Additional data for the intent
   * @param _feeParams Fee parameters including fee amount, deadline, and signature
   * @return _intentId The ID of the created intent
   * @return _intent The created intent object
   */
  function newIntent(
    uint32[] memory _destinations,
    address _receiver,
    address _inputAsset,
    address _outputAsset,
    uint256 _amount,
    uint24 _maxFee,
    uint48 _ttl,
    bytes calldata _data,
    FeeParams calldata _feeParams
  ) external payable returns (bytes32, IEverclear.Intent memory);

  /**
   * @notice Creates multiple intents with the same parameters, splitting the amount evenly
   * @dev Creates _numIntents intents with identical parameters but divides _amount equally among them
   * @param _numIntents Number of intents to create
   * @param _fee Token fee amount to be sent to the fee recipient
   * @param _params Order parameters including destinations, receiver, assets, amount, maxFee, ttl, and data
   * @return _orderId The ID of the created order (hash of all intent IDs)
   * @return _intentIds Array of all created intent IDs
   */
  function newOrderSplitEvenly(
    uint32 _numIntents,
    uint256 _fee,
    uint256 _deadline,
    bytes calldata _sig,
    OrderParameters memory _params
  ) external payable returns (bytes32, bytes32[] memory);

  /**
   * @notice Creates multiple intents with the supplied parameters
   * @param _fee Token fee amount to be sent to the fee recipient
   * @param _params Order parameters including destinations, receiver, assets, amount, maxFee, ttl, and data
   * @return _orderId The ID of the created order (hash of all intent IDs)
   * @return _intentIds Array of all created intent IDs
   */
  function newOrder(
    uint256 _fee,
    uint256 _deadline,
    bytes calldata _sig,
    OrderParameters[] memory _params
  ) external payable returns (bytes32, bytes32[] memory);

  /**
   * @notice Updates the fee recipient address
   * @dev Can only be called by the owner of the contract
   * @param _feeRecipient The new address that will receive fees
   */
  function updateFeeRecipient(
    address _feeRecipient
  ) external;

  /**
   * @notice Updates the fee signer address
   * @dev Can only be called by the owner of the contract
   * @param _feeSigner The new address that will sign for fees
   */
  function updateFeeSigner(
    address _feeSigner
  ) external;

  /**
   * @notice Send virtual balance to the original recipient
   * @param _asset Address of the asset to return
   * @param _amount Amount of the asset to return
   * @param _recipient Address of the recipient
   */
  function returnUnsupportedIntent(address _asset, uint256 _amount, address _recipient) external;
}
