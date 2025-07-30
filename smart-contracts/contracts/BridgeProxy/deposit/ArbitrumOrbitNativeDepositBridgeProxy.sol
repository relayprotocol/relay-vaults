// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "../BridgeProxy.sol";
import {IL1GatewayRouter} from "../../interfaces/arb/IArbL1GatewayRouter.sol";
import {IInbox} from "../../interfaces/arb/IInbox.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ArbitrumOrbitNativeDepositBridgeProxy
 * This contract is used to deposit native and ERC20 tokens from an L1 origin chain to an Arbitrum destination chain.
 * For native token, it creates a retryable ticket to the L2 bridge proxy.
 * For ERC20 token, it creates an outbound transfer to deposit to the L2 bridge proxy.
 * @notice The L1_BRIDGE_PROXY is the address of the destination bridge proxy on the vault chain - it is not necessarily on an L1.
 */
contract ArbitrumOrbitNativeDepositBridgeProxy is BridgeProxy {
  error AssetMismatch(address expected, address actual);

  IInbox public immutable INBOX;
  IL1GatewayRouter public immutable ROUTER;

  constructor(
    address l1GatewayRouter,
    address inbox,
    uint256 relayPoolChainId,
    address relayPool,
    address l2BridgeProxy
  ) BridgeProxy(relayPoolChainId, relayPool, l2BridgeProxy) {
    ROUTER = IL1GatewayRouter(l1GatewayRouter);
    INBOX = IInbox(inbox);
  }

  function bridge(
    address asset, //l2 token
    address l1Currency, //l1 token
    uint256 amount,
    bytes calldata gasParams,
    bytes calldata extraData
  ) external payable override {
    (uint256 maxFeePerGas, uint256 gasLimit, uint256 maxSubmissionCost, bytes memory moreData) = abi
      .decode(extraData, (uint256, uint256, uint256, bytes));

    if (l1Currency == address(0)) {
      // simple deposit wont work as it deposits to an alias by default
      // we have to create a retryable ticket to deposit to the L1 bridge proxy
      INBOX.createRetryableTicket{value: amount}(
        // NB: the L1_BRIDGE_PROXY is the address of the destination bridge proxy
        // on the vault chain - it is not necessarily on an L1
        L1_BRIDGE_PROXY, // to
        amount, // l2CallValue
        maxSubmissionCost, // maxSubmissionCost
        address(this), // excessFeeRefundAddress
        address(this), // callValueRefundAddress (receives msg.value on l2)
        gasLimit, // gasLimit
        maxFeePerGas, // maxFeePerGas
        moreData // data
      );
    } else {
      address l2token = ROUTER.calculateL2TokenAddress(l1Currency);
      if (l2token != asset) {
        revert AssetMismatch(l2token, asset);
      }

      IERC20(l1Currency).approve(
        address(0xB2535b988dcE19f9D71dfB22dB6da744aCac21bf),
        amount
      );

      ROUTER.outboundTransferCustomRefund{value: msg.value}(
        l1Currency, // L1 erc20 address
        // NB: the L1_BRIDGE_PROXY is the address of the destination bridge proxy
        // on the vault chain - it is not necessarily on an L1
        L1_BRIDGE_PROXY, // receives excess gas refund on L2
        L1_BRIDGE_PROXY, // receives token on L2
        amount, // token amount
        gasLimit, // Max gas deducted from user's L2 balance to cover L2 execution
        maxFeePerGas, // Gas price bid for L2 execution
        abi.encode(maxSubmissionCost, moreData)
      );
    }
  }

  receive() external payable {}
}
