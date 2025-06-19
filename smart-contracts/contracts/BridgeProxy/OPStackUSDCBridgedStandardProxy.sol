// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BridgeProxy} from "./BridgeProxy.sol";

interface IL2OpUSDCBridgeAdapter {
  function USDC() external view returns (address);
  function sendMessage(address _to, uint256 _amount, uint32 gas) external;
}

contract OPStackUSDCBridgedStandardProxy is BridgeProxy {
  address public immutable L1_USDC;
  address public immutable USDC_BRIDGE_ADAPTER;

  constructor(
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy,
    address _l1USDC, 
    address _l2OpUSDCBridgeAdapter
    ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy)  {
    L1_USDC = _l1USDC;
    USDC_BRIDGE_ADAPTER = _l2OpUSDCBridgeAdapter;
  }

   function bridge(
    address currency,
    address l1Asset,
    uint256 amount,
    bytes calldata /*data*/,
    bytes calldata /* extraData */
  ) external payable override {
    // make sure USDC is required
    if (currency != IL2OpUSDCBridgeAdapter(USDC_BRIDGE_ADAPTER).USDC()) {
      revert UnexpectedL1Asset(L1_USDC, l1Asset);
    }
    if (l1Asset != L1_USDC) {
      revert UnexpectedL1Asset(L1_USDC, l1Asset);
    }

    // send USDC to L1 bridge proxy
    IL2OpUSDCBridgeAdapter(USDC_BRIDGE_ADAPTER).sendMessage(
      L1_BRIDGE_PROXY, 
      amount, 
      1000000
      );
  }
}