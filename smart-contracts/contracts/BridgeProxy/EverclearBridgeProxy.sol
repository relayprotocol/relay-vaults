// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BridgeProxy} from "./BridgeProxy.sol";
import {IEverclearSpoke} from "../interfaces/everclear/IEverclearSpoke.sol";

contract EverclearBridgeProxy is BridgeProxy {
  address public immutable EVERCLEAR_SPOKE;
  uint32 public immutable DESTINATION_DOMAIN_ID;

  error NativeBridgeNotAllowed();

  constructor(
    uint256 relayPoolChainId,
    address relayPool,
    address l1BridgeProxy,
    address _everclearSpoke,
    uint32 _destinationDomainId
  ) BridgeProxy(relayPoolChainId, relayPool, l1BridgeProxy) {
    EVERCLEAR_SPOKE = _everclearSpoke;
    DESTINATION_DOMAIN_ID = _destinationDomainId;
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

    // parse destination domains
    uint32[] memory destinations = new uint32[](1);
    destinations[0] = DESTINATION_DOMAIN_ID;


    // create intent
    IEverclearSpoke(EVERCLEAR_SPOKE).newIntent(
      destinations, // destinations 
      L1_BRIDGE_PROXY, // receiver
      currency, // inputAsset
      l1Asset, // outputAsset
      amount, // amount
      500, // maxFee
      0, // ttl
      data // data
    );
  }

  /// @notice Receives native ETH for bridging operations
  /// @dev Required to receive ETH
  receive() external payable {}
}
