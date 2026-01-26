// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RecipientWhitelist
 * @dev Manages approved recipient addresses for vault withdrawals
 * @notice Only whitelisted addresses can receive funds (unless emergency mode active)
 */
contract RecipientWhitelist is Ownable, ReentrancyGuard {
    
    // ============ Data Structures ============
    
    /**
     * @dev Whitelist entry for a recipient
     * @param isWhitelisted Whether address is approved to receive funds
     * @param name Description of the recipient (e.g., "Treasury", "Team Account")
     * @param addedAt Timestamp when recipient was added
     * @param dailyLimit Daily withdrawal limit for this recipient (0 = unlimited)
     */
    struct WhitelistEntry {
        bool isWhitelisted;
        string name;
        uint256 addedAt;
        uint256 dailyLimit;
    }

    /**
     * @dev Recipient spending for daily limit tracking
     */
    struct RecipientSpending {
        uint256 dailyAmount;
        uint256 lastResetDay;
    }

    // ============ Storage ============
    
    // vault -> recipient -> WhitelistEntry
    mapping(address => mapping(address => WhitelistEntry)) public whitelistedRecipients;
    
    // vault -> recipient -> token -> RecipientSpending
    mapping(address => mapping(address => mapping(address => RecipientSpending))) public recipientSpending;
    
    // vault -> array of whitelisted addresses
    mapping(address => address[]) public whitelistedAddresses;
    
    // vault -> emergency mode active
    mapping(address => bool) public emergencyModeActive;
    
    // vault -> emergency mode enabled by
    mapping(address => address) public emergencyModeActivatedBy;
    
    // vault -> emergency mode activation timestamp
    mapping(address => uint256) public emergencyModeActivatedAt;
    
    // Constants
    uint256 constant ONE_DAY = 86400;

    // ============ Events ============
    
    event RecipientAdded(
        address indexed vault,
        address indexed recipient,
        string name,
        uint256 dailyLimit,
        uint256 timestamp
    );
    
    event RecipientRemoved(
        address indexed vault,
        address indexed recipient,
        uint256 timestamp
    );
    
    event RecipientLimitUpdated(
        address indexed vault,
        address indexed recipient,
        uint256 newDailyLimit,
        uint256 timestamp
    );
    
    event EmergencyModeActivated(
        address indexed vault,
        address indexed activatedBy,
        uint256 timestamp
    );
    
    event EmergencyModeDeactivated(
        address indexed vault,
        address indexed deactivatedBy,
        uint256 timestamp
    );
    
    event WithdrawalToRecipient(
        address indexed vault,
        address indexed recipient,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );
    
    event WithdrawalRejected(
        address indexed vault,
        address indexed recipient,
        string reason,
        uint256 timestamp
    );

    // ============ Modifiers ============
    
    modifier vaultOnly(address vault) {
        require(msg.sender == vault, "RecipientWhitelist: Only vault can call");
        _;
    }

    // ============ Owner Functions - Recipient Management ============
    
    /**
     * @notice Add a recipient to the whitelist
     * @param vault Vault address
     * @param recipient Recipient address to approve
     * @param name Description of recipient
     * @param dailyLimit Daily withdrawal limit (0 = unlimited)
     */
    function addRecipient(
        address vault,
        address recipient,
        string memory name,
        uint256 dailyLimit
    ) external onlyOwner nonReentrant {
        require(vault != address(0), "RecipientWhitelist: Invalid vault");
        require(recipient != address(0), "RecipientWhitelist: Invalid recipient");
        require(!whitelistedRecipients[vault][recipient].isWhitelisted, 
                "RecipientWhitelist: Already whitelisted");
        
        whitelistedRecipients[vault][recipient] = WhitelistEntry({
            isWhitelisted: true,
            name: name,
            addedAt: block.timestamp,
            dailyLimit: dailyLimit
        });
        
        whitelistedAddresses[vault].push(recipient);
        
        emit RecipientAdded(vault, recipient, name, dailyLimit, block.timestamp);
    }
    
    /**
     * @notice Remove a recipient from the whitelist
     * @param vault Vault address
     * @param recipient Recipient address to remove
     */
    function removeRecipient(
        address vault,
        address recipient
    ) external onlyOwner nonReentrant {
        require(vault != address(0), "RecipientWhitelist: Invalid vault");
        require(whitelistedRecipients[vault][recipient].isWhitelisted,
                "RecipientWhitelist: Not whitelisted");
        
        whitelistedRecipients[vault][recipient].isWhitelisted = false;
        
        emit RecipientRemoved(vault, recipient, block.timestamp);
    }
    
    /**
     * @notice Update daily limit for a recipient
     * @param vault Vault address
     * @param recipient Recipient address
     * @param newDailyLimit New daily limit (0 = unlimited)
     */
    function updateRecipientLimit(
        address vault,
        address recipient,
        uint256 newDailyLimit
    ) external onlyOwner nonReentrant {
        require(whitelistedRecipients[vault][recipient].isWhitelisted,
                "RecipientWhitelist: Not whitelisted");
        
        whitelistedRecipients[vault][recipient].dailyLimit = newDailyLimit;
        
        emit RecipientLimitUpdated(vault, recipient, newDailyLimit, block.timestamp);
    }

    // ============ Owner Functions - Emergency Mode ============
    
    /**
     * @notice Activate emergency mode (bypass whitelist)
     * @param vault Vault address
     */
    function activateEmergencyMode(address vault) external onlyOwner nonReentrant {
        require(vault != address(0), "RecipientWhitelist: Invalid vault");
        require(!emergencyModeActive[vault], "RecipientWhitelist: Already in emergency mode");
        
        emergencyModeActive[vault] = true;
        emergencyModeActivatedBy[vault] = msg.sender;
        emergencyModeActivatedAt[vault] = block.timestamp;
        
        emit EmergencyModeActivated(vault, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Deactivate emergency mode (re-enable whitelist)
     * @param vault Vault address
     */
    function deactivateEmergencyMode(address vault) external onlyOwner nonReentrant {
        require(vault != address(0), "RecipientWhitelist: Invalid vault");
        require(emergencyModeActive[vault], "RecipientWhitelist: Not in emergency mode");
        
        emergencyModeActive[vault] = false;
        
        emit EmergencyModeDeactivated(vault, msg.sender, block.timestamp);
    }

    // ============ Vault Functions - Whitelist Checking ============
    
    /**
     * @notice Check if withdrawal to recipient is allowed
     * @param vault Vault address
     * @param recipient Recipient address
     * @param token Token being withdrawn
     * @param amount Withdrawal amount
     * @return allowed Whether withdrawal is allowed
     * @return reason Rejection reason if not allowed
     */
    function checkRecipientWhitelist(
        address vault,
        address recipient,
        address token,
        uint256 amount
    ) external nonReentrant returns (bool allowed, string memory reason) {
        // Emergency mode bypasses whitelist
        if (emergencyModeActive[vault]) {
            return (true, "Emergency mode active");
        }
        
        // Check if recipient is whitelisted
        if (!whitelistedRecipients[vault][recipient].isWhitelisted) {
            return (false, "Recipient not whitelisted");
        }
        
        // Check daily limit
        WhitelistEntry memory entry = whitelistedRecipients[vault][recipient];
        if (entry.dailyLimit > 0) {
            uint256 currentDay = block.timestamp / ONE_DAY;
            uint256 lastResetDay = recipientSpending[vault][recipient][token].lastResetDay;
            
            // Reset if new day
            if (currentDay != lastResetDay) {
                recipientSpending[vault][recipient][token].dailyAmount = 0;
                recipientSpending[vault][recipient][token].lastResetDay = currentDay;
            }
            
            uint256 currentSpent = recipientSpending[vault][recipient][token].dailyAmount;
            if (currentSpent + amount > entry.dailyLimit) {
                return (false, "Recipient daily limit exceeded");
            }
        }
        
        return (true, "");
    }
    
    /**
     * @notice Record withdrawal to recipient
     * @param vault Vault address
     * @param recipient Recipient address
     * @param token Token withdrawn
     * @param amount Amount withdrawn
     */
    function recordWithdrawal(
        address vault,
        address recipient,
        address token,
        uint256 amount
    ) external vaultOnly(vault) nonReentrant {
        RecipientSpending storage spending = recipientSpending[vault][recipient][token];
        
        // Reset if new day
        uint256 currentDay = block.timestamp / ONE_DAY;
        if (currentDay != spending.lastResetDay) {
            spending.dailyAmount = 0;
            spending.lastResetDay = currentDay;
        }
        
        spending.dailyAmount += amount;
        
        emit WithdrawalToRecipient(vault, recipient, token, amount, block.timestamp);
    }

    // ============ View Functions ============
    
    /**
     * @notice Check if address is whitelisted
     * @param vault Vault address
     * @param recipient Recipient address
     * @return Whether address is whitelisted
     */
    function isWhitelisted(
        address vault,
        address recipient
    ) external view returns (bool) {
        return whitelistedRecipients[vault][recipient].isWhitelisted;
    }
    
    /**
     * @notice Get whitelist entry details
     * @param vault Vault address
     * @param recipient Recipient address
     * @return WhitelistEntry data
     */
    function getRecipientInfo(
        address vault,
        address recipient
    ) external view returns (WhitelistEntry memory) {
        return whitelistedRecipients[vault][recipient];
    }
    
    /**
     * @notice Get recipient's daily spending
     * @param vault Vault address
     * @param recipient Recipient address
     * @param token Token address
     * @return dailySpent Amount spent today
     * @return dailyLimit Daily limit for recipient
     * @return dailyRemaining Remaining daily allowance
     */
    function getRecipientDailySpending(
        address vault,
        address recipient,
        address token
    ) external view returns (
        uint256 dailySpent,
        uint256 dailyLimit,
        uint256 dailyRemaining
    ) {
        uint256 currentDay = block.timestamp / ONE_DAY;
        uint256 lastResetDay = recipientSpending[vault][recipient][token].lastResetDay;
        
        // Reset if new day
        if (currentDay != lastResetDay) {
            dailySpent = 0;
        } else {
            dailySpent = recipientSpending[vault][recipient][token].dailyAmount;
        }
        
        WhitelistEntry memory entry = whitelistedRecipients[vault][recipient];
        dailyLimit = entry.dailyLimit;
        
        if (dailyLimit == 0) {
            dailyRemaining = type(uint256).max; // Unlimited
        } else {
            dailyRemaining = dailyLimit > dailySpent ? dailyLimit - dailySpent : 0;
        }
    }
    
    /**
     * @notice Get all whitelisted recipients for a vault
     * @param vault Vault address
     * @return Array of whitelisted addresses
     */
    function getWhitelistedRecipients(
        address vault
    ) external view returns (address[] memory) {
        return whitelistedAddresses[vault];
    }
    
    /**
     * @notice Get count of whitelisted recipients
     * @param vault Vault address
     * @return Number of whitelisted recipients
     */
    function getWhitelistCount(address vault) external view returns (uint256) {
        return whitelistedAddresses[vault].length;
    }
    
    /**
     * @notice Get emergency mode status
     * @param vault Vault address
     * @return active Whether emergency mode is active
     * @return activatedBy Address that activated emergency mode
     * @return activatedAt Timestamp of activation
     */
    function getEmergencyModeStatus(
        address vault
    ) external view returns (
        bool active,
        address activatedBy,
        uint256 activatedAt
    ) {
        return (
            emergencyModeActive[vault],
            emergencyModeActivatedBy[vault],
            emergencyModeActivatedAt[vault]
        );
    }
    
    /**
     * @notice Check if emergency mode is active
     * @param vault Vault address
     * @return Whether emergency mode is active
     */
    function isEmergencyMode(address vault) external view returns (bool) {
        return emergencyModeActive[vault];
    }
}
