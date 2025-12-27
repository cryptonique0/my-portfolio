// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title OnChainResumeEnhanced
 * @dev Extended contract with NFT achievement badges, reputation tokens,
 * and multi-chain cross-chain features for Base, Stacks, and other networks
 */

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IReputationToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract OnChainResumeEnhanced is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    // ============ Constants ============
    uint256 public constant PROFILE_CREATION_REWARD = 50;
    uint256 public constant CREDENTIAL_VERIFICATION_REWARD = 100;
    uint256 public constant ACHIEVEMENT_UNLOCK_REWARD = 25;
    uint256 public constant COMMUNITY_VERIFICATION_REWARD = 50;

    // ============ Events ============
    event ProfileCreated(address indexed user, string handle, string ipfsHash, uint256 chainId);
    event ProfileUpdated(address indexed user, string ipfsHash, uint256 chainId);
    event CredentialAdded(address indexed user, string credentialType, uint256 timestamp);
    event CredentialVerified(address indexed user, string credentialType, address indexed verifier);
    event ReputationScoreUpdated(address indexed user, uint256 newScore);
    event AchievementUnlocked(address indexed user, string achievementName, uint256 points);
    event AchievementNFTMinted(address indexed user, uint256 indexed tokenId, string achievementType);
    event BadgeRedeemed(address indexed user, string badgeType, uint256 nftTokenId);
    event ChainDeploymentRecorded(address indexed user, uint256 chainId, string chainName);
    event MultiChainProfileSynced(address indexed user, uint256[] chainIds);
    event ReputationTokensMinted(address indexed user, uint256 amount);
    event VerifierAdded(address indexed verifier);

    // ============ Structs ============
    struct Profile {
        address owner;
        string handle;
        string ipfsHash;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 reputationScore;
        bool verified;
        uint256[] deployedChains;
        uint256[] achievementNFTIds;
    }

    struct Credential {
        string credentialType;
        string issuer;
        uint256 issuedDate;
        uint256 expiryDate;
        string proofUrl;
        bool verified;
        uint256 verificationCount;
        uint256 addedAt;
    }

    struct Achievement {
        string title;
        string description;
        string achievementType;
        uint256 unlockedAt;
        bool verified;
        uint256 points;
        uint256 nftTokenId;
    }

    struct Badge {
        string name;
        string achievementType;
        uint256 tier; // 1-5 (bronze, silver, gold, platinum, diamond)
        string imageUrl;
        uint256 requiredScore;
        bool active;
    }

    struct VerifierInfo {
        address verifierAddress;
        string name;
        string specialty;
        uint256 verificationCount;
        bool isActive;
        uint256 joinedAt;
    }

    // ============ State Variables ============
    Counters.Counter private _tokenIdCounter;

    mapping(address => Profile) public profiles;
    mapping(address => Credential[]) public credentials;
    mapping(address => Achievement[]) public achievements;
    mapping(address => mapping(address => bool)) public verifications;
    mapping(string => address) public handleToAddress;
    mapping(address => VerifierInfo) public verifiers;
    mapping(string => Badge) public badges;

    mapping(uint256 => string) public tokenIdToAchievementType;
    mapping(address => mapping(uint256 => bool)) public userHasNFT;

    address[] public allUsers;
    address[] public allVerifiers;
    string[] public allBadgeTypes;

    address public owner;
    uint256 public profileCount;
    uint256 public totalVerifications;

    IReputationToken public reputationToken;

    // ============ Constructor ============
    constructor() ERC721("OnChainResume Achievement", "RES") {
        owner = msg.sender;
        profileCount = 0;
        totalVerifications = 0;
    }

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyProfileOwner(address profileAddress) {
        require(
            msg.sender == profileAddress || msg.sender == owner,
            "Only profile owner can modify"
        );
        _;
    }

    modifier profileExists(address user) {
        require(profiles[user].owner != address(0), "Profile does not exist");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender].isActive, "Only active verifiers can call this");
        _;
    }

    // ============ Profile Functions ============

    /**
     * @dev Create a new profile with chain tracking
     * @param _handle Unique handle for the user
     * @param _ipfsHash IPFS hash pointing to complete profile data
     * @param _chainId ID of the chain where profile is created
     */
    function createProfile(
        string memory _handle,
        string memory _ipfsHash,
        uint256 _chainId
    ) external {
        require(profiles[msg.sender].owner == address(0), "Profile already exists");
        require(handleToAddress[_handle] == address(0), "Handle already taken");
        require(bytes(_handle).length > 0, "Handle cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        uint256[] memory deployedChains = new uint256[](1);
        deployedChains[0] = _chainId;

        profiles[msg.sender] = Profile({
            owner: msg.sender,
            handle: _handle,
            ipfsHash: _ipfsHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            reputationScore: PROFILE_CREATION_REWARD,
            verified: false,
            deployedChains: deployedChains,
            achievementNFTIds: new uint256[](0)
        });

        handleToAddress[_handle] = msg.sender;
        allUsers.push(msg.sender);
        profileCount++;

        // Mint reputation tokens
        if (address(reputationToken) != address(0)) {
            reputationToken.mint(msg.sender, PROFILE_CREATION_REWARD);
            emit ReputationTokensMinted(msg.sender, PROFILE_CREATION_REWARD);
        }

        emit ProfileCreated(msg.sender, _handle, _ipfsHash, _chainId);
    }

    /**
     * @dev Deploy profile to additional chain
     * @param _chainId ID of new chain
     * @param _chainName Name of the chain
     */
    function deployToChain(uint256 _chainId, string memory _chainName)
        external
        profileExists(msg.sender)
    {
        Profile storage profile = profiles[msg.sender];
        
        // Check if already deployed to this chain
        for (uint256 i = 0; i < profile.deployedChains.length; i++) {
            require(profile.deployedChains[i] != _chainId, "Already deployed to this chain");
        }

        profile.deployedChains.push(_chainId);
        profile.updatedAt = block.timestamp;

        // Bonus reputation for multi-chain deployment
        profile.reputationScore += 50;

        emit ChainDeploymentRecorded(msg.sender, _chainId, _chainName);
        emit ReputationScoreUpdated(msg.sender, profile.reputationScore);

        // Check and award multi-chain badge
        if (profile.deployedChains.length >= 3) {
            rewardMultiChainAchievement(msg.sender);
        }
    }

    /**
     * @dev Update user profile
     */
    function updateProfile(string memory _ipfsHash) 
        external 
        profileExists(msg.sender) 
    {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        profiles[msg.sender].ipfsHash = _ipfsHash;
        profiles[msg.sender].updatedAt = block.timestamp;

        emit ProfileUpdated(msg.sender, _ipfsHash, block.chainid);
    }

    /**
     * @dev Get user profile
     */
    function getProfile(address user) external view returns (Profile memory) {
        return profiles[user];
    }

    /**
     * @dev Get user by handle
     */
    function getUserByHandle(string memory _handle) external view returns (address) {
        return handleToAddress[_handle];
    }

    /**
     * @dev Get deployed chains for user
     */
    function getDeployedChains(address user) external view returns (uint256[] memory) {
        return profiles[user].deployedChains;
    }

    // ============ Credential Functions ============

    /**
     * @dev Add a credential to the user's profile
     */
    function addCredential(
        string memory _credentialType,
        string memory _issuer,
        uint256 _issuedDate,
        uint256 _expiryDate,
        string memory _proofUrl
    ) external profileExists(msg.sender) {
        require(bytes(_credentialType).length > 0, "Credential type required");
        require(bytes(_issuer).length > 0, "Issuer required");
        require(_issuedDate <= block.timestamp, "Issue date cannot be in future");
        require(bytes(_proofUrl).length > 0, "Proof URL required");

        credentials[msg.sender].push(
            Credential({
                credentialType: _credentialType,
                issuer: _issuer,
                issuedDate: _issuedDate,
                expiryDate: _expiryDate,
                proofUrl: _proofUrl,
                verified: false,
                verificationCount: 0,
                addedAt: block.timestamp
            })
        );

        emit CredentialAdded(msg.sender, _credentialType, block.timestamp);
    }

    /**
     * @dev Verify a credential
     */
    function verifyCredential(address _user, uint256 _credentialIndex)
        external
        profileExists(_user)
        onlyVerifier
    {
        require(_credentialIndex < credentials[_user].length, "Credential not found");
        require(!verifications[_user][msg.sender], "Already verified by this verifier");

        Credential storage cred = credentials[_user][_credentialIndex];
        cred.verificationCount++;
        verifications[_user][msg.sender] = true;

        // Mark as verified if verified by 2 or more sources
        if (cred.verificationCount >= 2) {
            cred.verified = true;
        }

        // Reward verifier
        if (address(reputationToken) != address(0)) {
            reputationToken.mint(msg.sender, CREDENTIAL_VERIFICATION_REWARD);
        }

        // Reward user
        profiles[_user].reputationScore += CREDENTIAL_VERIFICATION_REWARD;
        totalVerifications++;

        // Track verifier stats
        verifiers[msg.sender].verificationCount++;

        emit CredentialVerified(_user, cred.credentialType, msg.sender);
        emit ReputationScoreUpdated(_user, profiles[_user].reputationScore);
    }

    /**
     * @dev Get credentials for user
     */
    function getCredentials(address user) 
        external 
        view 
        returns (Credential[] memory) 
    {
        return credentials[user];
    }

    /**
     * @dev Get credential count
     */
    function getCredentialCount(address user) external view returns (uint256) {
        return credentials[user].length;
    }

    // ============ Achievement & NFT Functions ============

    /**
     * @dev Unlock achievement and optionally mint NFT
     */
    function unlockAchievement(
        string memory _title,
        string memory _description,
        string memory _achievementType,
        uint256 _points
    ) external profileExists(msg.sender) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(_points > 0, "Points must be positive");

        achievements[msg.sender].push(
            Achievement({
                title: _title,
                description: _description,
                achievementType: _achievementType,
                unlockedAt: block.timestamp,
                verified: false,
                points: _points,
                nftTokenId: 0
            })
        );

        profiles[msg.sender].reputationScore += _points;

        emit AchievementUnlocked(msg.sender, _title, _points);
        emit ReputationScoreUpdated(msg.sender, profiles[msg.sender].reputationScore);
    }

    /**
     * @dev Mint NFT badge for achievement
     */
    function mintAchievementNFT(
        address _user,
        string memory _achievementType,
        string memory _metadataUri
    ) external onlyOwner returns (uint256) {
        require(profiles[_user].owner != address(0), "Profile does not exist");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(_user, tokenId);
        tokenIdToAchievementType[tokenId] = _achievementType;
        userHasNFT[_user][tokenId] = true;

        profiles[_user].achievementNFTIds.push(tokenId);

        emit AchievementNFTMinted(_user, tokenId, _achievementType);
        return tokenId;
    }

    /**
     * @dev Redeem badge based on reputation
     */
    function redeemBadge(string memory _badgeType) 
        external 
        profileExists(msg.sender) 
    {
        Badge storage badge = badges[_badgeType];
        require(badge.active, "Badge not available");
        require(
            profiles[msg.sender].reputationScore >= badge.requiredScore,
            "Insufficient reputation"
        );
        require(!userHasNFT[msg.sender][badge.tier], "Badge already redeemed");

        // Mint NFT
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        tokenIdToAchievementType[tokenId] = _badgeType;
        userHasNFT[msg.sender][tokenId] = true;

        emit BadgeRedeemed(msg.sender, _badgeType, tokenId);
    }

    /**
     * @dev Get achievements for user
     */
    function getAchievements(address user) 
        external 
        view 
        returns (Achievement[] memory) 
    {
        return achievements[user];
    }

    /**
     * @dev Get achievement count
     */
    function getAchievementCount(address user) external view returns (uint256) {
        return achievements[user].length;
    }

    /**
     * @dev Get user's NFT token IDs
     */
    function getUserNFTs(address user) external view returns (uint256[] memory) {
        return profiles[user].achievementNFTIds;
    }

    // ============ Reputation Functions ============

    /**
     * @dev Get user reputation score
     */
    function getReputation(address user) external view returns (uint256) {
        return profiles[user].reputationScore;
    }

    /**
     * @dev Update reputation (admin only)
     */
    function updateReputation(address _user, uint256 _score)
        external
        onlyOwner
        profileExists(_user)
    {
        profiles[_user].reputationScore = _score;
        emit ReputationScoreUpdated(_user, _score);
    }

    /**
     * @dev Verify profile
     */
    function verifyProfile(address _user) external onlyOwner profileExists(_user) {
        profiles[_user].verified = true;
    }

    // ============ Verifier Management ============

    /**
     * @dev Register as verifier
     */
    function registerAsVerifier(string memory _name, string memory _specialty) external {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_specialty).length > 0, "Specialty required");

        if (verifiers[msg.sender].verifierAddress == address(0)) {
            allVerifiers.push(msg.sender);
        }

        verifiers[msg.sender] = VerifierInfo({
            verifierAddress: msg.sender,
            name: _name,
            specialty: _specialty,
            verificationCount: verifiers[msg.sender].verificationCount,
            isActive: true,
            joinedAt: block.timestamp
        });

        emit VerifierAdded(msg.sender);
    }

    /**
     * @dev Get verifier info
     */
    function getVerifierInfo(address _verifier)
        external
        view
        returns (VerifierInfo memory)
    {
        return verifiers[_verifier];
    }

    // ============ Badge Management ============

    /**
     * @dev Create new badge type
     */
    function createBadge(
        string memory _badgeType,
        string memory _name,
        uint256 _tier,
        string memory _imageUrl,
        uint256 _requiredScore
    ) external onlyOwner {
        require(bytes(_badgeType).length > 0, "Badge type required");
        require(_tier >= 1 && _tier <= 5, "Invalid tier");

        badges[_badgeType] = Badge({
            name: _name,
            achievementType: _badgeType,
            tier: _tier,
            imageUrl: _imageUrl,
            requiredScore: _requiredScore,
            active: true
        });

        allBadgeTypes.push(_badgeType);
    }

    /**
     * @dev Get all badge types
     */
    function getAllBadgeTypes() external view returns (string[] memory) {
        return allBadgeTypes;
    }

    // ============ Internal Functions ============

    /**
     * @dev Reward multi-chain achievement
     */
    function rewardMultiChainAchievement(address _user) internal {
        uint256 reward = 100;
        profiles[_user].reputationScore += reward;

        if (address(reputationToken) != address(0)) {
            reputationToken.mint(_user, reward);
        }
    }

    // ============ View Functions ============

    /**
     * @dev Get user count
     */
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    /**
     * @dev Get user by index
     */
    function getUserByIndex(uint256 _index) external view returns (address) {
        require(_index < allUsers.length, "Index out of bounds");
        return allUsers[_index];
    }

    /**
     * @dev Get top profiles by reputation
     */
    function getTopProfiles(uint256 _limit) external view returns (address[] memory) {
        uint256 limit = _limit > allUsers.length ? allUsers.length : _limit;
        address[] memory topProfiles = new address[](limit);

        for (uint256 i = 0; i < limit; i++) {
            uint256 maxScore = 0;
            uint256 maxIndex = 0;

            for (uint256 j = 0; j < allUsers.length; j++) {
                bool alreadyIncluded = false;
                for (uint256 k = 0; k < i; k++) {
                    if (topProfiles[k] == allUsers[j]) {
                        alreadyIncluded = true;
                        break;
                    }
                }

                if (!alreadyIncluded && profiles[allUsers[j]].reputationScore > maxScore) {
                    maxScore = profiles[allUsers[j]].reputationScore;
                    maxIndex = j;
                }
            }
            topProfiles[i] = allUsers[maxIndex];
        }

        return topProfiles;
    }

    /**
     * @dev Get verifier count
     */
    function getVerifierCount() external view returns (uint256) {
        return allVerifiers.length;
    }

    /**
     * @dev Get total verifications
     */
    function getTotalVerifications() external view returns (uint256) {
        return totalVerifications;
    }

    // ============ Admin Functions ============

    /**
     * @dev Set reputation token address
     */
    function setReputationToken(address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Invalid address");
        reputationToken = IReputationToken(_tokenAddress);
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // ============ Fallback ============
    receive() external payable {}
}
