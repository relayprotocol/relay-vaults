// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @notice Test contract that rejects all native currency transfers
contract EthRejector {
  receive() external payable {
    revert("EthRejector: no ETH accepted");
  }
}
