// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WhitelistManager
 * @dev Manages whitelisted addresses for airdrop eligibility with tier support
 */
contract WhitelistManager is Ownable {
    // Custom errors
    error AlreadyWhitelisted();
    error NotWhitelisted();
    error InvalidAddress();

    // Events
    event AddedToWhitelist(
        address indexed user,
        uint256 indexed tier,
        uint256 timestamp
    );
    event RemovedFromWhitelist(address indexed user, uint256 timestamp);
    event TierUpdated(address indexed user, uint256 newTier, uint256 timestamp);
    event TierMetadataUpdated(
        uint256 indexed tier,
        string tierName,
        uint256 maxAllocation
    );
    event WhitelistStatusChanged(bool isActive);

    // Data structures
    struct WhitelistEntry {
        bool whitelisted;
        uint256 addedAt;
        uint256 tier;
    }

    struct TierMetadata {
        string tierName;
        uint256 maxAllocation;
    }

    // State variables
    uint256 private totalWhitelisted;
    bool private whitelistActive = true;

    mapping(address => WhitelistEntry) private whitelist;
    mapping(uint256 => TierMetadata) private tierMetadata;

    constructor() Ownable(msg.sender) {
        // Initialize default tiers
        tierMetadata[0] = TierMetadata("Bronze", 100 * 10 ** 6); // 100 tokens
        tierMetadata[1] = TierMetadata("Silver", 500 * 10 ** 6); // 500 tokens
        tierMetadata[2] = TierMetadata("Gold", 1000 * 10 ** 6); // 1000 tokens
        tierMetadata[3] = TierMetadata("Platinum", 5000 * 10 ** 6); // 5000 tokens
    }

    // ==================== Read-Only Functions ====================

    /**
     * @dev Check if address is whitelisted
     */
    function isWhitelisted(address user) public view returns (bool) {
        return whitelist[user].whitelisted;
    }

    /**
     * @dev Get whitelist info for an address
     */
    function getWhitelistInfo(address user)
        public
        view
        returns (WhitelistEntry memory)
    {
        return whitelist[user];
    }

    /**
     * @dev Get total whitelisted count
     */
    function getTotalWhitelisted() public view returns (uint256) {
        return totalWhitelisted;
    }

    /**
     * @dev Check if whitelist is active
     */
    function isWhitelistActive() public view returns (bool) {
        return whitelistActive;
    }

    /**
     * @dev Get tier metadata
     */
    function getTierMetadata(uint256 tier)
        public
        view
        returns (TierMetadata memory)
    {
        return tierMetadata[tier];
    }

    /**
     * @dev Get user's tier
     */
    function getUserTier(address user) public view returns (uint256) {
        return whitelist[user].tier;
    }

    /**
     * @dev Get user's max allocation based on tier
     */
    function getUserMaxAllocation(address user) public view returns (uint256) {
        if (!isWhitelisted(user)) {
            return 0;
        }
        uint256 tier = whitelist[user].tier;
        return tierMetadata[tier].maxAllocation;
    }

    // ==================== Public Functions ====================

    /**
     * @dev Add single address to whitelist
     */
    function addToWhitelist(address user, uint256 tier) public onlyOwner {
        require(user != address(0), "Invalid address");
        require(whitelistActive, "Whitelist is inactive");
        require(user != owner(), "Cannot whitelist owner");
        require(tierMetadata[tier].maxAllocation > 0, "Invalid tier");

        if (whitelist[user].whitelisted) {
            // Already whitelisted, just update tier
            whitelist[user].tier = tier;
            emit TierUpdated(user, tier, block.timestamp);
        } else {
            // New whitelist entry
            whitelist[user] = WhitelistEntry({
                whitelisted: true,
                addedAt: block.timestamp,
                tier: tier
            });
            totalWhitelisted++;
            emit AddedToWhitelist(user, tier, block.timestamp);
        }
    }

    /**
     * @dev Batch add addresses to whitelist
     */
    function batchAddToWhitelist(address[] calldata users, uint256 tier)
        public
        onlyOwner
    {
        require(users.length <= 500, "Too many users");
        require(whitelistActive, "Whitelist is inactive");
        require(tierMetadata[tier].maxAllocation > 0, "Invalid tier");

        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid address");
            require(users[i] != owner(), "Cannot whitelist owner");

            if (!whitelist[users[i]].whitelisted) {
                whitelist[users[i]] = WhitelistEntry({
                    whitelisted: true,
                    addedAt: block.timestamp,
                    tier: tier
                });
                totalWhitelisted++;
                emit AddedToWhitelist(users[i], tier, block.timestamp);
            }
        }
    }

    /**
     * @dev Remove address from whitelist
     */
    function removeFromWhitelist(address user) public onlyOwner {
        require(whitelist[user].whitelisted, "Not whitelisted");

        whitelist[user].whitelisted = false;
        totalWhitelisted--;

        emit RemovedFromWhitelist(user, block.timestamp);
    }

    /**
     * @dev Batch remove addresses from whitelist
     */
    function batchRemoveFromWhitelist(address[] calldata users)
        public
        onlyOwner
    {
        require(users.length <= 500, "Too many users");

        for (uint256 i = 0; i < users.length; i++) {
            if (whitelist[users[i]].whitelisted) {
                whitelist[users[i]].whitelisted = false;
                totalWhitelisted--;
                emit RemovedFromWhitelist(users[i], block.timestamp);
            }
        }
    }

    /**
     * @dev Update user tier
     */
    function updateUserTier(address user, uint256 newTier) public onlyOwner {
        require(whitelist[user].whitelisted, "Not whitelisted");
        require(tierMetadata[newTier].maxAllocation > 0, "Invalid tier");

        whitelist[user].tier = newTier;

        emit TierUpdated(user, newTier, block.timestamp);
    }

    /**
     * @dev Set tier metadata
     */
    function setTierMetadata(
        uint256 tier,
        string memory tierName,
        uint256 maxAllocation
    ) public onlyOwner {
        require(maxAllocation > 0, "Invalid allocation");

        tierMetadata[tier] = TierMetadata(tierName, maxAllocation);

        emit TierMetadataUpdated(tier, tierName, maxAllocation);
    }

    /**
     * @dev Toggle whitelist active status
     */
    function toggleWhitelistStatus() public onlyOwner {
        whitelistActive = !whitelistActive;
        emit WhitelistStatusChanged(whitelistActive);
    }
}
