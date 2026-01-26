// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title TimeBasedQuorumVault
 * @notice Multi-signature treasury vault with time-based and amount-based quorum requirements
 * @dev Implements dynamic quorum based on withdrawal amount, time windows, and action sensitivity
 */
contract TimeBasedQuorumVault is EIP712, ReentrancyGuard {
    using ECDSA for bytes32;

    // ============ Type Definitions ============

    /**
     * @dev Quorum tier structure
     * Defines rules for when this quorum applies
     */
    struct QuorumTier {
        uint256 minAmount;           // Minimum withdrawal amount for this tier (0 = always applies)
        uint256 maxAmount;           // Maximum withdrawal amount for this tier (0 = unlimited)
        uint256 requiredSignatures;  // Number of signatures required
        bool isActive;               // Whether this tier is active
        bool isSensitiveAction;      // Whether actions in this tier are considered sensitive
    }

    /**
     * @dev Time window for increased quorum
     * Applies higher quorum during specified times
     */
    struct TimeWindow {
        uint256 startHour;           // Start hour (0-23 UTC)
        uint256 endHour;             // End hour (0-23 UTC)
        uint256 requiredSignatures;  // Additional signatures required during this window
        bool isActive;               // Whether this window is active
        string reason;               // Description (e.g., "Trading hours")
    }

    /**
     * @dev Sensitive action flag structure
     */
    struct SensitiveAction {
        bool isNewRecipient;         // First withdrawal to this recipient
        bool isLargeAmount;          // Amount exceeds large threshold
        bool isOutsideNormalWindow;  // Withdrawal outside normal hours
        bool isMultiToken;           // Rare token or unusual token
        uint256 totalFlags;          // Count of flags
    }

    /**
     * @dev Withdrawal record for tracking
     */
    struct WithdrawalRecord {
        address token;
        uint256 amount;
        address recipient;
        uint256 timestamp;
        uint256 requiredQuorum;
        uint256 actualSignatures;
        string reason;
    }

    // ============ State Variables ============

    address public guardianToken;
    address public owner;
    uint256 public nonce;

    // Default quorum when no other rule applies
    uint256 public defaultQuorum = 2;

    // Thresholds for sensitivity detection
    uint256 public largeWithdrawalThreshold = 100e18; // 100 tokens
    uint256 public emergencyThreshold = 500e18;       // 500 tokens

    // Maximum and minimum possible quorum
    uint256 public maxQuorum = 5;
    uint256 public minQuorum = 1;

    // Tracking
    mapping(address => bool) public isApprovedRecipient;
    mapping(address => uint256) public lastWithdrawalTime;
    WithdrawalRecord[] public withdrawalHistory;

    // Quorum management
    QuorumTier[] public quorumTiers;
    TimeWindow[] public timeWindows;
    uint256 public nextTierId = 0;
    uint256 public nextTimeWindowId = 0;

    // ============ Events ============

    event QuorumTierCreated(
        uint256 indexed tierId,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 requiredSignatures,
        bool isSensitiveAction
    );

    event QuorumTierUpdated(
        uint256 indexed tierId,
        uint256 requiredSignatures,
        bool isActive
    );

    event TimeWindowCreated(
        uint256 indexed windowId,
        uint256 startHour,
        uint256 endHour,
        uint256 requiredSignatures,
        string reason
    );

    event TimeWindowUpdated(
        uint256 indexed windowId,
        bool isActive
    );

    event WithdrawalExecuted(
        address indexed token,
        uint256 amount,
        address indexed recipient,
        uint256 requiredQuorum,
        uint256 actualSignatures,
        string reason
    );

    event QuorumIncreased(
        uint256 baseQuorum,
        uint256 finalQuorum,
        string reason
    );

    event RecipientApproved(
        address indexed recipient,
        bool isApproved
    );

    event ThresholdUpdated(
        string indexed thresholdType,
        uint256 oldValue,
        uint256 newValue
    );

    // ============ Constructor ============

    constructor(address _guardianToken) EIP712("SpendGuard-TimeBasedQuorum", "1") {
        require(_guardianToken != address(0), "Invalid guardian token");
        guardianToken = _guardianToken;
        owner = msg.sender;
        nonce = 0;

        // Initialize default tiers
        _createDefaultQuorumTiers();
    }

    // ============ Quorum Management ============

    /**
     * @notice Create a new quorum tier based on withdrawal amount
     * @param minAmount Minimum withdrawal amount (0 = always applies)
     * @param maxAmount Maximum withdrawal amount (0 = unlimited)
     * @param requiredSignatures Required signatures for this tier
     * @param isSensitiveAction Whether actions in this tier are sensitive
     */
    function createQuorumTier(
        uint256 minAmount,
        uint256 maxAmount,
        uint256 requiredSignatures,
        bool isSensitiveAction
    ) external onlyOwner {
        require(requiredSignatures >= minQuorum, "Below minimum quorum");
        require(requiredSignatures <= maxQuorum, "Exceeds maximum quorum");
        require(
            maxAmount == 0 || maxAmount > minAmount,
            "Invalid amount range"
        );

        QuorumTier memory tier = QuorumTier({
            minAmount: minAmount,
            maxAmount: maxAmount,
            requiredSignatures: requiredSignatures,
            isActive: true,
            isSensitiveAction: isSensitiveAction
        });

        quorumTiers.push(tier);
        emit QuorumTierCreated(
            nextTierId,
            minAmount,
            maxAmount,
            requiredSignatures,
            isSensitiveAction
        );
        nextTierId++;
    }

    /**
     * @notice Update an existing quorum tier
     * @param tierId ID of the tier to update
     * @param requiredSignatures New required signatures
     * @param isActive Whether tier is active
     */
    function updateQuorumTier(
        uint256 tierId,
        uint256 requiredSignatures,
        bool isActive
    ) external onlyOwner {
        require(tierId < quorumTiers.length, "Invalid tier ID");
        require(requiredSignatures >= minQuorum, "Below minimum quorum");
        require(requiredSignatures <= maxQuorum, "Exceeds maximum quorum");

        quorumTiers[tierId].requiredSignatures = requiredSignatures;
        quorumTiers[tierId].isActive = isActive;

        emit QuorumTierUpdated(tierId, requiredSignatures, isActive);
    }

    /**
     * @notice Create a time window with increased quorum requirements
     * @param startHour Start hour (0-23 UTC)
     * @param endHour End hour (0-23 UTC)
     * @param additionalSignatures Additional signatures required during this window
     * @param reason Description of the time window
     */
    function createTimeWindow(
        uint256 startHour,
        uint256 endHour,
        uint256 additionalSignatures,
        string memory reason
    ) external onlyOwner {
        require(startHour < 24, "Invalid start hour");
        require(endHour < 24, "Invalid end hour");
        require(additionalSignatures > 0, "At least 1 additional signature");

        TimeWindow memory window = TimeWindow({
            startHour: startHour,
            endHour: endHour,
            requiredSignatures: additionalSignatures,
            isActive: true,
            reason: reason
        });

        timeWindows.push(window);
        emit TimeWindowCreated(
            nextTimeWindowId,
            startHour,
            endHour,
            additionalSignatures,
            reason
        );
        nextTimeWindowId++;
    }

    /**
     * @notice Update a time window
     * @param windowId ID of the window to update
     * @param isActive Whether window is active
     */
    function updateTimeWindow(
        uint256 windowId,
        bool isActive
    ) external onlyOwner {
        require(windowId < timeWindows.length, "Invalid window ID");
        timeWindows[windowId].isActive = isActive;
        emit TimeWindowUpdated(windowId, isActive);
    }

    /**
     * @notice Set threshold for large withdrawal detection
     * @param newThreshold New threshold amount
     */
    function setLargeWithdrawalThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be positive");
        uint256 oldValue = largeWithdrawalThreshold;
        largeWithdrawalThreshold = newThreshold;
        emit ThresholdUpdated("largeWithdrawal", oldValue, newThreshold);
    }

    /**
     * @notice Set threshold for emergency amounts
     * @param newThreshold New threshold amount
     */
    function setEmergencyThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be positive");
        uint256 oldValue = emergencyThreshold;
        emergencyThreshold = newThreshold;
        emit ThresholdUpdated("emergency", oldValue, newThreshold);
    }

    /**
     * @notice Approve a recipient address (reduces sensitivity)
     * @param recipient Address to approve
     */
    function approveRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        isApprovedRecipient[recipient] = true;
        emit RecipientApproved(recipient, true);
    }

    /**
     * @notice Revoke recipient approval
     * @param recipient Address to revoke
     */
    function revokeRecipient(address recipient) external onlyOwner {
        isApprovedRecipient[recipient] = false;
        emit RecipientApproved(recipient, false);
    }

    // ============ Quorum Calculation ============

    /**
     * @notice Calculate required quorum for a withdrawal
     * @param token Token address
     * @param amount Withdrawal amount
     * @param recipient Recipient address
     * @return requiredQuorum Number of signatures required
     * @return sensitiveAction Whether action is sensitive
     */
    function calculateRequiredQuorum(
        address token,
        uint256 amount,
        address recipient
    ) public view returns (uint256 requiredQuorum, bool sensitiveAction) {
        // Start with default quorum
        uint256 baseQuorum = defaultQuorum;

        // Check amount-based tier
        uint256 tierQuorum = _getQuorumFromTier(amount);
        if (tierQuorum > baseQuorum) {
            baseQuorum = tierQuorum;
        }

        // Check if this is a sensitive action
        SensitiveAction memory sensitive = _detectSensitiveAction(
            token,
            amount,
            recipient
        );

        if (sensitive.totalFlags > 0) {
            sensitiveAction = true;
            // Escalate quorum based on number of sensitivity flags
            uint256 escalation = sensitive.totalFlags;
            baseQuorum = baseQuorum + escalation;
            if (baseQuorum > maxQuorum) {
                baseQuorum = maxQuorum;
            }
        }

        // Check time window
        uint256 timeWindowQuorum = _getTimeWindowQuorum();
        if (timeWindowQuorum > baseQuorum) {
            baseQuorum = timeWindowQuorum;
        }

        requiredQuorum = baseQuorum;
    }

    /**
     * @notice Get quorum required based on withdrawal amount tier
     * @param amount Withdrawal amount
     * @return requiredQuorum Quorum from tier, or 0 if no match
     */
    function _getQuorumFromTier(uint256 amount) internal view returns (uint256) {
        uint256 maxQuorumForAmount = 0;

        for (uint256 i = 0; i < quorumTiers.length; i++) {
            QuorumTier memory tier = quorumTiers[i];
            if (!tier.isActive) continue;

            // Check if amount falls in this tier's range
            bool inRange = (tier.minAmount <= amount);
            if (tier.maxAmount > 0) {
                inRange = inRange && (amount <= tier.maxAmount);
            }

            if (inRange) {
                if (tier.requiredSignatures > maxQuorumForAmount) {
                    maxQuorumForAmount = tier.requiredSignatures;
                }
            }
        }

        return maxQuorumForAmount;
    }

    /**
     * @notice Get additional quorum required from time windows
     * @return additionalQuorum Quorum from time window, or 0 if not in window
     */
    function _getTimeWindowQuorum() internal view returns (uint256) {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        uint256 maxAdditional = 0;

        for (uint256 i = 0; i < timeWindows.length; i++) {
            TimeWindow memory window = timeWindows[i];
            if (!window.isActive) continue;

            bool inWindow;
            if (window.startHour <= window.endHour) {
                // Normal case: e.g., 9-17
                inWindow = (currentHour >= window.startHour &&
                    currentHour < window.endHour);
            } else {
                // Wrap around: e.g., 22-6 (overnight)
                inWindow = (currentHour >= window.startHour ||
                    currentHour < window.endHour);
            }

            if (inWindow) {
                if (window.requiredSignatures > maxAdditional) {
                    maxAdditional = window.requiredSignatures;
                }
            }
        }

        return maxAdditional;
    }

    /**
     * @notice Detect if a withdrawal is sensitive (unusual/risky)
     * @param token Token being withdrawn
     * @param amount Withdrawal amount
     * @param recipient Target recipient
     * @return sensitive Sensitivity flags
     */
    function _detectSensitiveAction(
        address token,
        uint256 amount,
        address recipient
    ) internal view returns (SensitiveAction memory sensitive) {
        sensitive.totalFlags = 0;

        // Flag 1: New recipient (never withdrawn to before)
        if (!isApprovedRecipient[recipient]) {
            sensitive.isNewRecipient = true;
            sensitive.totalFlags++;
        }

        // Flag 2: Large amount relative to threshold
        if (amount >= largeWithdrawalThreshold) {
            sensitive.isLargeAmount = true;
            sensitive.totalFlags++;
        }

        // Flag 3: Outside normal hours (assume 6am-10pm is normal)
        uint256 currentHour = (block.timestamp / 3600) % 24;
        if (currentHour < 6 || currentHour >= 22) {
            sensitive.isOutsideNormalWindow = true;
            sensitive.totalFlags++;
        }

        // Flag 4: Emergency-level amount
        if (amount >= emergencyThreshold) {
            sensitive.isMultiToken = true;
            sensitive.totalFlags++;
        }
    }

    // ============ Deposit & Withdrawal ============

    /**
     * @notice Receive ETH deposits
     */
    receive() external payable {}

    /**
     * @notice Deposit ERC-20 tokens
     * @param token Token address
     * @param amount Amount to deposit
     */
    function deposit(address token, uint256 amount) external {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be positive");

        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice Execute a withdrawal with guardian signatures
     * @param token Token address (address(0) for ETH)
     * @param amount Withdrawal amount
     * @param recipient Recipient address
     * @param reason Reason for withdrawal
     * @param signatures Packed signatures from guardians
     */
    function withdraw(
        address token,
        uint256 amount,
        address recipient,
        string calldata reason,
        bytes[] calldata signatures
    ) external nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");

        // Calculate required quorum
        (uint256 requiredQuorum, ) = calculateRequiredQuorum(
            token,
            amount,
            recipient
        );

        require(
            signatures.length >= requiredQuorum,
            "Insufficient signatures"
        );

        // Verify signatures
        bytes32 messageHash = _hashWithdrawal(
            token,
            amount,
            recipient,
            nonce,
            reason
        );

        address[] memory signers = new address[](signatures.length);
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = messageHash.recover(signatures[i]);
            require(_isGuardian(signer), "Signer not a guardian");

            // Prevent duplicate signatures
            for (uint256 j = 0; j < i; j++) {
                require(signers[j] != signer, "Duplicate signature");
            }
            signers[i] = signer;
        }

        // Execute withdrawal
        nonce++;
        lastWithdrawalTime[recipient] = block.timestamp;

        // Record withdrawal
        withdrawalHistory.push(
            WithdrawalRecord({
                token: token,
                amount: amount,
                recipient: recipient,
                timestamp: block.timestamp,
                requiredQuorum: requiredQuorum,
                actualSignatures: signatures.length,
                reason: reason
            })
        );

        // Transfer funds
        if (token == address(0)) {
            // ETH transfer
            (bool success, ) = payable(recipient).call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC-20 transfer
            IERC20(token).transfer(recipient, amount);
        }

        emit WithdrawalExecuted(
            token,
            amount,
            recipient,
            requiredQuorum,
            signatures.length,
            reason
        );
    }

    // ============ View Functions ============

    /**
     * @notice Get ETH balance
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get ERC-20 token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @notice Get domain separator for EIP-712
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @notice Get all quorum tiers
     */
    function getQuorumTiers() external view returns (QuorumTier[] memory) {
        return quorumTiers;
    }

    /**
     * @notice Get all time windows
     */
    function getTimeWindows() external view returns (TimeWindow[] memory) {
        return timeWindows;
    }

    /**
     * @notice Get withdrawal history count
     */
    function getWithdrawalHistoryLength() external view returns (uint256) {
        return withdrawalHistory.length;
    }

    /**
     * @notice Get withdrawal record by index
     */
    function getWithdrawalRecord(uint256 index)
        external
        view
        returns (WithdrawalRecord memory)
    {
        require(index < withdrawalHistory.length, "Invalid index");
        return withdrawalHistory[index];
    }

    /**
     * @notice Get recent withdrawals (last N)
     */
    function getRecentWithdrawals(uint256 count)
        external
        view
        returns (WithdrawalRecord[] memory)
    {
        uint256 start = withdrawalHistory.length > count
            ? withdrawalHistory.length - count
            : 0;
        WithdrawalRecord[] memory recent = new WithdrawalRecord[](
            withdrawalHistory.length - start
        );

        for (uint256 i = start; i < withdrawalHistory.length; i++) {
            recent[i - start] = withdrawalHistory[i];
        }

        return recent;
    }

    /**
     * @notice Check if address is a guardian
     */
    function _isGuardian(address account) internal view returns (bool) {
        return IERC721(guardianToken).balanceOf(account) > 0;
    }

    // ============ Internal Functions ============

    /**
     * @notice Hash a withdrawal for EIP-712
     */
    function _hashWithdrawal(
        address token,
        uint256 amount,
        address recipient,
        uint256 _nonce,
        string memory reason
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Withdrawal(address token,uint256 amount,address recipient,uint256 nonce,string reason)"
                        ),
                        token,
                        amount,
                        recipient,
                        _nonce,
                        keccak256(abi.encodePacked(reason))
                    )
                )
            );
    }

    /**
     * @notice Create default quorum tiers on deployment
     */
    function _createDefaultQuorumTiers() internal {
        // Tier 1: Small amounts (0-50 tokens) - require 1 signature
        quorumTiers.push(
            QuorumTier({
                minAmount: 0,
                maxAmount: 50e18,
                requiredSignatures: 1,
                isActive: true,
                isSensitiveAction: false
            })
        );

        // Tier 2: Medium amounts (50-200 tokens) - require 2 signatures
        quorumTiers.push(
            QuorumTier({
                minAmount: 50e18,
                maxAmount: 200e18,
                requiredSignatures: 2,
                isActive: true,
                isSensitiveAction: false
            })
        );

        // Tier 3: Large amounts (200-500 tokens) - require 3 signatures
        quorumTiers.push(
            QuorumTier({
                minAmount: 200e18,
                maxAmount: 500e18,
                requiredSignatures: 3,
                isActive: true,
                isSensitiveAction: true
            })
        );

        // Tier 4: Huge amounts (500+ tokens) - require 4-5 signatures
        quorumTiers.push(
            QuorumTier({
                minAmount: 500e18,
                maxAmount: 0,
                requiredSignatures: 4,
                isActive: true,
                isSensitiveAction: true
            })
        );

        nextTierId = 4;
    }

    // ============ Owner Functions ============

    /**
     * @notice Update guardian token address
     */
    function updateGuardianToken(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Invalid address");
        guardianToken = _newAddress;
    }

    /**
     * @notice Update default quorum
     */
    function setDefaultQuorum(uint256 _newQuorum) external onlyOwner {
        require(_newQuorum >= minQuorum, "Below minimum");
        require(_newQuorum <= maxQuorum, "Exceeds maximum");
        defaultQuorum = _newQuorum;
    }

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
}
