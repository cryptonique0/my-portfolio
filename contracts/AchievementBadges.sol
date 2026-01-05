// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AchievementBadges
 * @author Talent Resume Team
 * @notice ERC1155 NFT badges for achievements and milestones
 * @dev Implements burnable and supply tracking for badge management
 */
contract AchievementBadges is
    ERC1155,
    ERC1155Burnable,
    ERC1155Supply,
    Ownable,
    Pausable
{
    // ============ Type Definitions ============

    /// @notice Badge metadata and properties
    /// @dev Stores information about each badge type
    struct BadgeMetadata {
        string name;                 // Badge name
        string description;          // Badge description
        uint256 requiredReputation;  // Minimum reputation to unlock
        uint256 maxSupply;           // Maximum badges that can exist (0 = unlimited)
        uint256 currentSupply;       // Current number minted
        bool isActive;               // Can new badges be minted?
        string imageURI;             // IPFS URI for badge image
        uint256 createdAt;           // Creation timestamp
    }

    // ============ Events ============

    /// @notice Emitted when a new badge type is created
    event BadgeCreated(
        uint256 indexed badgeId,
        string name,
        uint256 requiredReputation,
        uint256 maxSupply
    );

    /// @notice Emitted when a badge is minted to a user
    event BadgeMinted(
        address indexed recipient,
        uint256 indexed badgeId,
        uint256 amount,
        uint256 recipientReputation
    );

    /// @notice Emitted when badges are batch minted
    event BadgesBatchMinted(
        address[] recipients,
        uint256[] badgeIds,
        uint256[] amounts
    );

    /// @notice Emitted when badge metadata is updated
    event BadgeMetadataUpdated(uint256 indexed badgeId, string name);

    /// @notice Emitted when required reputation is updated
    event RequiredReputationUpdated(
        uint256 indexed badgeId,
        uint256 oldReputation,
        uint256 newReputation
    );

    /// @notice Emitted when badge is deactivated
    event BadgeDeactivated(uint256 indexed badgeId);

    // ============ Storage ============

    /// @dev Mapping of badge ID to metadata
    mapping(uint256 => BadgeMetadata) public badges;

    /// @dev Total number of badge types created
    uint256 public badgeCounter;

    /// @dev Mapping to track which users have which badges
    mapping(address => mapping(uint256 => bool)) public userHasBadge;

    /// @dev Mapping of user address to array of badge IDs owned
    mapping(address => uint256[]) public userBadges;

    /// @dev Reference to OnChainResume contract for reputation checks
    address public resumeContractAddress;

    /// @dev Base URI for badge metadata
    string private baseURI;

    // ============ Modifiers ============

    /// @notice Only allow function if badge exists and is active
    modifier onlyActiveBadge(uint256 badgeId) {
        require(badgeId < badgeCounter, "Badge does not exist");
        require(badges[badgeId].isActive, "Badge is not active");
        _;
    }

    /// @notice Check reputation requirement
    modifier checkReputation(address user, uint256 badgeId) {
        // If resume contract is set, verify reputation
        if (resumeContractAddress != address(0)) {
            // Call getReputation from resume contract
            // This is a placeholder - adjust interface as needed
            require(
                getUserReputation(user) >= badges[badgeId].requiredReputation,
                "Insufficient reputation for badge"
            );
        }
        _;
    }

    // ============ Constructor ============

    /// @notice Initialize badge contract
    /// @param uri Base URI for badge metadata
    constructor(string memory uri) ERC1155(uri) {
        baseURI = uri;
        badgeCounter = 0;
    }

    // ============ Badge Management Functions ============

    /// @notice Create a new badge type
    /// @param name Badge name
    /// @param description Badge description
    /// @param requiredReputation Minimum reputation to earn badge
    /// @param maxSupply Maximum supply (0 = unlimited)
    /// @param imageURI IPFS URI for badge image
    /// @return badgeId ID of newly created badge
    function createBadge(
        string memory name,
        string memory description,
        uint256 requiredReputation,
        uint256 maxSupply,
        string memory imageURI
    ) external onlyOwner returns (uint256) {
        uint256 badgeId = badgeCounter++;

        badges[badgeId] = BadgeMetadata({
            name: name,
            description: description,
            requiredReputation: requiredReputation,
            maxSupply: maxSupply,
            currentSupply: 0,
            isActive: true,
            imageURI: imageURI,
            createdAt: block.timestamp
        });

        emit BadgeCreated(badgeId, name, requiredReputation, maxSupply);
        return badgeId;
    }

    /// @notice Mint badge to a single user
    /// @param recipient Address to receive badge
    /// @param badgeId Badge type to mint
    /// @param amount Number of badges to mint
    function mintBadge(
        address recipient,
        uint256 badgeId,
        uint256 amount
    ) external onlyOwner onlyActiveBadge(badgeId) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");

        BadgeMetadata storage badge = badges[badgeId];

        // Check supply limit
        if (badge.maxSupply > 0) {
            require(
                badge.currentSupply + amount <= badge.maxSupply,
                "Exceeds max supply"
            );
        }

        // Update supply
        badge.currentSupply += amount;

        // Track badge for user
        if (!userHasBadge[recipient][badgeId]) {
            userHasBadge[recipient][badgeId] = true;
            userBadges[recipient].push(badgeId);
        }

        // Mint token
        _mint(recipient, badgeId, amount, "");

        emit BadgeMinted(
            recipient,
            badgeId,
            amount,
            getUserReputation(recipient)
        );
    }

    /// @notice Mint badges to multiple users
    /// @param recipients Array of addresses to receive badges
    /// @param badgeIds Array of badge IDs to mint
    /// @param amounts Array of amounts to mint
    function mintBadgesBatch(
        address[] calldata recipients,
        uint256[] calldata badgeIds,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(
            recipients.length == badgeIds.length &&
                badgeIds.length == amounts.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            if (badgeIds[i] < badgeCounter && badges[badgeIds[i]].isActive) {
                mintBadge(recipients[i], badgeIds[i], amounts[i]);
            }
        }

        emit BadgesBatchMinted(recipients, badgeIds, amounts);
    }

    /// @notice Burn badge tokens
    /// @param badgeId Badge to burn
    /// @param amount Amount to burn
    function burnBadge(uint256 badgeId, uint256 amount) external {
        _burn(msg.sender, badgeId, amount);

        // Update supply
        if (badges[badgeId].currentSupply >= amount) {
            badges[badgeId].currentSupply -= amount;
        }
    }

    // ============ Badge Configuration ============

    /// @notice Update badge required reputation
    /// @param badgeId Badge to update
    /// @param newReputation New required reputation
    function setRequiredReputation(uint256 badgeId, uint256 newReputation)
        external
        onlyOwner
    {
        require(badgeId < badgeCounter, "Badge does not exist");

        uint256 oldReputation = badges[badgeId].requiredReputation;
        badges[badgeId].requiredReputation = newReputation;

        emit RequiredReputationUpdated(badgeId, oldReputation, newReputation);
    }

    /// @notice Update badge metadata
    /// @param badgeId Badge to update
    /// @param newName New name
    /// @param newDescription New description
    /// @param newImageURI New image URI
    function updateBadgeMetadata(
        uint256 badgeId,
        string memory newName,
        string memory newDescription,
        string memory newImageURI
    ) external onlyOwner {
        require(badgeId < badgeCounter, "Badge does not exist");

        BadgeMetadata storage badge = badges[badgeId];
        badge.name = newName;
        badge.description = newDescription;
        badge.imageURI = newImageURI;

        emit BadgeMetadataUpdated(badgeId, newName);
    }

    /// @notice Deactivate badge (prevent new mints)
    /// @param badgeId Badge to deactivate
    function deactivateBadge(uint256 badgeId) external onlyOwner {
        require(badgeId < badgeCounter, "Badge does not exist");
        badges[badgeId].isActive = false;

        emit BadgeDeactivated(badgeId);
    }

    /// @notice Activate previously deactivated badge
    /// @param badgeId Badge to activate
    function activateBadge(uint256 badgeId) external onlyOwner {
        require(badgeId < badgeCounter, "Badge does not exist");
        badges[badgeId].isActive = true;
    }

    // ============ Query Functions ============

    /// @notice Get badge metadata
    /// @param badgeId Badge ID
    /// @return Badge metadata
    function getBadgeMetadata(uint256 badgeId)
        external
        view
        returns (BadgeMetadata memory)
    {
        require(badgeId < badgeCounter, "Badge does not exist");
        return badges[badgeId];
    }

    /// @notice Get all badges owned by user
    /// @param user User address
    /// @return Array of badge IDs
    function getUserBadges(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userBadges[user];
    }

    /// @notice Get badge count for user
    /// @param user User address
    /// @return Number of badge types owned
    function getBadgeCount(address user) external view returns (uint256) {
        return userBadges[user].length;
    }

    /// @notice Check if user has specific badge
    /// @param user User address
    /// @param badgeId Badge ID
    /// @return True if user owns badge
    function hasBadge(address user, uint256 badgeId)
        external
        view
        returns (bool)
    {
        return userHasBadge[user][badgeId];
    }

    /// @notice Get total badges minted of type
    /// @param badgeId Badge ID
    /// @return Total supply
    function getBadgeSupply(uint256 badgeId)
        external
        view
        returns (uint256)
    {
        require(badgeId < badgeCounter, "Badge does not exist");
        return badges[badgeId].currentSupply;
    }

    /// @notice Get total number of badge types
    /// @return Badge counter
    function getTotalBadgeTypes() external view returns (uint256) {
        return badgeCounter;
    }

    /// @notice Get user reputation from resume contract
    /// @param user User address
    /// @return Reputation score
    function getUserReputation(address user)
        public
        view
        returns (uint256)
    {
        // Placeholder - implement interface to resume contract
        // This would call getReputation(user) on the OnChainResume contract
        // For now, return 0 if not connected
        if (resumeContractAddress == address(0)) {
            return 0;
        }

        // In production, call:
        // return IOnChainResume(resumeContractAddress).getReputation(user);
        return 0;
    }

    // ============ Configuration Functions ============

    /// @notice Set resume contract address for reputation verification
    /// @param _resumeContractAddress Address of OnChainResume contract
    function setResumeContractAddress(address _resumeContractAddress)
        external
        onlyOwner
    {
        require(_resumeContractAddress != address(0), "Invalid address");
        resumeContractAddress = _resumeContractAddress;
    }

    /// @notice Set base URI for token metadata
    /// @param newUri New base URI
    function setBaseURI(string memory newUri) external onlyOwner {
        baseURI = newUri;
        _setURI(newUri);
    }

    /// @notice Get current base URI
    /// @return Base URI string
    function getBaseURI() external view returns (string memory) {
        return baseURI;
    }

    /// @notice Pause all badge operations
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume all badge operations
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Override Functions ============

    /// @notice Hook that is called before any token transfer
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    /// @notice Hook that is called after any token transfer
    function _afterTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._afterTokenTransfer(operator, from, to, ids, amounts, data);
    }

    /// @notice Support interface detection
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
