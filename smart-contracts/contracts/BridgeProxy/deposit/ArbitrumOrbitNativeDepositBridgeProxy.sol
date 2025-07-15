// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "../BridgeProxy.sol";
import {IL1GatewayRouter} from "../../interfaces/arb/IArbL1GatewayRouter.sol";
import {IInbox} from "../../interfaces/arb/IInbox.sol";

contract ArbitrumOrbitNativeDepositBridgeProxy is BridgeProxy {
  error AssetMismatch(address expected, address actual);

  IInbox public immutable INBOX =
    IInbox(0x0000000000000000000000000000000000000064);
  IL1GatewayRouter public immutable ROUTER;

  constructor(
    address l1GatewayRouter,
    uint256 relayPoolChainId,
    address relayPool,
    address l2BridgeProxy
  ) BridgeProxy(relayPoolChainId, relayPool, l2BridgeProxy) {
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
      // simple deposit wont work as it deposits to an alias by default
      // we have to create a retryable ticket to deposit to the L1 bridge proxy
      INBOX.createRetryableTicket(
        L1_BRIDGE_PROXY, // to
        amount, // l2CallValue
        1000000, // maxSubmissionCost
        address(this), // excessFeeRefundAddress
        address(this), // callValueRefundAddress (receives msg.value on l2)
        1000000, // gasLimit
        1000000, // maxFeePerGas
        "" // data
      );
    } else {
      ROUTER.outboundTransferCustomRefund(
        l1Currency,
        L1_BRIDGE_PROXY, // receives excess gas refund on L2
        L1_BRIDGE_PROXY,
        amount,
        1000000, // Max gas deducted from user's L2 balance to cover L2 execution
        1000000, // Gas price for L2 execution
        "" // Extra data
      );
    }
  }

  receive() external payable {}
}
