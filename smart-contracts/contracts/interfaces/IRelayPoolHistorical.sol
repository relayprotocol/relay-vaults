// The role of this interface is to preserve signatures that have been used in the past
// and may be in use in the wild.
// We keep it in the codebase to allow tracking and indexing of deprecated events.

import {IRelayPool} from "./IRelayPool.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
interface IRelayPoolHistorical is IRelayPool {

  // bridgeFee was uint16 (uint32 since #373 / 1b061b0)
  struct OriginSettingsDeprecated {
    uint32 chainId;
    address bridge;
    address curator;
    uint256 maxDebt;
    uint256 outstandingDebt;
    address proxyBridge;
    uint16 bridgeFee; // basis points
    uint32 coolDown; // in seconds
  }

  struct OriginParamDeprecated {
    address curator;
    uint32 chainId;
    address bridge;
    address proxyBridge;
    uint256 maxDebt;
    uint16 bridgeFee; // basis points
    uint32 coolDown; // in seconds
  }

  event OriginAdded(OriginParamDeprecated origin);
  event LoanEmitted(
        uint256 indexed nonce,
        address indexed recipient,
        ERC20 asset,
        uint256 amount,
        OriginSettingsDeprecated origin,
        uint256 fees
    );
  event OutstandingDebtChanged(
        uint256 oldDebt,
        uint256 newDebt,
        OriginSettingsDeprecated origin,
        uint256 oldOriginDebt,
        uint256 newOriginDebt
    );
}