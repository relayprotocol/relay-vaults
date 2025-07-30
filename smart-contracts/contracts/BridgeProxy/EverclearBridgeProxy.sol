// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "../BridgeProxy.sol";
import {IFeeAdapter} from "../../interfaces/everclear/IFeeAdapter.sol";

contract EverclearBridgeProxy is BridgeProxy {
  address public immutable feeAdapter;
  uint32 public immutable destinationDomainId;

  error NativeBridgeNotAllowed();

  constructor(
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy,
    address _feeAdapter,
    uint32 _destinationDomainId
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy) {
    feeAdapter = _feeAdapter;
    destinationDomainId = _destinationDomainId;
  }

  function getFeeParams(bytes calldata extraData) public view returns (IFeeAdapter.FeeParams memory) {
    (uint256 fee, uint256 deadline, bytes memory sig) = abi.decode(extraData, (uint256, uint256, bytes));
    return IFeeAdapter.FeeParams({
      fee: fee,
      deadline: deadline,
      sig: sig
    });
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

    // decode fees and sig from extraData
    IFeeAdapter.FeeParams memory feeParams = getFeeParams(extraData);

    // parse destination domains
    uint32[] memory destinations = new uint32[](1);
    destinations[0] = destinationDomainId;


    // create intent
    IFeeAdapter(feeAdapter).newIntent(
      destinations, // destinations
      L1_BRIDGE_PROXY, // receiver
      currency, // inputAsset
      l1Asset, // outputAsset
      amount, // amount
      0, // maxFee
      0, // ttl
      data, // data
      feeParams // feeParams
    );
  }

  /// @notice Receives native ETH for bridging operations
  /// @dev Required to receive ETH
  receive() external payable {}
}
