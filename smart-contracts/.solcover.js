module.exports = {
  skipFiles: [
    './utils',
    './interfaces',
    // covered in forked tests
    './BridgeProxy/ArbitrumOrbitNativeBridgeProxy.sol',
    './BridgeProxy/CCTPBridgeProxy.sol',
    './BridgeProxy/OPStackNativeBridgeProxy.sol',
    './BridgeProxy/ZkSyncBridgeProxy.sol',
    './TokenSwap.sol',
  ],
}
