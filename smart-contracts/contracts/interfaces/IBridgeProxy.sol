// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IBridgeProxy {
  function claim(
    address currency,
    uint256 amount
  ) external returns (uint256 balance);
}
