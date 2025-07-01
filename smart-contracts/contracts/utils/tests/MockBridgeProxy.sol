// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockBridgeProxy {
  address public token;

  constructor(address _token) {
    token = _token;
  }

  function claim(address, uint256) public returns (uint256) {
    uint256 bal = IERC20(token).balanceOf(address(this));
    IERC20(token).transfer(msg.sender, bal);
    return bal;
  }
}

interface IERC20 {
  function balanceOf(address) external view returns (uint256);
  function transfer(address, uint256) external returns (bool);
}
