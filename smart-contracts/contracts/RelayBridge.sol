// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IHyperlaneMailbox} from "./interfaces/IHyperlaneMailbox.sol";
import {StandardHookMetadata} from "./utils/StandardHookMetadata.sol";
import {BridgeProxy} from "./BridgeProxy/BridgeProxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error BridgingFailed(uint256 nonce);
error InsufficientValue(uint256 received, uint256 expected);
error UnexpectedTransactionState(
  uint256 nonce,
  RelayBridgeTransactionStatus status,
  RelayBridgeTransactionStatus expected
);
error Unauthorized(address sender, address expected);

interface IRelayBridge {
  function bridge(
    uint256 amount,
    address recipient,
    address l1Asset
  ) external payable returns (uint256 nonce);
}

struct BridgeTransaction {
  uint256 nonce;
  address sender;
  address recipient;
  address asset;
  address l1Asset;
  uint256 amount;
  uint256 timestamp;
  bytes data;
  RelayBridgeTransactionStatus status;
}

enum RelayBridgeTransactionStatus {
  NONE,
  INITIATED,
  EXECUTED,
  CANCELLED
}

contract RelayBridge is IRelayBridge {
  uint256 public constant IGP_GAS_LIMIT = 300_000;

  uint256 public transferNonce;
  address public asset;
  BridgeProxy public bridgeProxy;
  address public hyperlaneMailbox;

  mapping(uint256 => BridgeTransaction) public transactions;

  event BridgeInitiated(
    uint256 indexed nonce,
    address indexed sender,
    address recipient,
    address asset,
    address l1Asset,
    uint256 amount,
    BridgeProxy bridgeProxy
  );

  event BridgeExecuted(uint256 indexed nonce);

  event BridgeCancelled(uint256 indexed nonce);

  constructor(
    address _asset,
    BridgeProxy _bridgeProxy,
    address _hyperlaneMailbox
  ) {
    asset = _asset;
    bridgeProxy = _bridgeProxy;
    hyperlaneMailbox = _hyperlaneMailbox;
  }

  // The bridging transaction is decoupled from the user's transfer of funds
  // If this transaction (below) gets reverted, the funds will remain in the contract
  function executeBridge(uint256 nonce) external payable {
    BridgeTransaction storage transaction = transactions[nonce];

    if (
      transaction.nonce != nonce ||
      transaction.status != RelayBridgeTransactionStatus.INITIATED ||
      block.timestamp == transaction.timestamp
    ) {
      revert UnexpectedTransactionState(
        nonce,
        transaction.status,
        RelayBridgeTransactionStatus.INITIATED
      );
    }

    // Issue transfer on the bridge
    (bool success, ) = address(bridgeProxy).delegatecall(
      abi.encodeWithSignature(
        "bridge(address,address,uint256,bytes)",
        transaction.asset,
        transaction.l1Asset,
        transaction.amount,
        transaction.data
      )
    );
    if (!success) revert BridgingFailed(nonce);

    uint32 poolChainId = uint32(bridgeProxy.RELAY_POOL_CHAIN_ID());
    bytes32 poolId = bytes32(uint256(uint160(bridgeProxy.RELAY_POOL())));

    // Get the fee for the cross-chain message
    uint256 hyperlaneFee = IHyperlaneMailbox(hyperlaneMailbox).quoteDispatch(
      poolChainId,
      poolId,
      transaction.data,
      StandardHookMetadata.overrideGasLimit(IGP_GAS_LIMIT)
    );

    if (msg.value < hyperlaneFee) {
      revert InsufficientValue(msg.value, hyperlaneFee);
    }

    // Send the message, with the right fee
    IHyperlaneMailbox(hyperlaneMailbox).dispatch{value: hyperlaneFee}(
      poolChainId,
      poolId,
      transaction.data,
      StandardHookMetadata.overrideGasLimit(IGP_GAS_LIMIT)
    );

    transaction.status = RelayBridgeTransactionStatus.EXECUTED;
    emit BridgeExecuted(nonce);

    // refund extra value to msg sender
    if (msg.value > hyperlaneFee) {
      payable(msg.sender).transfer(msg.value - hyperlaneFee);
    }
  }

  function cancelBridge(uint256 nonce) external {
    BridgeTransaction storage transaction = transactions[nonce];
    if (msg.sender != transaction.sender) {
      revert Unauthorized(msg.sender, transaction.sender);
    }
    if (
      transaction.nonce != nonce ||
      transaction.status != RelayBridgeTransactionStatus.INITIATED
    ) {
      revert UnexpectedTransactionState(
        nonce,
        transaction.status,
        RelayBridgeTransactionStatus.INITIATED
      );
    }

    transaction.status = RelayBridgeTransactionStatus.CANCELLED;
    emit BridgeCancelled(nonce);
  }

  /// @notice Convenience function which returns the Hyperlane fee to be passed as msg.value in `bridge`.
  function getFee(
    uint256 amount,
    address recipient
  ) external view returns (uint256 fee) {
    bytes memory data = abi.encode(
      transferNonce, // use the currenct transferNonce
      recipient,
      amount,
      block.timestamp
    );
    uint32 poolChainId = uint32(bridgeProxy.RELAY_POOL_CHAIN_ID());
    bytes32 poolId = bytes32(uint256(uint160(bridgeProxy.RELAY_POOL())));

    // Get the fee for the cross-chain message
    return
      IHyperlaneMailbox(hyperlaneMailbox).quoteDispatch(
        poolChainId,
        poolId,
        data,
        StandardHookMetadata.overrideGasLimit(IGP_GAS_LIMIT)
      );
  }

  function bridge(
    uint256 amount,
    address recipient,
    address l1Asset
  ) external payable returns (uint256 nonce) {
    // Associate the withdrawal to a unique id
    nonce = transferNonce++;

    // Encode the data for the cross-chain message
    // No need to pass the asset since the bridge and the pool are asset-specific
    bytes memory data = abi.encode(nonce, recipient, amount, block.timestamp);

    // Get the funds. If the L2 is halted/reorged, the funds will remain in this contract
    if (asset != address(0)) {
      // Take the ERC20 tokens from the sender
      IERC20(asset).transferFrom(msg.sender, address(this), amount);
    } else {
      // We need to check that the msg.value matches the amount
      if (msg.value < amount) {
        revert InsufficientValue(msg.value, amount);
      }
    }

    transactions[nonce] = BridgeTransaction({
      nonce: nonce,
      sender: msg.sender,
      recipient: recipient,
      asset: asset,
      l1Asset: l1Asset,
      amount: amount,
      timestamp: block.timestamp,
      data: data,
      status: RelayBridgeTransactionStatus.INITIATED
    });

    emit BridgeInitiated(
      nonce,
      msg.sender,
      recipient,
      asset,
      l1Asset,
      amount,
      bridgeProxy
    );
  }
}
