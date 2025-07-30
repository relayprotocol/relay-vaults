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


function getIntentParams(bytes calldata extraData) public view returns (uint24, uint48, bytes memory) {
    (uint24 maxFee, uint48 ttl, bytes memory moreData) = abi.decode(extraData, (uint24, uint48, bytes));
    return (maxFee, ttl, moreData);
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

    // unpack intent params from extraData
    (uint24 maxFee, uint48 ttl, bytes memory moreData) = getIntentParams(extraData);

    // create intent
    IEverclearSpoke(EVERCLEAR_SPOKE).newIntent(
      destinations, // destinations 
      L1_BRIDGE_PROXY, // receiver
      currency, // inputAsset
      l1Asset, // outputAsset
      amount, // amount
      maxFee, // maxFee
      ttl, // ttl
      moreData // data
    );
  }

  /// @notice Receives native ETH for bridging operations
  /// @dev Required to receive ETH
  receive() external payable {}
}
