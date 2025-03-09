// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "./BridgeProxy.sol";
import {IL1SharedBridge} from "../interfaces/zksync/IL1SharedBridge.sol";
import {IL2SharedBridge} from "../interfaces/zksync/IL2SharedBridge.sol";
import {IBaseToken} from "../interfaces/zksync/IBaseToken.sol";

contract ZkSyncBridgeProxy is BridgeProxy {
  IL2SharedBridge public immutable L2_SHARED_BRIDGE;

  IBaseToken public immutable L2_BASE_TOKEN =
    IBaseToken(0x000000000000000000000000000000000000800A);

  constructor(
    address l2SharedBridge,
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy) {
    L2_SHARED_BRIDGE = IL2SharedBridge(l2SharedBridge);
  }

  function bridge(
    address currency,
    address /* l1Asset */,
    uint256 amount,
    bytes calldata /*data*/
  ) external payable override {
    // Check if this is a native token withdrawal
    if (currency == address(0)) {
      // For native token withdrawals, use IBaseToken.withdraw
      L2_BASE_TOKEN.withdraw{value: amount}(L1_BRIDGE_PROXY);
    } else {
      // For ERC20 token withdrawals
      L2_SHARED_BRIDGE.withdraw(L1_BRIDGE_PROXY, currency, amount);
    }
  }
}
