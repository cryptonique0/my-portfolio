// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title OnChainResumeWithNFT
 * @dev Enhanced resume platform with NFT achievement badges on Base
 */
contract OnChainResumeWithNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // ============ Events ============
    event ProfileCreated(address indexed user, string handle, string ipfsHash);
    event ProfileUpdated(address indexed user, string ipfsHash);
    event CredentialAdded(address indexed user, string credentialType, uint256 timestamp);
    event CredentialVerified(address indexed user, string credentialType, address indexed verifier);
    event ReputationScoreUpdated(address indexed user, uint256 newScore);
    event AchievementUnlocked(address indexed user, string achievementName, uint256 tokenId);
    event AchievementNFTMinted(address indexed user, uint256 tokenId, string metadataURI);

    // ============ Structs ============
    struct Profile {
        address owner;
        string handle;
        string ipfsHash;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 reputationScore;
        bool verified;
    }

    struct Credential {
        string credentialType;
        string issuer;
        uint256 issuedDate;
        uint256 expiryDate;
        string proofUrl;
        bool verified;
        uint256 verificationCount;
    }

    struct Achievement {
        string title;
        string description;
        uint256 unlockedAt;
        bool verified;
        uint256 nftTokenId; // Associated NFT token ID
    }

    // ============ State Variables ============
    Counters.Counter private _tokenIdCounter;
    
    mapping(address => Profile) public profiles;
    mapping(address => Credential[]) public credentials;
    mapping(address => Achievement[]) public achievements;
    mapping(address => mapping(address => bool)) public verifications;
    mapping(string => address) public handleToAddress;
    mapping(uint256 => address) public nftToOwner;
    
    address[] public allUsers;
    uint256 public profileCount;
    uint256 public totalNFTsMinted;

    // Achievement tier thresholds for reputation
    uint256 public constant BRONZE_THRESHOLD = 50;
    uint256 public constant SILVER_THRESHOLD = 150;
    uint256 public constant GOLD_THRESHOLD = 300;
    uint256 public constant PLATINUM_THRESHOLD = 500;

    // ============ Constructor ============
    constructor() ERC721("OnChainResume Achievement", "RESUME") Ownable(msg.sender) {
        profileCount = 0;
        totalNFTsMinted = 0;
    }

    // ============ Modifiers ============
    modifier onlyProfileOwner(address profileAddress) {
        require(msg.sender == profileAddress || msg.sender == owner(), "Only profile owner can modify");
        _;
    }

    modifier profileExists(address user) {
        require(profiles[user].owner != address(0), "Profile does not exist");
        _;
    }

    // ============ Profile Functions ============

    /**
     * @dev Create a new profile
     */
    function createProfile(string memory _handle, string memory _ipfsHash) external {
        require(profiles[msg.sender].owner == address(0), "Profile already exists");
        require(handleToAddress[_handle] == address(0), "Handle already taken");
        require(bytes(_handle).length > 0, "Handle cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        profiles[msg.sender] = Profile({
            owner: msg.sender,
            handle: _handle,
            ipfsHash: _ipfsHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            reputationScore: 10, // Starting reputation
            verified: false
        });

        handleToAddress[_handle] = msg.sender;
        allUsers.push(msg.sender);
        profileCount++;

        emit ProfileCreated(msg.sender, _handle, _ipfsHash);
        emit ReputationScoreUpdated(msg.sender, 10);
    }

    /**
     * @dev Update profile with new IPFS hash
     */
    function updateProfile(string memory _ipfsHash) external profileExists(msg.sender) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        profiles[msg.sender].ipfsHash = _ipfsHash;
        profiles[msg.sender].updatedAt = block.timestamp;

        emit ProfileUpdated(msg.sender, _ipfsHash);
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

    // ============ Credential Functions ============

    /**
     * @dev Add a credential to profile
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

        credentials[msg.sender].push(Credential({
            credentialType: _credentialType,
            issuer: _issuer,
            issuedDate: _issuedDate,
            expiryDate: _expiryDate,
            proofUrl: _proofUrl,
            verified: false,
            verificationCount: 0
        }));

        // Increase reputation for adding credential
        profiles[msg.sender].reputationScore += 5;

        emit CredentialAdded(msg.sender, _credentialType, block.timestamp);
        emit ReputationScoreUpdated(msg.sender, profiles[msg.sender].reputationScore);
    }

    /**
     * @dev Verify a credential
     */
    function verifyCredential(address _user, uint256 _credentialIndex) 
        external 
        profileExists(_user) 
    {
        require(_credentialIndex < credentials[_user].length, "Credential not found");
        require(!verifications[_user][msg.sender], "Already verified by this address");

        Credential storage cred = credentials[_user][_credentialIndex];
        cred.verificationCount++;
        verifications[_user][msg.sender] = true;

        // Mark as verified if verified by 2+ sources
        if (cred.verificationCount >= 2) {
            cred.verified = true;
            // Bonus reputation for verified credential
            profiles[_user].reputationScore += 15;
            emit ReputationScoreUpdated(_user, profiles[_user].reputationScore);
        }

        emit CredentialVerified(_user, cred.credentialType, msg.sender);
    }

    /**
     * @dev Get all credentials for a user
     */
    function getCredentials(address user) external view returns (Credential[] memory) {
        return credentials[user];
    }

    /**
     * @dev Get credential count
     */
    function getCredentialCount(address user) external view returns (uint256) {
        return credentials[user].length;
    }

    // ============ Achievement NFT Functions ============

    /**
     * @dev Unlock achievement and mint NFT badge
     */
    function unlockAchievement(
        string memory _title, 
        string memory _description,
        string memory _metadataURI
    ) external profileExists(msg.sender) returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");

        // Mint NFT for achievement
        uint256 tokenId = _mintAchievementNFT(msg.sender, _metadataURI);

        // Add achievement record
        achievements[msg.sender].push(Achievement({
            title: _title,
            description: _description,
            unlockedAt: block.timestamp,
            verified: false,
            nftTokenId: tokenId
        }));

        // Increase reputation
        profiles[msg.sender].reputationScore += 10;

        emit AchievementUnlocked(msg.sender, _title, tokenId);
        emit ReputationScoreUpdated(msg.sender, profiles[msg.sender].reputationScore);

        return tokenId;
    }

    /**
     * @dev Internal function to mint achievement NFT
     */
    function _mintAchievementNFT(address to, string memory metadataURI) internal returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        nftToOwner[tokenId] = to;
        totalNFTsMinted++;

        emit AchievementNFTMinted(to, tokenId, metadataURI);

        return tokenId;
    }

    /**
     * @dev Get all achievements for a user
     */
    function getAchievements(address user) external view returns (Achievement[] memory) {
        return achievements[user];
    }

    /**
     * @dev Get achievement count
     */
    function getAchievementCount(address user) external view returns (uint256) {
        return achievements[user].length;
    }

    /**
     * @dev Get all NFT token IDs owned by an address
     */
    function getOwnedNFTs(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (_ownerOf(i) == user) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return tokenIds;
    }

    // ============ Reputation Functions ============

    /**
     * @dev Update user reputation score (admin only)
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
     * @dev Get user reputation
     */
    function getReputation(address user) external view returns (uint256) {
        return profiles[user].reputationScore;
    }

    /**
     * @dev Get reputation tier based on score
     */
    function getReputationTier(address user) external view returns (string memory) {
        uint256 score = profiles[user].reputationScore;
        
        if (score >= PLATINUM_THRESHOLD) return "Platinum";
        if (score >= GOLD_THRESHOLD) return "Gold";
        if (score >= SILVER_THRESHOLD) return "Silver";
        if (score >= BRONZE_THRESHOLD) return "Bronze";
        return "Beginner";
    }

    /**
     * @dev Verify a profile (admin only)
     */
    function verifyProfile(address _user) external onlyOwner profileExists(_user) {
        profiles[_user].verified = true;
        // Bonus reputation for verification
        profiles[_user].reputationScore += 25;
        emit ReputationScoreUpdated(_user, profiles[_user].reputationScore);
    }

    // ============ View Functions ============

    /**
     * @dev Get total user count
     */
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    /**
     * @dev Get user address by index
     */
    function getUserByIndex(uint256 _index) external view returns (address) {
        require(_index < allUsers.length, "Index out of bounds");
        return allUsers[_index];
    }

    /**
     * @dev Get top profiles by reputation (optimized for gas)
     */
    function getTopProfiles(uint256 _limit) external view returns (address[] memory, uint256[] memory) {
        uint256 limit = _limit > allUsers.length ? allUsers.length : _limit;
        address[] memory topAddresses = new address[](limit);
        uint256[] memory topScores = new uint256[](limit);
        
        // Simple selection sort for top profiles
        for (uint256 i = 0; i < limit; i++) {
            uint256 maxScore = 0;
            uint256 maxIndex = 0;
            
            for (uint256 j = 0; j < allUsers.length; j++) {
                bool alreadyIncluded = false;
                for (uint256 k = 0; k < i; k++) {
                    if (topAddresses[k] == allUsers[j]) {
                        alreadyIncluded = true;
                        break;
                    }
                }
                
                if (!alreadyIncluded && profiles[allUsers[j]].reputationScore > maxScore) {
                    maxScore = profiles[allUsers[j]].reputationScore;
                    maxIndex = j;
                }
            }
            
            topAddresses[i] = allUsers[maxIndex];
            topScores[i] = maxScore;
        }
        
        return (topAddresses, topScores);
    }

    // ============ Override Functions ============

    /**
     * @dev Override token transfers to prevent achievement NFT trading (soulbound)
     * Comment this out if you want NFTs to be transferable
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        // Prevent transfers (soulbound)
        revert("Achievement NFTs are soulbound and cannot be transferred");
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
