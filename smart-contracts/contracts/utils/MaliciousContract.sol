import {RelayBridge} from "../RelayBridge.sol";

contract MaliciousContract {
  function attackBridge(
    RelayBridge bridge,
    uint256 amount,
    address l1Asset
  ) public payable {
    uint nonce = bridge.bridge{value: amount}(amount, msg.sender, l1Asset);
    bridge.executeBridge(nonce);
  }
}
