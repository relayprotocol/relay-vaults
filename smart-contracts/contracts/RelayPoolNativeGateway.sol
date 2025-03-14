// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IWETH} from "./interfaces/IWETH.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

error EthTransferFailed();
error OnlyWethCanSendEth();
error RemainingEth();
error SlippageExceeded();

contract RelayPoolNativeGateway {
  IWETH public immutable WETH;

  /**
   * @param wethAddress address on Wrapped Native contract
   */
  constructor(address wethAddress) {
    WETH = IWETH(wethAddress);
  }

  /**
   * @dev deposit native tokens to the WETH _reserves of msg.sender
   * @param receiver the reserve account to be credited
   * @param minSharesOut minimum amount of shares to receive
   */
  function deposit(
    address pool,
    address receiver,
    uint256 minSharesOut
  ) external payable returns (uint256 shares) {
    // wrap tokens
    WETH.deposit{value: msg.value}();
    WETH.approve(pool, msg.value);

    // do the deposit
    shares = IERC4626(pool).deposit(msg.value, receiver);

    // Enforce slippage protection
    if (shares < minSharesOut) {
      revert SlippageExceeded();
    }
  }

  /**
   * @dev deposit native tokens to the WETH _reserves of msg.sender
   * @param receiver the reserve account to be credited
   * @param minSharesOut minimum amount of shares to receive
   */
  function mint(
    address pool,
    address receiver,
    uint256 minSharesOut
  ) external payable returns (uint256 shares) {
    // wrap tokens
    WETH.deposit{value: msg.value}();
    WETH.approve(pool, msg.value);

    // do the deposit
    shares = IERC4626(pool).convertToShares(msg.value);

    // Enforce slippage protection
    if (shares < minSharesOut) {
      revert SlippageExceeded();
    }

    IERC4626(pool).mint(shares, receiver);
  }

  /**
   * @dev withraw native tokens from the WETH _reserves of msg.sender
   * @param assets amount of native tokens
   * @param receiver the reserve account to be credited
   * @param maxSharesIn maximum amount of shares to burn
   */
  function withdraw(
    address pool,
    uint256 assets,
    address receiver,
    uint256 maxSharesIn
  ) external virtual returns (uint256 shares) {
    uint256 balanceBefore = address(this).balance;

    // withdraw from pool
    shares = IERC4626(pool).withdraw(assets, address(this), msg.sender);

    // Enforce slippage protection
    if (shares > maxSharesIn) {
      revert SlippageExceeded();
    }

    // withdraw native tokens and send them back
    WETH.withdraw(assets);
    _safeTransferETH(receiver, assets);

    // make sure no ETH is left in the contract
    if (address(this).balance - balanceBefore > 0) {
      revert RemainingEth();
    }
  }

  /**
   * @dev redeem native tokens
   * @param shares amount of native tokens
   * @param receiver the reserve account to be credited
   * @param minAssetsOut minimum amount of assets to receive
   */
  function redeem(
    address pool,
    uint256 shares,
    address receiver,
    uint256 minAssetsOut
  ) external virtual returns (uint256 assets) {
    uint256 balanceBefore = address(this).balance;
    // withdraw from pool
    assets = IERC4626(pool).redeem(shares, address(this), msg.sender);

    // Enforce slippage protection
    if (assets < minAssetsOut) {
      revert SlippageExceeded();
    }

    // withdraw native tokens and send them back
    WETH.withdraw(assets);
    _safeTransferETH(receiver, assets);

    // make sure no ETH is left in the contract
    if (address(this).balance - balanceBefore > 0) {
      revert RemainingEth();
    }
  }

  /**
   * @dev transfer ETH to an address, revert if it fails.
   * @param to recipient of the transfer
   * @param value the amount to send
   */
  function _safeTransferETH(address to, uint256 value) internal {
    (bool success, ) = to.call{value: value}(new bytes(0));
    if (!success) {
      revert EthTransferFailed();
    }
  }

  receive() external payable {
    if (msg.sender != address(WETH)) {
      revert OnlyWethCanSendEth();
    }
  }
}
