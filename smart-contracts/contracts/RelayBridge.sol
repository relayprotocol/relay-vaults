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
    address l1Asset,
    uint256 l1Gas
  ) external payable returns (uint256 nonce);
}

contract RelayBridge is IRelayBridge {
  uint256 public transferNonce;
  address public immutable ASSET;
  BridgeProxy public immutable BRIDGE_PROXY;
  address public immutable HYPERLANE_MAILBOX;

  event BridgeInitiated(
    uint256 indexed nonce,
    address indexed sender,
    address recipient,
    address ASSET,
    address l1Asset,
    uint256 amount,
    BridgeProxy BRIDGE_PROXY
  );

  event BridgeExecuted(uint256 indexed nonce);

  event BridgeCancelled(uint256 indexed nonce);

  constructor(
    address _asset,
    BridgeProxy _bridgeProxy,
    address _hyperlaneMailbox
  ) {
    ASSET = _asset;
    BRIDGE_PROXY = _bridgeProxy;
    HYPERLANE_MAILBOX = _hyperlaneMailbox;
  }

  /// @notice Calculates the Hyperlane fee required for bridging
  /// @param amount Amount of tokens to bridge
  /// @param recipient Address that will receive the bridged tokens
  /// @return fee The required fee in native currency
  function getFee(
    uint256 amount,
    address recipient,
    uint256 l1Gas
  ) external view returns (uint256 fee) {
    bytes memory data = abi.encode(
      transferNonce, // use the current transferNonce
      recipient,
      amount,
      block.timestamp
    );
    uint32 poolChainId = uint32(BRIDGE_PROXY.RELAY_POOL_CHAIN_ID());
    bytes32 poolId = bytes32(uint256(uint160(BRIDGE_PROXY.RELAY_POOL())));

    // Get the fee for the cross-chain message
    return
      IHyperlaneMailbox(HYPERLANE_MAILBOX).quoteDispatch(
        poolChainId,
        poolId,
        data,
        StandardHookMetadata.overrideGasLimit(l1Gas)
      );
  }

  /// @notice Bridge tokens from the L2 to the L1
  function bridge(
    uint256 amount,
    address recipient,
    address l1Asset,
    uint256 l1Gas
  ) external payable returns (uint256 nonce) {
    // Associate the withdrawal to a unique id
    nonce = transferNonce++;

    // Encode the data for the cross-chain message
    // No need to pass the ASSET since the bridge and the pool are ASSET-specific
    bytes memory data = abi.encode(nonce, recipient, amount, block.timestamp);

    // Get the fee for the cross-chain message
    uint32 poolChainId = uint32(BRIDGE_PROXY.RELAY_POOL_CHAIN_ID());
    bytes32 poolId = bytes32(uint256(uint160(BRIDGE_PROXY.RELAY_POOL())));
    uint256 hyperlaneFee = IHyperlaneMailbox(HYPERLANE_MAILBOX).quoteDispatch(
      poolChainId,
      poolId,
      data,
      StandardHookMetadata.overrideGasLimit(l1Gas)
    );

    if (ASSET != address(0)) {
      // Take the ERC20 tokens from the sender
      SafeERC20.safeTransferFrom(
        IERC20(ASSET),
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
    (bool success, ) = address(BRIDGE_PROXY).delegatecall(
      abi.encodeWithSignature(
        "bridge(address,address,uint256,bytes)",
        ASSET,
        l1Asset,
        amount,
        data
      )
    );
    if (!success) revert BridgingFailed(nonce);

    // Send the Hyperlane message, with the right fee
    IHyperlaneMailbox(HYPERLANE_MAILBOX).dispatch{value: hyperlaneFee}(
      poolChainId,
      poolId,
      data,
      StandardHookMetadata.overrideGasLimit(l1Gas)
    );

    emit BridgeInitiated(
      nonce,
      msg.sender,
      recipient,
      ASSET,
      l1Asset,
      amount,
      BRIDGE_PROXY
    );

    // refund extra value to msg.sender (we ignore failures here)
    if (ASSET != address(0)) {
      if (msg.value > hyperlaneFee) {
        msg.sender.call{value: msg.value - hyperlaneFee}(new bytes(0));
      }
    } else {
      if (msg.value > hyperlaneFee + amount) {
        msg.sender.call{value: msg.value - hyperlaneFee - amount}(new bytes(0));
      }
    }

    return nonce;
  }
}
