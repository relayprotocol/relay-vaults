// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IHyperlaneMailbox} from "./interfaces/IHyperlaneMailbox.sol";
import {StandardHookMetadata} from "./utils/StandardHookMetadata.sol";
import {BridgeProxy} from "./BridgeProxy/BridgeProxy.sol";

error BridgingFailed(uint256 nonce);
error InsufficientValue(uint256 received, uint256 expected);

interface IRelayBridge {
  function bridge(
    uint256 amount,
    address recipient,
    address l1Asset
  ) external payable returns (uint256 nonce);
}

contract RelayBridge is IRelayBridge {
  uint256 public constant IGP_GAS_LIMIT = 300_000;

  uint256 public transferNonce;
  address public asset;
  BridgeProxy public bridgeProxy;
  address public hyperlaneMailbox;

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

  /// @notice Calculates the Hyperlane fee required for bridging
  /// @param amount Amount of tokens to bridge
  /// @param recipient Address that will receive the bridged tokens
  /// @return fee The required fee in native currency
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

  /// @notice Bridge tokens from the L2 to the L1
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

    // Get the fee for the cross-chain message
    uint32 poolChainId = uint32(bridgeProxy.RELAY_POOL_CHAIN_ID());
    bytes32 poolId = bytes32(uint256(uint160(bridgeProxy.RELAY_POOL())));
    uint256 hyperlaneFee = IHyperlaneMailbox(hyperlaneMailbox).quoteDispatch(
      poolChainId,
      poolId,
      data,
      StandardHookMetadata.overrideGasLimit(IGP_GAS_LIMIT)
    );

    // Get the funds. If the L2 is halted/reorged, the funds will remain in this contract
    if (asset != address(0)) {
      // Take the ERC20 tokens from the sender
      SafeERC20.safeTransferFrom(
        IERC20(asset),
        msg.sender,
        address(this),
        amount
      );
      if (msg.value < hyperlaneFee) {
        revert InsufficientValue(msg.value, hyperlaneFee);
      }
    } else {
      if (msg.value < hyperlaneFee + amount) {
        revert InsufficientValue(msg.value, hyperlaneFee + amount);
      }
    }

    // Issue transfer on the bridge
    (bool success, ) = address(bridgeProxy).delegatecall(
      abi.encodeWithSignature(
        "bridge(address,address,uint256,bytes)",
        asset,
        l1Asset,
        amount,
        data
      )
    );
    if (!success) revert BridgingFailed(nonce);

    // Send the Hyperlane message, with the right fee
    IHyperlaneMailbox(hyperlaneMailbox).dispatch{value: hyperlaneFee}(
      poolChainId,
      poolId,
      data,
      StandardHookMetadata.overrideGasLimit(IGP_GAS_LIMIT)
    );

    emit BridgeInitiated(
      nonce,
      msg.sender,
      recipient,
      asset,
      l1Asset,
      amount,
      bridgeProxy
    );

    // refund extra value to msg.sender (we ignore failures here)
    bool refundSuccess;
    if (asset != address(0)) {
      if (msg.value > hyperlaneFee) {
        (refundSuccess, ) = msg.sender.call{value: msg.value - hyperlaneFee}(
          new bytes(0)
        );
      }
    } else {
      if (msg.value > hyperlaneFee + amount) {
        (refundSuccess, ) = msg.sender.call{
          value: msg.value - hyperlaneFee - amount
        }(new bytes(0));
      }
    }

    return nonce;
  }
}
