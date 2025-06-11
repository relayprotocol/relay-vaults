// SPDX-License-Identifier: Unknown
pragma solidity ^0.8.28;

import {BridgeProxy} from "./BridgeProxy.sol";
import {L2StandardBridge} from "../interfaces/L2StandardBridge.sol";
import {IOptimismMintableERC20} from "../interfaces/IOptimismMintableERC20.sol";

contract OPStackNativeBridgeProxy is BridgeProxy {
  address public constant STANDARD_BRIDGE =
    address(0x4200000000000000000000000000000000000010);

  uint32 public constant MIN_GAS_LIMIT = 200000;

  constructor(
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy) {}

  function bridge(
    address currency,
    address l1Asset,
    uint256 amount,
    bytes calldata data,
    bytes calldata /* extraData */
  ) external payable override {
    if (currency == address(0)) {
      L2StandardBridge(STANDARD_BRIDGE).bridgeETHTo{value: amount}(
        L1_BRIDGE_PROXY,
        MIN_GAS_LIMIT,
        data
      );
    } else {
      // First, check that this is a "bridged ERC20" token
      address l1Token = IOptimismMintableERC20(currency).remoteToken();
      if (l1Token == address(0)) {
        revert TokenNotBridged(currency);
      } else if (l1Asset != l1Token) {
        revert UnexpectedL1Asset(l1Token, l1Asset);
      }

      // Bridge!
      L2StandardBridge(STANDARD_BRIDGE).bridgeERC20To(
        currency,
        l1Token,
        L1_BRIDGE_PROXY,
        amount,
        MIN_GAS_LIMIT,
        data
      );
    }
  }

  // Contract should be able to receive ETH
  receive() external payable {}
}
