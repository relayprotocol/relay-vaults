// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BridgeProxy} from "./BridgeProxy.sol";

contract USDCBridgedStandardBridgeProxy is BridgeProxy {
  address public immutable USDCe; // usdc deployed using USDC bridged standard

  constructor(
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy,
    address _USDCe
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy)  {
    USDCe = _USDCe;
  }

   function bridge(
    address /* currency */,
    address /* l1Asset */,
    uint256 amount,
    bytes calldata /*data*/,
    bytes calldata /* extraData */
  ) external payable override {
    // withdraw USDC.e to root chain
    IERC20(USDCe).withdraw(amount);
  }
}