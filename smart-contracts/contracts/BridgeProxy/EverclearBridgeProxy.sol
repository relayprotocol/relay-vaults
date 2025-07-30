// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "./BridgeProxy.sol";
import {IFeeAdapter} from "../interfaces/everclear/IFeeAdapter.sol";
import {console} from "hardhat/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EverclearBridgeProxy is BridgeProxy {
  address public immutable FEE_ADAPTER;
  uint32 public immutable DESTINATION_DOMAIN_ID;

  error NativeBridgeNotAllowed();

  constructor(
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy,
    address feeAdapter,
    uint32 destinationDomainId
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy) {
    FEE_ADAPTER = feeAdapter;
    DESTINATION_DOMAIN_ID = destinationDomainId;
  }


  function getFeeParams(bytes calldata extraData) public view returns (IFeeAdapter.FeeParams memory) {
      (uint256 fee, uint256 deadline, bytes memory sig) = abi.decode(extraData, (uint256, uint256, bytes));
      return IFeeAdapter.FeeParams({
        fee: fee,
        deadline: deadline,
        sig: sig
      });
    }
  
  function getIntentParams(bytes calldata extraData) public view returns (uint24, uint48, IFeeAdapter.FeeParams memory, bytes memory) {
    (uint24 maxFee, uint48 ttl, IFeeAdapter.FeeParams memory feeParams, bytes memory moreData) = abi.decode(extraData, (uint24, uint48, IFeeAdapter.FeeParams, bytes));
    return (maxFee, ttl, feeParams, moreData);
  }


  function bridge(
    address currency,
    address l1Asset,
    uint256 amount,
    bytes calldata data,
    bytes calldata extraData
  ) external payable override {

    // everclear does not support native bridging
    if (l1Asset == address(0) || currency == address(0)) {
      revert NativeBridgeNotAllowed();
    }

    // get tokens
    IERC20(currency).transferFrom(msg.sender, address(this), amount);
    IERC20(currency).approve(FEE_ADAPTER, amount);
    
    // parse destination domains
    uint32[] memory destinations = new uint32[](1);
    destinations[0] = DESTINATION_DOMAIN_ID;

    // unpack intent params from extraData
    (
      uint24 maxFee, 
      uint48 ttl, 
      IFeeAdapter.FeeParams memory feeParams, 
      bytes memory moreData
    ) = getIntentParams(extraData);

    console.log("destinations.length", destinations.length);
    console.log("destinations[0]", destinations[0]);
    console.log("DESTINATION_DOMAIN_ID", DESTINATION_DOMAIN_ID);
    console.log("currency", currency);
    console.log("l1Asset", l1Asset);
    console.log("amount", amount);
    console.log("L1_BRIDGE_PROXY", L1_BRIDGE_PROXY);
    console.log("maxFee", maxFee);
    console.log("ttl", ttl);
    console.logBytes(moreData);
    console.log("feeParams.fee", feeParams.fee);
    console.log("feeParams.deadline", feeParams.deadline);
    console.logBytes(feeParams.sig);

    // create intent
    IFeeAdapter(FEE_ADAPTER).newIntent(
      destinations, // destinations 
      L1_BRIDGE_PROXY, // receiver
      currency, // inputAsset
      l1Asset, // outputAsset
      amount, // amount
      maxFee, // maxFee
      ttl, // ttl
      moreData, // data
      feeParams // feeParams
    );
  }

  /// @notice Receives native ETH for bridging operations
  /// @dev Required to receive ETH
  receive() external payable {}
}
