// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "./BridgeProxy.sol";
import {IL1GatewayRouter} from "../interfaces/arb/IArbL1GatewayRouter.sol";
import {IArbSys} from "../interfaces/arb/IArbSys.sol";

contract ArbitrumOrbitNativeDepositBridgeProxy is BridgeProxy {
  error AssetMismatch(address expected, address actual);

  IInbox public immutable INBOX =
    IInbox(0x0000000000000000000000000000000000000064);
  IL2GatewayRouter public immutable ROUTER;

  constructor(
    address l1GatewayRouter,
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy) {
    ROUTER = IL1GatewayRouter(l1GatewayRouter);
  }

  function bridge(
    address asset, //l2 token
    address l1Currency, //l1 token
    uint256 amount,
    bytes calldata /* txParams */,
    bytes calldata /* extraData */
  ) external payable override {
    if (l1Currency == address(0)) {
      INBOX.depositEth{value: amount}(L1_BRIDGE_PROXY);
    } else {
      ROUTER.outboundTransferCustomRefund(
        l1Currency,
        address(this), // for refunding excess gas on L2 (will be an arb alias)
        L1_BRIDGE_PROXY,
        amount,
        1000000, // Max gas deducted from user's L2 balance to cover L2 execution
        1000000, // Gas price for L2 execution
        abi.encode(asset, amount), // Extra data
        ""
      );
    }
  }

  receive() external payable {}
}
