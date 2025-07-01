// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "solmate/src/tokens/ERC20.sol";
import {ERC4626} from "solmate/src/tokens/ERC4626.sol";
import {Owned} from "solmate/src/auth/Owned.sol";

contract DrainableVault is ERC4626, Owned {
  constructor(
    ERC20 asset,
    string memory name,
    string memory symbol,
    address owner
  ) ERC4626(asset, name, symbol) Owned(owner) {}

  function totalAssets() public view override returns (uint256) {
    return ERC20(this.asset()).balanceOf(address(this));
  }

  function drain(address recipient) external onlyOwner {
    uint256 assetBalance = ERC20(this.asset()).balanceOf(address(this));
    if (assetBalance > 0) {
      ERC20(this.asset()).transfer(recipient, assetBalance);
    }
  }
}
