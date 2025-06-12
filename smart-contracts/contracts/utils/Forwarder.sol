// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


interface ISafe {
  function isOwner(address) external view returns (bool);
}

/**
 * @title Forwarder
 * @dev A contract that forwards calls to another address if the caller is approved.
 * Supports SAFE integration.
 */
contract Forwarder is Ownable {
    // Errors 
    error NotMultisigOwner(address);
    error InvalidTargetAddress();
    error InsufficientValueSent();
    error ForwardFailed();
    error RefundFailed();
    
    // Optional SAFE address that can also forward calls
    address public safeAddress;
    
    // Events
    event Forwarded(address indexed to, bytes data, uint256 value);

    modifier onlyMultisigOwner() {
      if (!ISafe(safeAddress).isOwner(msg.sender)) revert NotMultisigOwner(msg.sender);
      _;
    }

    constructor(address _safeAddress) Ownable(_safeAddress) {
      safeAddress = _safeAddress;
    }

    /**
     * @dev Forward a call to another address
     * @param to The address to forward the call to
     * @param data The data to forward
     * @param value The amount of ETH to forward
     */
    function forward(address to, bytes calldata data, uint256 value) onlyMultisigOwner external payable  {
        if (to == address(0)) revert InvalidTargetAddress();
        if (msg.value < value) revert InsufficientValueSent();

        (bool success, ) = to.call{value: value}(data);
        if (!success) revert ForwardFailed();

        // Refund excess ETH if any
        if (msg.value > value) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - value}("");
            if (!refundSuccess) revert RefundFailed();
        }

        emit Forwarded(to, data, value);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
} 