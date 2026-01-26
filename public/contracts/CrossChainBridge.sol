// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CrossChainBridge
 * @dev Enables token distribution across multiple blockchain networks
 * Supports Ethereum, Arbitrum, Optimism, and other EVM-compatible chains
 */
contract CrossChainBridge is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Chain configuration
    enum Chain {
        ETHEREUM,
        ARBITRUM,
        OPTIMISM,
        POLYGON,
        AVALANCHE,
        BASE
    }

    struct ChainConfig {
        uint256 chainId;
        string name;
        address bridgeAddress;
        bool enabled;
        uint256 minBridgeAmount;
        uint256 maxBridgeAmount;
        uint256 bridgeFee; // in basis points (e.g., 50 = 0.5%)
    }

    struct BridgeTransaction {
        uint256 id;
        address sender;
        address token;
        uint256 amount;
        Chain sourceChain;
        Chain destinationChain;
        address recipient;
        uint256 timestamp;
        bool completed;
        bytes32 txHash;
    }

    struct TokenBridge {
        address sourceToken;
        address destinationToken;
        bool enabled;
        uint256 minAmount;
        uint256 maxAmount;
    }

    // State variables
    mapping(Chain => ChainConfig) public chainConfigs;
    mapping(uint256 => BridgeTransaction) public bridgeTransactions;
    mapping(address => mapping(Chain => address)) public tokenBridges;
    mapping(address => uint256[]) public userBridgeHistory;
    
    uint256 public nextBridgeId = 1;
    address public feeRecipient;
    uint256 public totalBridged;

    // Events
    event BridgeInitiated(
        uint256 indexed bridgeId,
        address indexed sender,
        address indexed token,
        uint256 amount,
        Chain sourceChain,
        Chain destinationChain,
        address recipient
    );

    event BridgeCompleted(
        uint256 indexed bridgeId,
        address indexed recipient,
        uint256 amount,
        Chain destinationChain,
        bytes32 txHash
    );

    event BridgeFailed(
        uint256 indexed bridgeId,
        string reason
    );

    event ChainConfigUpdated(
        Chain indexed chain,
        address bridgeAddress,
        bool enabled
    );

    event TokenBridgeRegistered(
        address indexed sourceToken,
        address indexed destinationToken,
        Chain destinationChain
    );

    // Modifiers
    modifier chainEnabled(Chain chain) {
        require(chainConfigs[chain].enabled, "Chain not enabled");
        _;
    }

    modifier validBridgeAmount(uint256 amount, Chain chain) {
        ChainConfig storage config = chainConfigs[chain];
        require(amount >= config.minBridgeAmount, "Amount below minimum");
        require(amount <= config.maxBridgeAmount, "Amount exceeds maximum");
        _;
    }

    /**
     * @dev Initialize bridge with supported chains
     */
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        _initializeChains();
    }

    /**
     * @dev Initialize default chain configurations
     */
    function _initializeChains() internal {
        // Ethereum mainnet
        chainConfigs[Chain.ETHEREUM] = ChainConfig({
            chainId: 1,
            name: "Ethereum",
            bridgeAddress: address(0),
            enabled: true,
            minBridgeAmount: 1e18,
            maxBridgeAmount: 1000000e18,
            bridgeFee: 30 // 0.3%
        });

        // Arbitrum One
        chainConfigs[Chain.ARBITRUM] = ChainConfig({
            chainId: 42161,
            name: "Arbitrum One",
            bridgeAddress: address(0),
            enabled: true,
            minBridgeAmount: 1e18,
            maxBridgeAmount: 1000000e18,
            bridgeFee: 20 // 0.2%
        });

        // Optimism
        chainConfigs[Chain.OPTIMISM] = ChainConfig({
            chainId: 10,
            name: "Optimism",
            bridgeAddress: address(0),
            enabled: true,
            minBridgeAmount: 1e18,
            maxBridgeAmount: 1000000e18,
            bridgeFee: 20 // 0.2%
        });

        // Polygon
        chainConfigs[Chain.POLYGON] = ChainConfig({
            chainId: 137,
            name: "Polygon",
            bridgeAddress: address(0),
            enabled: true,
            minBridgeAmount: 1e18,
            maxBridgeAmount: 1000000e18,
            bridgeFee: 10 // 0.1%
        });

        // Avalanche
        chainConfigs[Chain.AVALANCHE] = ChainConfig({
            chainId: 43114,
            name: "Avalanche",
            bridgeAddress: address(0),
            enabled: true,
            minBridgeAmount: 1e18,
            maxBridgeAmount: 1000000e18,
            bridgeFee: 15 // 0.15%
        });

        // Base
        chainConfigs[Chain.BASE] = ChainConfig({
            chainId: 8453,
            name: "Base",
            bridgeAddress: address(0),
            enabled: true,
            minBridgeAmount: 1e18,
            maxBridgeAmount: 1000000e18,
            bridgeFee: 10 // 0.1%
        });
    }

    /**
     * @dev Initiate a cross-chain token bridge
     */
    function bridgeTokens(
        address token,
        uint256 amount,
        Chain sourceChain,
        Chain destinationChain,
        address recipient
    )
        external
        nonReentrant
        whenNotPaused
        chainEnabled(destinationChain)
        validBridgeAmount(amount, destinationChain)
        returns (uint256 bridgeId)
    {
        require(sourceChain != destinationChain, "Same chain bridge");
        require(token != address(0), "Invalid token");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        // Transfer tokens from sender
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Calculate bridge fee
        uint256 fee = (amount * chainConfigs[destinationChain].bridgeFee) / 10000;
        uint256 bridgeAmount = amount - fee;

        // Create bridge transaction
        bridgeId = nextBridgeId++;
        BridgeTransaction storage txn = bridgeTransactions[bridgeId];
        txn.id = bridgeId;
        txn.sender = msg.sender;
        txn.token = token;
        txn.amount = bridgeAmount;
        txn.sourceChain = sourceChain;
        txn.destinationChain = destinationChain;
        txn.recipient = recipient;
        txn.timestamp = block.timestamp;
        txn.completed = false;

        // Track user history
        userBridgeHistory[msg.sender].push(bridgeId);

        // Transfer fee to fee recipient
        if (fee > 0) {
            IERC20(token).safeTransfer(feeRecipient, fee);
        }

        totalBridged += bridgeAmount;

        emit BridgeInitiated(
            bridgeId,
            msg.sender,
            token,
            bridgeAmount,
            sourceChain,
            destinationChain,
            recipient
        );
    }

    /**
     * @dev Complete a bridge transaction (called by relayer or oracle)
     */
    function completeBridge(
        uint256 bridgeId,
        bytes32 txHash
    )
        external
        onlyOwner
        nonReentrant
    {
        BridgeTransaction storage txn = bridgeTransactions[bridgeId];
        require(!txn.completed, "Bridge already completed");
        require(txn.recipient != address(0), "Invalid bridge");

        txn.completed = true;
        txn.txHash = txHash;

        emit BridgeCompleted(
            bridgeId,
            txn.recipient,
            txn.amount,
            txn.destinationChain,
            txHash
        );
    }

    /**
     * @dev Fail a bridge transaction and refund tokens
     */
    function failBridge(
        uint256 bridgeId,
        string calldata reason
    )
        external
        onlyOwner
        nonReentrant
    {
        BridgeTransaction storage txn = bridgeTransactions[bridgeId];
        require(!txn.completed, "Bridge already completed");
        require(txn.sender != address(0), "Invalid bridge");

        // Refund tokens to original sender
        IERC20(txn.token).safeTransfer(txn.sender, txn.amount);

        txn.completed = true;

        emit BridgeFailed(bridgeId, reason);
    }

    /**
     * @dev Register a token bridge pair
     */
    function registerTokenBridge(
        address sourceToken,
        address destinationToken,
        Chain destinationChain,
        uint256 minAmount,
        uint256 maxAmount
    )
        external
        onlyOwner
    {
        require(sourceToken != address(0), "Invalid source token");
        require(destinationToken != address(0), "Invalid destination token");
        require(chainConfigs[destinationChain].enabled, "Chain not enabled");
        require(minAmount < maxAmount, "Invalid amount bounds");

        tokenBridges[sourceToken][destinationChain] = destinationToken;

        emit TokenBridgeRegistered(
            sourceToken,
            destinationToken,
            destinationChain
        );
    }

    /**
     * @dev Update chain configuration
     */
    function updateChainConfig(
        Chain chain,
        address bridgeAddress,
        bool enabled,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 fee
    )
        external
        onlyOwner
    {
        ChainConfig storage config = chainConfigs[chain];
        config.bridgeAddress = bridgeAddress;
        config.enabled = enabled;
        config.minBridgeAmount = minAmount;
        config.maxBridgeAmount = maxAmount;
        config.bridgeFee = fee;

        emit ChainConfigUpdated(chain, bridgeAddress, enabled);
    }

    /**
     * @dev Get user's bridge history
     */
    function getUserBridgeHistory(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userBridgeHistory[user];
    }

    /**
     * @dev Get bridge transaction details
     */
    function getBridgeTransaction(uint256 bridgeId)
        external
        view
        returns (BridgeTransaction memory)
    {
        return bridgeTransactions[bridgeId];
    }

    /**
     * @dev Get chain configuration
     */
    function getChainConfig(Chain chain)
        external
        view
        returns (ChainConfig memory)
    {
        return chainConfigs[chain];
    }

    /**
     * @dev Pause bridge operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Resume bridge operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    /**
     * @dev Emergency withdraw of tokens
     */
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
