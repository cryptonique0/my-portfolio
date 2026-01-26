// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IComplianceProvider {
    function isKYCVerified(address user) external view returns (bool);
    function getAMLStatus(address user) external view returns (bool);
    function reportTransaction(address from, address to, uint256 amount) external;
}

/**
 * @title KYCAMLCompliance
 * @notice Manages KYC/AML compliance requirements for airdrops
 * @dev Integrates with external compliance providers
 */
contract KYCAMLCompliance is Ownable {
    
    enum ComplianceLevel { NONE, BASIC, VERIFIED, PREMIUM }
    
    struct UserCompliance {
        bool kycVerified;
        bool amlPassed;
        ComplianceLevel level;
        uint256 maxClaimAmount; // Amount user can claim
        uint256 totalClaimed;
        uint256 lastVerificationTime;
        bool suspended;
    }
    
    struct ComplianceProvider {
        address provider;
        bool active;
        string name;
        uint256 verificationFee;
    }
    
    mapping(address => UserCompliance) public userCompliance;
    mapping(uint256 => ComplianceProvider) public providers;
    
    uint256 public providerCount;
    address public primaryProvider;
    
    bool public complianceRequired;
    
    event KYCVerified(address indexed user, uint256 timestamp);
    event AMLCleared(address indexed user, uint256 timestamp);
    event UserSuspended(address indexed user, string reason);
    event UserUnsuspended(address indexed user);
    event ComplianceLevelUpdated(address indexed user, ComplianceLevel newLevel);
    event ProviderAdded(uint256 indexed providerId, address indexed provider);
    event ProviderRemoved(uint256 indexed providerId);
    event MaxClaimUpdated(address indexed user, uint256 newMax);
    event ClaimRecorded(address indexed user, uint256 amount);
    
    /**
     * @notice Add a compliance provider
     * @param _provider Provider contract address
     * @param _name Provider name
     * @param _fee Verification fee
     */
    function addProvider(
        address _provider,
        string memory _name,
        uint256 _fee
    ) external onlyOwner {
        require(_provider != address(0), "Invalid provider");

        uint256 providerId = providerCount++;

        providers[providerId] = ComplianceProvider({
            provider: _provider,
            active: true,
            name: _name,
            verificationFee: _fee
        });

        if (primaryProvider == address(0)) {
            primaryProvider = _provider;
        }

        emit ProviderAdded(providerId, _provider);
    }

    /**
     * @notice Deactivate a compliance provider
     * @param _providerId Provider ID
     */
    function deactivateProvider(uint256 _providerId) external onlyOwner {
        require(_providerId < providerCount, "Invalid provider");
        providers[_providerId].active = false;

        emit ProviderRemoved(_providerId);
    }

    /**
     * @notice Set primary compliance provider
     * @param _provider Provider address
     */
    function setPrimaryProvider(address _provider) external onlyOwner {
        require(_provider != address(0), "Invalid provider");
        primaryProvider = _provider;
    }

    /**
     * @notice Verify user KYC status
     * @param _user User address
     */
    function verifyKYC(address _user) external onlyOwner {
        require(_user != address(0), "Invalid user");

        userCompliance[_user].kycVerified = true;
        userCompliance[_user].lastVerificationTime = block.timestamp;

        _updateComplianceLevel(_user);

        emit KYCVerified(_user, block.timestamp);
    }

    /**
     * @notice Verify AML status
     * @param _user User address
     */
    function verifyAML(address _user) external onlyOwner {
        require(_user != address(0), "Invalid user");

        userCompliance[_user].amlPassed = true;

        _updateComplianceLevel(_user);

        emit AMLCleared(_user, block.timestamp);
    }

    /**
     * @notice Set max claim amount for user
     * @param _user User address
     * @param _maxAmount Maximum claimable amount
     */
    function setMaxClaimAmount(address _user, uint256 _maxAmount)
        external
        onlyOwner
    {
        require(_user != address(0), "Invalid user");

        userCompliance[_user].maxClaimAmount = _maxAmount;

        emit MaxClaimUpdated(_user, _maxAmount);
    }

    /**
     * @notice Record a claim for compliance tracking
     * @param _user User address
     * @param _amount Amount claimed
     */
    function recordClaim(address _user, uint256 _amount) external onlyOwner {
        require(_user != address(0), "Invalid user");
        require(!userCompliance[_user].suspended, "User suspended");
        require(
            userCompliance[_user].totalClaimed + _amount <=
                userCompliance[_user].maxClaimAmount,
            "Exceeds max claim amount"
        );

        userCompliance[_user].totalClaimed += _amount;

        emit ClaimRecorded(_user, _amount);
    }

    /**
     * @notice Suspend a user from claiming
     * @param _user User address
     * @param _reason Suspension reason
     */
    function suspendUser(address _user, string memory _reason)
        external
        onlyOwner
    {
        require(_user != address(0), "Invalid user");

        userCompliance[_user].suspended = true;

        emit UserSuspended(_user, _reason);
    }

    /**
     * @notice Unsuspend a user
     * @param _user User address
     */
    function unsuspendUser(address _user) external onlyOwner {
        require(_user != address(0), "Invalid user");

        userCompliance[_user].suspended = false;

        emit UserUnsuspended(_user);
    }

    /**
     * @notice Check if user is compliant
     * @param _user User address
     */
    function isCompliant(address _user) external view returns (bool) {
        if (!complianceRequired) return true;

        UserCompliance memory compliance = userCompliance[_user];
        return !compliance.suspended && compliance.kycVerified && compliance.amlPassed;
    }

    /**
     * @notice Get user compliance details
     * @param _user User address
     */
    function getUserCompliance(address _user)
        external
        view
        returns (UserCompliance memory)
    {
        return userCompliance[_user];
    }

    /**
     * @notice Toggle compliance requirement
     * @param _required True to require compliance
     */
    function setComplianceRequired(bool _required) external onlyOwner {
        complianceRequired = _required;
    }

    /**
     * @notice Check remaining claimable amount
     * @param _user User address
     */
    function getRemainableAmount(address _user)
        external
        view
        returns (uint256)
    {
        UserCompliance memory compliance = userCompliance[_user];
        if (compliance.totalClaimed >= compliance.maxClaimAmount) {
            return 0;
        }
        return compliance.maxClaimAmount - compliance.totalClaimed;
    }

    /**
     * @notice Batch verify KYC for multiple users
     * @param _users Array of user addresses
     */
    function batchVerifyKYC(address[] calldata _users) external onlyOwner {
        require(_users.length <= 500, "Too many users");

        for (uint256 i = 0; i < _users.length; i++) {
            if (_users[i] != address(0)) {
                userCompliance[_users[i]].kycVerified = true;
                userCompliance[_users[i]].lastVerificationTime = block.timestamp;
                _updateComplianceLevel(_users[i]);
            }
        }
    }

    /**
     * @notice Batch verify AML for multiple users
     * @param _users Array of user addresses
     */
    function batchVerifyAML(address[] calldata _users) external onlyOwner {
        require(_users.length <= 500, "Too many users");

        for (uint256 i = 0; i < _users.length; i++) {
            if (_users[i] != address(0)) {
                userCompliance[_users[i]].amlPassed = true;
                _updateComplianceLevel(_users[i]);
            }
        }
    }

    // Internal Functions

    function _updateComplianceLevel(address _user) internal {
        UserCompliance storage compliance = userCompliance[_user];

        if (!compliance.kycVerified && !compliance.amlPassed) {
            compliance.level = ComplianceLevel.NONE;
        } else if (compliance.kycVerified && !compliance.amlPassed) {
            compliance.level = ComplianceLevel.BASIC;
        } else if (compliance.kycVerified && compliance.amlPassed) {
            compliance.level = ComplianceLevel.VERIFIED;
        }

        emit ComplianceLevelUpdated(_user, compliance.level);
    }
}
