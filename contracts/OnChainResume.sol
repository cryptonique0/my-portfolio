// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OnChainResume
 * @author Talent Resume Team
 * @notice A decentralized resume platform where users can store verified achievements,
 * credentials, and professional profiles on-chain with IPFS integration.
 * @dev Optimized for gas efficiency with packed storage, event-driven architecture,
 * multiple credentials per user with categorization, and comprehensive NatSpec documentation
 */

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract OnChainResume {
    // ============ Type Definitions ============
    
    /// @notice Categories for credentials with enum values for efficient storage
    enum CredentialCategory {
        EDUCATION,      // 0: Educational qualifications (degrees, diplomas)
        WORK,           // 1: Work experience and employment history
        CERTIFICATION,  // 2: Professional certifications and licenses
        HACKATHON       // 3: Hackathon participation and achievements
    }

    // ============ Events ============
    
    /// @notice Emitted when a new profile is created
    /// @param user Address of the profile owner
    /// @param handle Unique handle chosen by the user
    /// @param ipfsHash IPFS hash containing profile metadata
    /// @param timestamp Block timestamp of profile creation
    event ProfileCreated(
        address indexed user, 
        string handle, 
        string ipfsHash,
        uint256 timestamp
    );
    
    /// @notice Emitted when a profile is updated
    /// @param user Address of the profile owner
    /// @param ipfsHash New IPFS hash containing updated profile metadata
    /// @param timestamp Block timestamp of profile update
    event ProfileUpdated(
        address indexed user, 
        string ipfsHash,
        uint256 timestamp
    );
    
    /// @notice Emitted when a new credential is added
    /// @param user Address of the profile owner
    /// @param category Category of the credential
    /// @param credentialType Type/name of the credential
    /// @param credentialIndex Index of the credential in user's array
    /// @param timestamp Block timestamp of credential addition
    event CredentialAdded(
        address indexed user, 
        CredentialCategory indexed category,
        string credentialType, 
        uint256 credentialIndex,
        uint256 timestamp
    );
    
    /// @notice Emitted when a credential is verified
    /// @param user Address of the credential owner
    /// @param credentialIndex Index of the verified credential
    /// @param verifier Address of the verifier
    /// @param timestamp Block timestamp of verification
    event CredentialVerified(
        address indexed user, 
        uint256 credentialIndex, 
        address indexed verifier,
        uint256 timestamp
    );
    
    /// @notice Emitted when reputation score is updated
    /// @param user Address of the user
    /// @param oldScore Previous reputation score
    /// @param newScore New reputation score
    event ReputationScoreUpdated(
        address indexed user, 
        uint256 oldScore,
        uint256 newScore
    );
    
    /// @notice Emitted when an achievement is unlocked
    /// @param user Address of the user
    /// @param achievementName Name of the unlocked achievement
    /// @param timestamp Block timestamp of achievement unlock
    event AchievementUnlocked(
        address indexed user, 
        string achievementName,
        uint256 timestamp
    );

    // ============ Structs ============
    
    /// @notice Profile data structure (optimized for storage)
    /// @dev Packed to minimize storage slots using uint16/uint32/uint64 types
    /// Storage layout: owner (20) + createdAt (8) = 28 bytes (slot 1)
    ///               updatedAt (8) + reputationScore (4) + credentialCount (2) + verified (1) + padding (1) = 32 bytes (slot 2)
    struct Profile {
        address owner;              // 20 bytes - Profile owner address
        uint64 createdAt;           // 8 bytes  - Profile creation timestamp
        uint64 updatedAt;           // 8 bytes  - Last profile update timestamp
        uint32 reputationScore;     // 4 bytes  - Reputation score (max 4.2B)
        uint16 credentialCount;     // 2 bytes  - Total credentials (max 65535)
        bool verified;              // 1 byte   - Whether profile is verified
        string handle;              // New slot - Unique username
        string ipfsHash;            // New slot - IPFS hash of profile metadata
    }

    /// @notice Credential data structure with category support
    /// @dev Optimized storage layout to fit in minimal storage slots
    /// Storage: category (1) + issuedDate (8) + expiryDate (8) + verificationCount (2) + verified (1) + padding (4) = 24 bytes (slot 1)
    struct Credential {
        CredentialCategory category;  // 1 byte  - Enum: EDUCATION, WORK, CERTIFICATION, HACKATHON
        uint64 issuedDate;           // 8 bytes - Unix timestamp of issue date
        uint64 expiryDate;           // 8 bytes - Unix timestamp of expiry (0 = no expiry)
        uint16 verificationCount;    // 2 bytes - Number of verifications received
        bool verified;               // 1 byte  - Whether credential is verified
        string credentialType;       // New slot - Type/name of credential
        string issuer;               // New slot - Issuing organization
        string proofUrl;             // New slot - URL/IPFS hash of proof
    }

    /// @notice Achievement data structure
    /// @dev Minimal storage for gas efficiency
    /// Storage: unlockedAt (8) + verified (1) + padding (7) = 16 bytes (slot 1)
    struct Achievement {
        uint64 unlockedAt;          // 8 bytes - Unix timestamp of achievement unlock
        bool verified;              // 1 byte  - Whether achievement is verified
        string title;               // New slot - Achievement title
        string description;         // New slot - Achievement description
    }

    /// @notice Reputation breakdown structure for detailed score calculation
    /// @dev Used in getReputationBreakdown() to show score composition
    struct ReputationBreakdown {
        uint256 baseScore;                  // Base score for profile creation
        uint256 verifiedProfileBonus;       // Bonus for verified profile
        uint256 credentialScore;            // Score from all credentials
        uint256 verifiedCredentialBonus;    // Bonus for verified credentials
        uint256 achievementScore;           // Score from achievements
        uint256 activityScore;              // Score from profile updates/activity
        uint256 totalScore;                 // Total calculated reputation
        uint256 credentialCount;            // Total credentials owned
        uint256 verifiedCredentialCount;    // Number of verified credentials
        uint256 achievementCount;           // Total achievements
    }

    // ============ Reputation Scoring Constants ============
    
    /// @notice Base score for creating a profile
    /// @dev Starting reputation for any new profile
    uint256 public constant SCORE_BASE = 10;
    
    /// @notice Bonus points for profile verification
    /// @dev Points added when profile is verified by admin
    uint256 public constant SCORE_VERIFIED_PROFILE = 25;
    
    /// @notice Points per verified credential
    /// @dev Points added for each credential with 2+ verifications
    uint256 public constant SCORE_VERIFIED_CREDENTIAL = 15;
    
    /// @notice Points per unverified credential
    /// @dev Base points for adding a credential (even without verification)
    uint256 public constant SCORE_UNVERIFIED_CREDENTIAL = 5;
    
    /// @notice Bonus multiplier for Talent Protocol achievements
    /// @dev Additional points based on linked achievements (off-chain)
    uint256 public constant SCORE_ACHIEVEMENT_BASE = 10;
    
    /// @notice Activity bonus for profile updates
    /// @dev Points for profile engagement and updates
    uint256 public constant SCORE_PROFILE_UPDATE = 3;
    
    /// @dev Mapping from user address to their profile - primary data structure
    mapping(address => Profile) public profiles;
    
    /// @dev Mapping from user address to array of their credentials
    /// Using private with public getter function to save gas on external calls
    mapping(address => Credential[]) private userCredentials;
    
    /// @dev Mapping from user address to array of their achievements
    mapping(address => Achievement[]) private userAchievements;
    
    /// @dev Mapping to track single-address verifications: user => verifier => credentialIndex => verified
    /// Prevents duplicate verifications and tracks multiple verifications per credential
    mapping(address => mapping(address => mapping(uint256 => bool))) public verificationMap;
    
    /// @dev Mapping from handle to user address for O(1) handle lookups
    mapping(string => address) public handleToAddress;
    
    /// @dev Array of all registered user addresses for enumeration
    address[] public allUsers;
    
    /// @dev Contract owner address - used for admin functions
    address public owner;
    
    /// @dev Total number of profiles created - cached for efficiency
    uint256 public profileCount;

    // ============ Constructor ============
    
    /// @notice Initialize the contract and set the deployer as owner
    constructor() {
        owner = msg.sender;
        profileCount = 0;
    }

    // ============ Modifiers ============
    
    /// @notice Restricts function access to contract owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    /// @notice Restricts function access to profile owner or contract owner
    /// @param profileAddress Address of the profile owner
    modifier onlyProfileOwner(address profileAddress) {
        require(
            msg.sender == profileAddress || msg.sender == owner, 
            "Only profile owner can modify"
        );
        _;
    }

    /// @notice Checks if a profile exists for the given address
    /// @param user Address to check
    modifier profileExists(address user) {
        require(profiles[user].owner != address(0), "Profile does not exist");
        _;
    }

    // ============ Profile Functions ============

    /// @notice Create a new user profile on the platform
    /// @dev Creates profile with unique handle and stores IPFS metadata hash
    /// Emits ProfileCreated event for indexing and validation
    /// @param _handle Unique identifier/username for the profile (cannot be changed)
    /// @param _ipfsHash IPFS hash (CIDv0) pointing to complete profile metadata JSON
    /// @custom:requires Profile doesn't already exist for caller
    /// @custom:requires Handle is unique and not empty
    /// @custom:requires IPFS hash is not empty
    /// @custom:gas Creates 1 storage mapping entry + array push + event emission
    function createProfile(
        string memory _handle, 
        string memory _ipfsHash
    ) external {
        require(profiles[msg.sender].owner == address(0), "Profile already exists");
        require(handleToAddress[_handle] == address(0), "Handle already taken");
        require(bytes(_handle).length > 0, "Handle cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        profiles[msg.sender] = Profile({
            owner: msg.sender,
            handle: _handle,
            ipfsHash: _ipfsHash,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp),
            reputationScore: 0,
            credentialCount: 0,
            verified: false
        });

        handleToAddress[_handle] = msg.sender;
        allUsers.push(msg.sender);
        profileCount++;

        emit ProfileCreated(msg.sender, _handle, _ipfsHash, block.timestamp);
    }

    /// @notice Update existing profile with new IPFS metadata
    /// @dev Only the profile owner can update their profile
    /// Updates the IPFS hash pointing to fresh profile metadata
    /// @param _ipfsHash New IPFS hash (CIDv0) for updated profile metadata
    /// @custom:requires Profile exists for caller
    /// @custom:requires IPFS hash is not empty
    /// @custom:gas Updates 2 storage fields + event emission
    function updateProfile(
        string memory _ipfsHash
    ) external profileExists(msg.sender) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        profiles[msg.sender].ipfsHash = _ipfsHash;
        profiles[msg.sender].updatedAt = uint64(block.timestamp);

        emit ProfileUpdated(msg.sender, _ipfsHash, block.timestamp);
    }

    /// @notice Retrieve a user's complete profile data
    /// @dev Returns the full Profile struct including all metadata
    /// @param user Address of the user whose profile to retrieve
    /// @return Profile struct containing user's profile information
    /// @custom:gas Read-only operation, no gas cost for view function
    function getProfile(address user) external view returns (Profile memory) {
        return profiles[user];
    }

    /// @notice Get user address by their unique handle
    /// @dev Performs O(1) reverse lookup from handle to address
    /// @param _handle The unique handle to lookup
    /// @return address User's wallet address (returns zero address if not found)
    /// @custom:gas Efficient mapping lookup with O(1) complexity
    function getUserByHandle(string memory _handle) external view returns (address) {
        return handleToAddress[_handle];
    }

    // ============ Credential Functions ============

    /// @notice Add a new credential to user's profile
    /// @dev Supports multiple credentials with 4 categories for better organization
    /// Credentials are stored in user-specific array and indexed by category
    /// Emits CredentialAdded event with category for easy filtering by off-chain indexers
    /// @param _category Credential category enum (EDUCATION, WORK, CERTIFICATION, HACKATHON)
    /// @param _credentialType Specific type/name of the credential (e.g., "Bachelor of Science")
    /// @param _issuer Organization or entity that issued the credential
    /// @param _issuedDate Unix timestamp when credential was issued
    /// @param _expiryDate Unix timestamp when credential expires (use 0 for permanent/no expiry)
    /// @param _proofUrl URL or IPFS hash pointing to credential proof/verification document
    /// @custom:requires Profile exists for caller
    /// @custom:requires All string fields are not empty
    /// @custom:requires Issue date is not in future
    /// @custom:requires Expiry date is after issue date (or 0)
    /// @custom:gas Creates 1 struct push + updates profile field + event emission
    function addCredential(
        CredentialCategory _category,
        string memory _credentialType,
        string memory _issuer,
        uint64 _issuedDate,
        uint64 _expiryDate,
        string memory _proofUrl
    ) external profileExists(msg.sender) {
        require(bytes(_credentialType).length > 0, "Credential type required");
        require(bytes(_issuer).length > 0, "Issuer required");
        require(_issuedDate <= block.timestamp, "Issue date cannot be in future");
        require(bytes(_proofUrl).length > 0, "Proof URL required");
        require(
            _expiryDate == 0 || _expiryDate > _issuedDate, 
            "Expiry must be after issue date"
        );

        userCredentials[msg.sender].push(Credential({
            category: _category,
            credentialType: _credentialType,
            issuer: _issuer,
            issuedDate: _issuedDate,
            expiryDate: _expiryDate,
            proofUrl: _proofUrl,
            verified: false,
            verificationCount: 0
        }));

        // Cache credential count in profile for O(1) access
        profiles[msg.sender].credentialCount = uint16(userCredentials[msg.sender].length);

        uint256 credentialIndex = userCredentials[msg.sender].length - 1;
        emit CredentialAdded(
            msg.sender, 
            _category,
            _credentialType, 
            credentialIndex,
            block.timestamp
        );
    }

    /// @notice Verify a user's credential from external verifier
    /// @dev Credentials become fully verified after 2+ independent verifications
    /// Each address can only verify each credential once (tracked in verificationMap)
    /// @param _user Address of the credential owner
    /// @param _credentialIndex Index of the credential in user's credential array
    /// @custom:requires Profile exists for user
    /// @custom:requires Credential index is valid
    /// @custom:requires Caller hasn't already verified this credential
    /// @custom:effects Increments verification count; sets verified flag if count >= 2
    /// @custom:gas 1 storage read + 2 storage writes + event emission
    function verifyCredential(
        address _user, 
        uint256 _credentialIndex
    ) external profileExists(_user) {
        require(_credentialIndex < userCredentials[_user].length, "Credential not found");
        require(!verificationMap[_user][msg.sender][_credentialIndex], "Already verified by caller");

        Credential storage cred = userCredentials[_user][_credentialIndex];
        cred.verificationCount++;
        verificationMap[_user][msg.sender][_credentialIndex] = true;

        // Mark as verified if verified by 2 or more independent sources
        if (cred.verificationCount >= 2) {
            cred.verified = true;
        }

        emit CredentialVerified(_user, _credentialIndex, msg.sender, block.timestamp);
    }

    /// @notice Get all credentials for a specific user
    /// @dev Returns complete array of credentials - expensive for large arrays
    /// Consider using getCredentialByIndex or getCredentialsByCategory for filtering
    /// @param user Address of the user
    /// @return Credential[] Array of all credentials owned by the user
    /// @custom:gas O(n) where n = credential count; expensive for large arrays
    function getCredentials(address user) external view returns (Credential[] memory) {
        return userCredentials[user];
    }

    /// @notice Get credentials filtered by category for a specific user
    /// @dev Performs filtering off-chain equivalent in contract memory
    /// More efficient than getCredentials for specific category lookups
    /// @param user Address of the user
    /// @param _category Category enum to filter by
    /// @return Credential[] Array of credentials matching the category
    /// @custom:gas O(n) for two passes through credential array
    function getCredentialsByCategory(
        address user, 
        CredentialCategory _category
    ) external view returns (Credential[] memory) {
        uint256 count = 0;
        
        // First pass: count matching credentials to size array
        for (uint256 i = 0; i < userCredentials[user].length; i++) {
            if (userCredentials[user][i].category == _category) {
                count++;
            }
        }
        
        // Second pass: populate result array with matching credentials
        Credential[] memory result = new Credential[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userCredentials[user].length; i++) {
            if (userCredentials[user][i].category == _category) {
                result[index] = userCredentials[user][i];
                index++;
            }
        }
        
        return result;
    }

    /// @notice Get the total number of credentials for a user
    /// @dev Provides credential count without returning entire array
    /// @param user Address of the user
    /// @return uint256 Total credential count for user
    /// @custom:gas O(1) read operation
    function getCredentialCount(address user) external view returns (uint256) {
        return userCredentials[user].length;
    }

    /// @notice Get a specific credential by index
    /// @dev Retrieves single credential for efficient access
    /// @param user Address of the credential owner
    /// @param index Index of the credential in user's array
    /// @return Credential The credential struct at the specified index
    /// @custom:requires Index must be within bounds of user's credential array
    /// @custom:gas O(1) read operation
    function getCredentialByIndex(
        address user, 
        uint256 index
    ) external view returns (Credential memory) {
        require(index < userCredentials[user].length, "Index out of bounds");
        return userCredentials[user][index];
    }

    // ============ Achievement Functions ============

    /// @notice Unlock a new achievement on user's profile
    /// @dev Achievements represent milestones and are tracked with unlock timestamp
    /// Automatically increases reputation score by 10 points per achievement
    /// Emits both AchievementUnlocked and ReputationScoreUpdated events
    /// @param _title Achievement title/name (e.g., "First Profile Created")
    /// @param _description Detailed description of the achievement
    /// @custom:requires Profile exists for caller
    /// @custom:requires Both title and description are not empty
    /// @custom:effects Adds achievement to array, increases reputation score by 10
    /// @custom:gas 1 array push + 1 storage write + 2 events
    function unlockAchievement(
        string memory _title, 
        string memory _description
    ) 
        external 
        profileExists(msg.sender) 
    {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");

        userAchievements[msg.sender].push(Achievement({
            title: _title,
            description: _description,
            unlockedAt: uint64(block.timestamp),
            verified: false
        }));

        // Increase reputation for unlocking achievement
        uint256 oldScore = profiles[msg.sender].reputationScore;
        profiles[msg.sender].reputationScore += 10;

        emit AchievementUnlocked(msg.sender, _title, block.timestamp);
        emit ReputationScoreUpdated(msg.sender, oldScore, profiles[msg.sender].reputationScore);
    }

    /// @notice Get all achievements for a specific user
    /// @dev Returns complete array of achievements - expensive for large arrays
    /// @param user Address of the user
    /// @return Achievement[] Array of all achievements owned by the user
    /// @custom:gas O(n) read where n = achievement count
    function getAchievements(address user) external view returns (Achievement[] memory) {
        return userAchievements[user];
    }

    /// @notice Get the total number of achievements for a user
    /// @param user Address of the user
    /// @return uint256 Total achievement count
    /// @custom:gas O(1) read operation
    function getAchievementCount(address user) external view returns (uint256) {
        return userAchievements[user].length;
    }

    // ============ Reputation Functions ============

    /// @notice Internal function to calculate deterministic reputation score
    /// @dev Core reputation calculation logic - deterministic based on on-chain data
    /// Score = Base + Profile Verification + Credentials + Achievements + Activity
    /// @param user Address of the user
    /// @return uint256 Calculated reputation score
    /// @custom:formula
    ///   baseScore = 10
    ///   verifiedProfileBonus = verified ? 25 : 0
    ///   credentialScore = (credentialCount * 5) + (verifiedCredentialCount * 15)
    ///   achievementScore = achievementCount * 10
    ///   activityScore = (updatedAt - createdAt) / 2592000 * 3 (1 point per month)
    ///   totalScore = baseScore + verifiedProfileBonus + credentialScore + achievementScore + activityScore
    function _calculateReputation(address user) internal view returns (uint256) {
        Profile memory profile = profiles[user];
        
        // If no profile exists, return 0
        if (profile.owner == address(0)) {
            return 0;
        }
        
        uint256 score = SCORE_BASE;
        
        // Add verified profile bonus
        if (profile.verified) {
            score += SCORE_VERIFIED_PROFILE;
        }
        
        // Calculate credential score
        uint256 totalCredentials = userCredentials[user].length;
        if (totalCredentials > 0) {
            // Base score for all credentials
            score += totalCredentials * SCORE_UNVERIFIED_CREDENTIAL;
            
            // Bonus for verified credentials (2+ verifications)
            uint256 verifiedCredentials = 0;
            for (uint256 i = 0; i < totalCredentials; i++) {
                if (userCredentials[user][i].verified) {
                    verifiedCredentials++;
                }
            }
            score += verifiedCredentials * SCORE_VERIFIED_CREDENTIAL;
        }
        
        // Calculate achievement score
        uint256 achievementCount = userAchievements[user].length;
        score += achievementCount * SCORE_ACHIEVEMENT_BASE;
        
        // Activity bonus: points for profile engagement (1 point per month of activity)
        // Simplified: use updatedAt - createdAt, with 30-day months (2,592,000 seconds)
        if (profile.updatedAt > profile.createdAt) {
            uint256 monthsActive = (profile.updatedAt - profile.createdAt) / 2_592_000;
            if (monthsActive > 0) {
                score += monthsActive * SCORE_PROFILE_UPDATE;
            }
        }
        
        return score;
    }

    /// @notice Calculate detailed reputation breakdown for a user
    /// @dev Shows complete breakdown of reputation score composition
    /// Useful for UI display and understanding score calculation
    /// @param user Address of the user
    /// @return ReputationBreakdown Detailed breakdown of all score components
    /// @custom:gas O(n) where n = credential count (need to check each credential)
    function getReputationBreakdown(address user) external view returns (ReputationBreakdown memory) {
        Profile memory profile = profiles[user];
        
        // Return zero breakdown if profile doesn't exist
        if (profile.owner == address(0)) {
            return ReputationBreakdown({
                baseScore: 0,
                verifiedProfileBonus: 0,
                credentialScore: 0,
                verifiedCredentialBonus: 0,
                achievementScore: 0,
                activityScore: 0,
                totalScore: 0,
                credentialCount: 0,
                verifiedCredentialCount: 0,
                achievementCount: 0
            });
        }
        
        uint256 baseScore = SCORE_BASE;
        
        uint256 verifiedProfileBonus = profile.verified ? SCORE_VERIFIED_PROFILE : 0;
        
        // Credential scores
        uint256 totalCredentials = userCredentials[user].length;
        uint256 credentialScore = totalCredentials * SCORE_UNVERIFIED_CREDENTIAL;
        
        uint256 verifiedCredentials = 0;
        for (uint256 i = 0; i < totalCredentials; i++) {
            if (userCredentials[user][i].verified) {
                verifiedCredentials++;
            }
        }
        uint256 verifiedCredentialBonus = verifiedCredentials * SCORE_VERIFIED_CREDENTIAL;
        
        // Achievement score
        uint256 achievementCount = userAchievements[user].length;
        uint256 achievementScore = achievementCount * SCORE_ACHIEVEMENT_BASE;
        
        // Activity score
        uint256 activityScore = 0;
        if (profile.updatedAt > profile.createdAt) {
            uint256 monthsActive = (profile.updatedAt - profile.createdAt) / 2_592_000;
            if (monthsActive > 0) {
                activityScore = monthsActive * SCORE_PROFILE_UPDATE;
            }
        }
        
        uint256 totalScore = baseScore + verifiedProfileBonus + credentialScore + 
                            verifiedCredentialBonus + achievementScore + activityScore;
        
        return ReputationBreakdown({
            baseScore: baseScore,
            verifiedProfileBonus: verifiedProfileBonus,
            credentialScore: credentialScore,
            verifiedCredentialBonus: verifiedCredentialBonus,
            achievementScore: achievementScore,
            activityScore: activityScore,
            totalScore: totalScore,
            credentialCount: totalCredentials,
            verifiedCredentialCount: verifiedCredentials,
            achievementCount: achievementCount
        });
    }

    /// @notice Update a user's reputation score (admin only)
    /// @dev Allows contract owner to adjust reputation for various reasons
    /// Emits ReputationScoreUpdated event for tracking score changes
    /// @param _user Address of the user whose reputation to update
    /// @param _score New reputation score value
    /// @custom:requires Caller is contract owner
    /// @custom:requires Profile exists for user
    /// @custom:gas 1 storage write + 1 event emission
    function updateReputation(
        address _user, 
        uint256 _score
    ) 
        external 
        onlyOwner 
        profileExists(_user) 
    {
        uint256 oldScore = profiles[_user].reputationScore;
        profiles[_user].reputationScore = uint32(_score);
        emit ReputationScoreUpdated(_user, oldScore, _score);
    }

    /// @notice Get a user's current reputation score (deterministic)
    /// @dev Returns reputation calculated from on-chain data:
    /// - Base score (10 points)
    /// - Verified profile bonus (25 points)
    /// - Credentials: 5 points each + 15 bonus for verified
    /// - Achievements: 10 points each
    /// - Activity: 3 points per month of profile engagement
    /// Calculation is fully deterministic based on current on-chain state
    /// @param user Address of the user
    /// @return uint256 User's calculated reputation score
    /// @custom:gas O(n) where n = credential count
    function getReputation(address user) external view returns (uint256) {
        return _calculateReputation(user);
    }

    /// @notice Verify a user's profile (admin only)
    /// @dev Sets verified flag on profile, indicating platform verification
    /// @param _user Address of the user whose profile to verify
    /// @custom:requires Caller is contract owner
    /// @custom:requires Profile exists for user
    /// @custom:gas 1 storage write
    function verifyProfile(address _user) external onlyOwner profileExists(_user) {
        profiles[_user].verified = true;
    }

    // ============ View Functions ============

    /// @notice Get total number of registered users on the platform
    /// @return uint256 Total count of users with profiles
    /// @custom:gas O(1) read operation
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    /// @notice Get user address by index in the allUsers array
    /// @dev Enables enumeration of all users for indexing and analytics
    /// @param _index Array index of user to retrieve
    /// @return address User wallet address at the specified index
    /// @custom:requires Index must be within bounds of allUsers array
    /// @custom:gas O(1) read operation
    function getUserByIndex(uint256 _index) external view returns (address) {
        require(_index < allUsers.length, "Index out of bounds");
        return allUsers[_index];
    }

    /// @notice Get top profiles sorted by reputation score
    /// @dev Returns addresses of users with highest reputation scores
    /// Uses selection sort algorithm - O(n²) complexity, suitable for small limits
    /// @param _limit Maximum number of top profiles to return
    /// @return address[] Array of addresses sorted by reputation (highest first)
    /// @custom:gas O(limit * n) where n = total users; avoid large limits
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

    /// @notice Transfer contract ownership to a new address
    /// @dev New owner will have access to admin-only functions
    /// @param _newOwner Address of the new contract owner
    /// @custom:requires Caller is current contract owner
    /// @custom:requires New owner address is not zero address
    /// @custom:gas 1 storage write
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    /// @notice Emergency withdrawal of contract balance
    /// @dev Transfers entire ETH balance to contract owner using secure call pattern
    /// Should only be used in case of emergency
    /// @custom:requires Caller is contract owner
    /// @custom:gas Low-level call for ETH withdrawal
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // ============ Fallback Functions ============
    
    /// @notice Accept ETH transfers (payable fallback)
    receive() external payable {}
}
