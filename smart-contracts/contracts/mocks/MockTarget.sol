// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockTarget {
    event CallReceived(address sender, bytes data, uint256 value);
    event CallFailed(string reason);

    function receiveCall(bytes calldata data) external payable {
        emit CallReceived(msg.sender, data, msg.value);
    }

    function failCall() external payable {
        emit CallFailed("Intentional failure");
        revert("Intentional failure");
    }
} 