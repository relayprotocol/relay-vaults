/* solhint-disable one-contract-per-file */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IUniversalRouter} from "./interfaces/uniswap/IUniversalRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IRelayPool} from "./interfaces/IRelayPool.sol";

/**
 * @title TokenSwap
 * @notice A helper contract that facilitates token swaps through Uniswap's Universal Router
 * @dev This contract is designed to work with RelayPool contracts and handles swapping of
 *      various tokens to the pool's asset token using Uniswap V3 pools
 */
contract TokenSwap {
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
   * @notice Retrieves the balance of a specified token for this contract
   * @param token The address of the ERC20 token
   * @return The balance of the specified token held by this contract
   * @dev This is a helper function used internally to check token balances
   */
  function getBalance(address token) internal view returns (uint256) {
    return IERC20(token).balanceOf(address(this));
  }

  /**
   * @notice Swaps input tokens for the pool's asset token using Uniswap V3
   * @param tokenAddress The address of the input token to swap
   * @param uniswapWethPoolFeeToken The fee tier for the token-WETH pool (if used)
   * @param uniswapWethPoolFeeAsset The fee tier for the WETH-asset pool (if used)
   * @param deadline The Unix timestamp after which the swap will revert
   * @param amountOutMinimum The minimum amount of output tokens that must be received
   * @return amountOut The amount of output tokens received from the swap
   * @dev The swap can follow two routes:
   *      1. Direct: token -> asset (when uniswapWethPoolFeeAsset is 0)
   *      2. Through WETH: token -> WETH -> asset (default route)
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

  /**
   * @dev This function is required to handle ETH received from unwrapping WETH during swaps
   */
  receive() external payable {}
}
