// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "../BridgeProxy.sol";
import {IInbox} from "../../interfaces/arb/IInbox.sol";

/**
 * @title ArbitrumOrbitNativeDepositBridgeProxy
 * @notice Deposits native ETH from an L1 origin chain to an Arbitrum Orbit
 *         destination chain by creating a retryable ticket to the destination
 *         bridge proxy. Vaults only support ETH, so the ERC20 path has been
 *         removed (the canonical ERC20 gateway is not used here).
 * @notice The L1_BRIDGE_PROXY is the address of the destination bridge proxy
 *         on the vault chain — it is not necessarily on an L1.
 */
contract ArbitrumOrbitNativeDepositBridgeProxy is BridgeProxy {
  IInbox public immutable INBOX;

  constructor(
    address inbox,
    uint256 relayPoolChainId,
    address relayPool,
    address l2BridgeProxy
  ) BridgeProxy(relayPoolChainId, relayPool, l2BridgeProxy) {
    INBOX = IInbox(inbox);
  }

  struct GasEstimate {
    uint256 maxFeePerGas;
    uint256 gasLimit;
    uint256 maxSubmissionCost;
    uint256 depositFee;
  }

  function bridge(
    address /* currency */,
    address /* l1Asset */,
    uint256 amount,
    bytes calldata /* gasParams */,
    bytes calldata extraData
  ) external payable override {
    (GasEstimate memory gasEstimate, bytes memory moreData) = abi.decode(
      extraData,
      (GasEstimate, bytes)
    );

    // Simple deposit won't work — it deposits to an alias by default — so we
    // create a retryable ticket to the destination bridge proxy.
    INBOX.createRetryableTicket{value: amount}(
      L1_BRIDGE_PROXY, // to
      amount - gasEstimate.depositFee, // l2CallValue
      gasEstimate.maxSubmissionCost, // maxSubmissionCost
      L1_BRIDGE_PROXY, // excess gas refund recipient on L2
      L1_BRIDGE_PROXY, // msg.value recipient on L2
      gasEstimate.gasLimit, // gasLimit
      gasEstimate.maxFeePerGas, // maxFeePerGas
      moreData // data
    );
  }

  receive() external payable {}
}
