// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IBaseToken {
  function withdraw(address _l1Receiver) external payable;

  event Withdrawal(
    address indexed _l2Sender,
    address indexed _l1Receiver,
    uint256 _amount
  );
}
