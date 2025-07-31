// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "./BridgeProxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EverclearBridgeProxy is BridgeProxy {
  address public immutable FEE_ADAPTER;

  error NativeBridgeNotAllowed();
  error InvalidFeeAdapter(address to);
  error IntentCreationFailed();

  constructor(
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy,
    address feeAdapter
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy) {
    FEE_ADAPTER = feeAdapter;
  }
  
  function getIntentTxRequest(bytes calldata extraData) public view returns (address, uint256, bytes memory) {
    (address to, uint256 value, bytes memory data) = abi.decode(extraData, (address, uint256, bytes));
    return (to, value, data);
  }


  function bridge(
    address currency,
    address l1Asset,
    uint256 amount,
    bytes calldata /*data*/,
    bytes calldata extraData
  ) external payable override {

    // everclear does not support native bridging
    if (l1Asset == address(0) || currency == address(0)) {
      revert NativeBridgeNotAllowed();
    }
    
    (address to, uint256 value, bytes memory data) = getIntentTxRequest(extraData);
    if(to != FEE_ADAPTER) {
      revert InvalidFeeAdapter(to);
    }

    // get tokens
    IERC20(currency).transferFrom(msg.sender, address(this), amount);
    IERC20(currency).approve(FEE_ADAPTER, amount);
    
    // create intent
    (bool success, ) = FEE_ADAPTER.call{ value:value}(data);
    if (!success) revert IntentCreationFailed();
  }

  /// @notice Receives native ETH for bridging operations
  /// @dev Required to receive ETH
  receive() external payable {}
}
