// SPDX-License-Identifier: Unknown
pragma solidity ^0.8.28;

import {BridgeProxy} from "../../BridgeProxy/BridgeProxy.sol";

// This is a fake contract to be used in tests
contract FakeBridgeProxy is BridgeProxy {
  constructor(
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy) {}

  function bridge(
    address /* currency */,
    address /* l1Asset */,
    uint256 amount,
    bytes calldata /* txParams */,
    bytes calldata /* extraData */
  ) external payable override {
    if (amount == 13371337133713371337) {
      revert("FakeBridgeProxy: bridge failed");
    }
  }
}
