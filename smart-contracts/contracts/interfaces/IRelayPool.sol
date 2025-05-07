// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
interface IRelayPool is IERC4626 {
    struct OriginSettings {
        uint32 chainId;
        address bridge;
        address curator;
        uint256 maxDebt;
        uint256 outstandingDebt;
        address proxyBridge;
        uint32 bridgeFee; // fractional basis points
        uint32 coolDown; // in seconds
    }

    struct OriginParam {
        address curator;
        uint32 chainId;
        address bridge;
        address proxyBridge;
        uint256 maxDebt;
        uint32 bridgeFee; // fractional basis points
        uint32 coolDown; // in seconds
    }

    // Events
    event LoanEmitted(
        uint256 indexed nonce,
        address indexed recipient,
        ERC20 asset,
        uint256 amount,
        OriginSettings origin,
        uint256 fees
    );

    event BridgeCompleted(
        uint32 chainId,
        address indexed bridge,
        uint256 amount,
        uint256 fees
    );

    event OutstandingDebtChanged(
        uint256 oldDebt,
        uint256 newDebt,
        OriginSettings origin,
        uint256 oldOriginDebt,
        uint256 newOriginDebt
    );

    event AssetsDepositedIntoYieldPool(uint256 amount, address yieldPool);
    event AssetsWithdrawnFromYieldPool(uint256 amount, address yieldPool);
    event TokenSwapChanged(address prevAddress, address newAddress);
    event YieldPoolChanged(address oldPool, address newPool);
    event OriginDisabled(
        uint32 chainId,
        address bridge,
        uint256 maxDebt,
        uint256 outstandingDebt,
        address proxyBridge
    );

    event OriginAdded(OriginParam origin);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event StreamingPeriodChanged(uint256 oldPeriod, uint256 newPeriod);

    error FailedTransfer(address recipient, uint256 amount);
    error InsufficientFunds(uint256 amount, uint256 balance);
    error MessageAlreadyProcessed(uint32 chainId, address bridge, uint256 nonce);
    error MessageTooRecent(uint32 chainId, address bridge, uint256 nonce, uint256 timestamp, uint32 coolDown);
    error NotAWethPool();
    error OwnableInvalidOwner(address owner);
    error OwnableUnauthorizedAccount(address account);
    error SafeERC20FailedOperation(address token);
    error SharePriceTooHigh(uint256 actualPrice, uint256 maxPrice);
    error SharePriceTooLow(uint256 actualPrice, uint256 minPrice);
    error TooMuchDebtFromOrigin(uint32 chainId, address bridge, uint256 maxDebt, uint256 nonce, address recipient, uint256 amount);
    error UnauthorizedCaller(address sender);
    error UnauthorizedOrigin(uint32 chainId, address bridge);
    error UnauthorizedSwap(address token);

    // View functions
    function HYPERLANE_MAILBOX() external view returns (address);
    function WETH() external view returns (address);
    function FRACTIONAL_BPS_DENOMINATOR() external view returns (uint256);
    function outstandingDebt() external view returns (uint256);
    function authorizedOrigins(uint32 chainId, address bridge) external view returns (OriginSettings memory);
    function messages(uint32 chainId, address bridge, uint256 nonce) external view returns (bytes memory);
    function yieldPool() external view returns (address);
    function tokenSwapAddress() external view returns (address);
    function pendingBridgeFees() external view returns (uint256);
    function totalAssetsToStream() external view returns (uint256);
    function lastAssetsCollectedAt() external view returns (uint256);
    function endOfStream() external view returns (uint256);
    function streamingPeriod() external view returns (uint256);
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function nonces(address owner) external view returns (uint256);
    function owner() external view returns (address);
    
    // State changing functions
    function handle(uint32 chainId,
        bytes32 bridgeAddress,
        bytes calldata data
    ) external payable;
    function claim(uint32 chainId, address bridge) external returns (uint256);
    function disableOrigin(uint32 chainId, address bridge) external;
    function updateStreamedAssets() external returns (uint256);
    function setTokenSwap(address newTokenSwap) external;
    function addOrigin(OriginParam calldata param) external;
    function collectNonDepositedAssets() external;
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
    function processFailedHandler(uint32 chainId, address bridge, bytes calldata data) external;
    function renounceOwnership() external;
    function swapAndDeposit(address token, uint256 amount, uint24 uniswapWethPoolFeeToken, uint24 uniswapWethPoolFeeAsset, uint48 deadline, uint256 amountOutMinimum) external;
    function transferOwnership(address newOwner) external;
    function updateStreamingPeriod(uint256 newPeriod) external;
    function updateYieldPool(address newPool, uint256 minSharePriceFromOldPool, uint256 maxSharePricePriceFromNewPool) external;
} 