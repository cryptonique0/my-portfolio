// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OnChainResume
 * @dev A decentralized resume platform where users can store verified achievements,
 * credentials, and professional profiles on-chain with IPFS integration.
 */

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract OnChainResume {
    // ============ Events ============
    event ProfileCreated(address indexed user, string handle, string ipfsHash);
    event ProfileUpdated(address indexed user, string ipfsHash);
    event CredentialAdded(address indexed user, string credentialType, uint256 timestamp);
    event CredentialVerified(address indexed user, string credentialType, address indexed verifier);
    event ReputationScoreUpdated(address indexed user, uint256 newScore);
    event AchievementUnlocked(address indexed user, string achievementName);

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
    }

    // ============ State Variables ============
    mapping(address => Profile) public profiles;
    mapping(address => Credential[]) public credentials;
    mapping(address => Achievement[]) public achievements;
    mapping(address => mapping(address => bool)) public verifications;
    mapping(string => address) public handleToAddress;
    
    address[] public allUsers;
    address public owner;
    uint256 public profileCount;

    // ============ Constructor ============
    constructor() {
        owner = msg.sender;
        profileCount = 0;
    }

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyProfileOwner(address profileAddress) {
        require(msg.sender == profileAddress || msg.sender == owner, "Only profile owner can modify");
        _;
    }

    modifier profileExists(address user) {
        require(profiles[user].owner != address(0), "Profile does not exist");
        _;
    }

    // ============ Profile Functions ============

    /**
     * @dev Create a new profile
     * @param _handle Unique handle for the user
     * @param _ipfsHash IPFS hash pointing to complete profile data
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
            reputationScore: 0,
            verified: false
        });

        handleToAddress[_handle] = msg.sender;
        allUsers.push(msg.sender);
        profileCount++;

        emit ProfileCreated(msg.sender, _handle, _ipfsHash);
    }

    /**
     * @dev Update user profile with new IPFS hash
     * @param _ipfsHash New IPFS hash for updated profile
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
     * @dev Add a credential to the user's profile
     * @param _credentialType Type of credential (degree, certification, etc.)
     * @param _issuer Organization that issued the credential
     * @param _issuedDate Timestamp when credential was issued
     * @param _expiryDate Timestamp when credential expires (0 if no expiry)
     * @param _proofUrl URL to proof document
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

        emit CredentialAdded(msg.sender, _credentialType, block.timestamp);
    }

    /**
     * @dev Verify a credential (by verifier/issuer)
     * @param _user Address of profile owner
     * @param _credentialIndex Index of credential to verify
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

        // Mark as verified if verified by 2 or more sources
        if (cred.verificationCount >= 2) {
            cred.verified = true;
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
     * @dev Get credential count for a user
     */
    function getCredentialCount(address user) external view returns (uint256) {
        return credentials[user].length;
    }

    // ============ Achievement Functions ============

    /**
     * @dev Add an achievement to the user's profile
     * @param _title Achievement title
     * @param _description Achievement description
     */
    function unlockAchievement(string memory _title, string memory _description) 
        external 
        profileExists(msg.sender) 
    {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");

        achievements[msg.sender].push(Achievement({
            title: _title,
            description: _description,
            unlockedAt: block.timestamp,
            verified: false
        }));

        // Increase reputation for unlocking achievement
        profiles[msg.sender].reputationScore += 10;

        emit AchievementUnlocked(msg.sender, _title);
        emit ReputationScoreUpdated(msg.sender, profiles[msg.sender].reputationScore);
    }

    /**
     * @dev Get all achievements for a user
     */
    function getAchievements(address user) external view returns (Achievement[] memory) {
        return achievements[user];
    }

    /**
     * @dev Get achievement count for a user
     */
    function getAchievementCount(address user) external view returns (uint256) {
        return achievements[user].length;
    }

    // ============ Reputation Functions ============

    /**
     * @dev Update user reputation score
     * @param _user Address of user
     * @param _score New reputation score
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
     * @dev Get user reputation score
     */
    function getReputation(address user) external view returns (uint256) {
        return profiles[user].reputationScore;
    }

    /**
     * @dev Verify a profile (by owner)
     * @param _user Address to verify
     */
    function verifyProfile(address _user) external onlyOwner profileExists(_user) {
        profiles[_user].verified = true;
    }

    // ============ View Functions ============

    /**
     * @dev Get all users count
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

    // ============ Admin Functions ============

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    /**
     * @dev Emergency pause function (placeholder for future expansion)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // ============ Fallback Functions ============
    receive() external payable {}
}
