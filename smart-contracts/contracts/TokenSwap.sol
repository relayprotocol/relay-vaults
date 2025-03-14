/* solhint-disable one-contract-per-file */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {IUniversalRouter} from "./interfaces/uniswap/IUniversalRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IRelayPool} from "./interfaces/IRelayPool.sol";

library SafeCast160 {
  error UnsafeCast();

  /// @notice Safely casts uint256 to uint160
  /// @param value The uint256 to be cast
  function toUint160(uint256 value) internal pure returns (uint160) {
    if (value > type(uint160).max) revert UnsafeCast();
    return uint160(value);
  }
}

/**
 * @title TokenSwap
 * @notice A helper contract to swap tokens
 */
contract TokenSwap {
  // make sure we dont exceed type uint160 when casting
  using SafeCast160 for uint256;

  // required by Uniswap Universal Router
  address public immutable UNISWAP_UNIVERSAL_ROUTER;

  // specified in https://docs.uniswap.org/contracts/universal-router/technical-reference#v3_swap_exact_in
  uint256 internal constant V3_SWAP_EXACT_IN = 0x00;

  // events
  event TokenSwapped(
    address pool,
    address tokenIn,
    uint256 amountIn,
    uint256 amountOut
  );

  // errors
  error TokenSwappedFailed(
    address uniswapUniversalRouter,
    address tokenIn,
    uint256 amount
  );
  error UnauthorizedSwap();

  /**
   * Set the address of Uniswap Permit2 helper contract
   * @param _uniswapUniversalRouter the address of Uniswap Universal Router
   */
  constructor(address _uniswapUniversalRouter) {
    UNISWAP_UNIVERSAL_ROUTER = _uniswapUniversalRouter;
  }

  /**
   * Simple helper to retrieve balance in ERC20 or native tokens
   * @param token the address of the token (address(0) for native token)
   */
  function getBalance(address token) internal view returns (uint256) {
    return IERC20(token).balanceOf(address(this));
  }

  /**
   * Swap tokens to UDT and burn the tokens
   *
   * @notice The default route is token > WETH > asset.
   * If `uniswapWethPoolFeeAsset` is set to null, then we do a direct swap token > asset
   * @param deadline The deadline for the swap transaction
   * @param amountOutMinimum The minimum amount of output tokens that must be received for the transaction not to revert
   */
  function swap(
    address tokenAddress,
    uint24 uniswapWethPoolFeeToken,
    uint24 uniswapWethPoolFeeAsset,
    uint48 deadline,
    uint256 amountOutMinimum
  ) public payable returns (uint256 amountOut) {
    // get info from pool
    address pool = msg.sender;
    address asset = IRelayPool(pool).asset();
    address wrappedAddress = IRelayPool(pool).WETH();

    // get total balance of token to swap
    uint256 tokenAmount = getBalance(tokenAddress);
    uint256 assetAmountBefore = getBalance(asset);

    if (tokenAddress == asset) {
      revert UnauthorizedSwap();
    }

    // Approve the router to spend src ERC20
    TransferHelper.safeApprove(
      tokenAddress,
      UNISWAP_UNIVERSAL_ROUTER,
      tokenAmount
    );

    // send tokens to universal router to manipulate the token
    IERC20(tokenAddress).transfer(UNISWAP_UNIVERSAL_ROUTER, tokenAmount);

    // parse the path
    bytes memory path = uniswapWethPoolFeeAsset == 0
      ? abi.encodePacked(tokenAddress, uniswapWethPoolFeeToken, asset) // if no pool fee for asset, then do direct swap
      : abi.encodePacked(tokenAddress, uniswapWethPoolFeeToken, wrappedAddress); // else default to token > WETH

    // add WETH > asset to path if needed
    if (uniswapWethPoolFeeAsset != 0 && asset != wrappedAddress) {
      path = abi.encodePacked(path, uniswapWethPoolFeeAsset, asset);
    }

    // encode parameters for the swap om UniversalRouter
    bytes memory commands = abi.encodePacked(bytes1(uint8(V3_SWAP_EXACT_IN)));
    bytes[] memory inputs = new bytes[](1);
    inputs[0] = abi.encode(
      address(this), // recipient is this contract
      tokenAmount, // amountIn
      amountOutMinimum, // amountOutMinimum
      path,
      false // funds are coming from universal router
    );

    // Executes the swap.
    IUniversalRouter(UNISWAP_UNIVERSAL_ROUTER).execute(
      commands,
      inputs,
      uint256(deadline)
    );

    // check if assets have actually been swapped
    amountOut = getBalance(asset) - assetAmountBefore;
    if (amountOut == 0) {
      revert TokenSwappedFailed(
        UNISWAP_UNIVERSAL_ROUTER,
        tokenAddress,
        tokenAmount
      );
    }

    // transfer the swapped asset to the pool
    IERC20(asset).transfer(pool, amountOut);
    emit TokenSwapped(pool, tokenAddress, tokenAmount, amountOut);
  }

  // required to withdraw WETH
  receive() external payable {}
}
