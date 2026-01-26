// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GuardianRoles
 * @notice Manages different guardian roles with specific permissions
 * @dev Supports three roles: SIGNER, OBSERVER, and EMERGENCY_ONLY
 */
contract GuardianRoles is Ownable {
    
    // ============ Enums ============
    
    /**
     * @dev Guardian roles with different permission levels
     * SIGNER: Can approve regular withdrawals and emergency withdrawals
     * OBSERVER: Can view vault activity but cannot approve withdrawals
     * EMERGENCY_ONLY: Can only approve emergency withdrawals, not regular ones
     */
    enum GuardianRole {
        NONE,           // 0 - Not a guardian
        SIGNER,         // 1 - Full signing authority
        OBSERVER,       // 2 - Viewing only
        EMERGENCY_ONLY  // 3 - Emergency withdrawals only
    }
    
    // ============ Structs ============
    
    /**
     * @dev Guardian role information
     * @param role The current role of the guardian
     * @param assignedAt Timestamp when role was assigned
     * @param expiresAt Timestamp when role expires (0 = no expiration)
     * @param isActive Whether the guardian role is currently active
     */
    struct GuardianRoleInfo {
        GuardianRole role;
        uint256 assignedAt;
        uint256 expiresAt;
        bool isActive;
    }
    
    /**
     * @dev Role permissions configuration
     * @param canApproveRegularWithdrawals Can sign regular withdrawal requests
     * @param canApproveEmergencyWithdrawals Can sign emergency withdrawal requests
     * @param canView Can view vault activity and transactions
     * @param canUpdateGuardians Can update guardian list and roles
     * @param maxWithdrawalAmount Maximum amount this role can approve (0 = unlimited)
     * @param maxDailyWithdrawals Maximum number of withdrawals per day
     */
    struct RolePermissions {
        bool canApproveRegularWithdrawals;
        bool canApproveEmergencyWithdrawals;
        bool canView;
        bool canUpdateGuardians;
        uint256 maxWithdrawalAmount;
        uint256 maxDailyWithdrawals;
    }
    
    // ============ State Variables ============
    
    // Vault address => Guardian address => GuardianRoleInfo
    mapping(address => mapping(address => GuardianRoleInfo)) public guardianRoles;
    
    // Role => RolePermissions
    mapping(GuardianRole => RolePermissions) public rolePermissions;
    
    // Vault address => array of active guardians
    mapping(address => address[]) public activeGuardians;
    
    // Vault address => Guardian address => index in activeGuardians array
    mapping(address => mapping(address => uint256)) private guardianIndex;
    
    // ============ Events ============
    
    event RoleAssigned(
        address indexed vault,
        address indexed guardian,
        GuardianRole role,
        uint256 expiresAt
    );
    
    event RoleRevoked(
        address indexed vault,
        address indexed guardian,
        GuardianRole previousRole
    );
    
    event RoleExpired(
        address indexed vault,
        address indexed guardian,
        GuardianRole role
    );
    
    event PermissionsUpdated(
        GuardianRole role,
        bool canApproveRegular,
        bool canApproveEmergency,
        bool canView,
        bool canUpdateGuardians,
        uint256 maxAmount,
        uint256 maxDaily
    );
    
    event GuardianActivated(address indexed vault, address indexed guardian);
    event GuardianDeactivated(address indexed vault, address indexed guardian);
    
    // ============ Modifiers ============
    
    modifier onlyVaultOwner(address vault) {
        require(Ownable(vault).owner() == msg.sender, "Only vault owner can call this");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        _initializeDefaultPermissions();
    }
    
    // ============ Role Assignment Functions ============
    
    /**
     * @notice Assign a role to a guardian for a vault
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     * @param role The role to assign
     * @param expiresAt Timestamp when role expires (0 = no expiration)
     */
    function assignRole(
        address vault,
        address guardian,
        GuardianRole role,
        uint256 expiresAt
    ) external onlyVaultOwner(vault) {
        require(guardian != address(0), "Invalid guardian address");
        require(role != GuardianRole.NONE, "Cannot assign NONE role");
        require(expiresAt == 0 || expiresAt > block.timestamp, "Expiration must be in future");
        
        GuardianRoleInfo storage info = guardianRoles[vault][guardian];
        
        // Remove from active list if changing role
        if (info.isActive && info.role != GuardianRole.NONE) {
            _removeFromActiveGuardians(vault, guardian);
        }
        
        info.role = role;
        info.assignedAt = block.timestamp;
        info.expiresAt = expiresAt;
        info.isActive = true;
        
        _addToActiveGuardians(vault, guardian);
        
        emit RoleAssigned(vault, guardian, role, expiresAt);
    }
    
    /**
     * @notice Revoke a guardian's role
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     */
    function revokeRole(address vault, address guardian) external onlyVaultOwner(vault) {
        GuardianRoleInfo storage info = guardianRoles[vault][guardian];
        require(info.role != GuardianRole.NONE, "Guardian has no active role");
        
        GuardianRole previousRole = info.role;
        
        _removeFromActiveGuardians(vault, guardian);
        
        info.role = GuardianRole.NONE;
        info.isActive = false;
        info.expiresAt = 0;
        
        emit RoleRevoked(vault, guardian, previousRole);
    }
    
    /**
     * @notice Check if a guardian's role has expired and deactivate if necessary
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     */
    function checkAndExpireRole(address vault, address guardian) external {
        GuardianRoleInfo storage info = guardianRoles[vault][guardian];
        
        if (
            info.isActive &&
            info.expiresAt > 0 &&
            block.timestamp >= info.expiresAt
        ) {
            GuardianRole expiredRole = info.role;
            _removeFromActiveGuardians(vault, guardian);
            info.isActive = false;
            info.role = GuardianRole.NONE;
            
            emit RoleExpired(vault, guardian, expiredRole);
        }
    }
    
    // ============ Permission Query Functions ============
    
    /**
     * @notice Check if a guardian can approve a regular withdrawal
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     * @param amount Amount of the withdrawal
     * @return true if guardian can approve the withdrawal
     */
    function canApproveRegularWithdrawal(
        address vault,
        address guardian,
        uint256 amount
    ) external view returns (bool) {
        GuardianRoleInfo memory info = guardianRoles[vault][guardian];
        
        // Check if role is valid and not expired
        if (!_isRoleValid(info)) return false;
        
        RolePermissions memory perms = rolePermissions[info.role];
        
        // Check if role has permission and within limits
        if (!perms.canApproveRegularWithdrawals) return false;
        
        if (perms.maxWithdrawalAmount > 0 && amount > perms.maxWithdrawalAmount) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @notice Check if a guardian can approve an emergency withdrawal
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     * @param amount Amount of the withdrawal
     * @return true if guardian can approve the emergency withdrawal
     */
    function canApproveEmergencyWithdrawal(
        address vault,
        address guardian,
        uint256 amount
    ) external view returns (bool) {
        GuardianRoleInfo memory info = guardianRoles[vault][guardian];
        
        // Check if role is valid and not expired
        if (!_isRoleValid(info)) return false;
        
        RolePermissions memory perms = rolePermissions[info.role];
        
        // Check if role has permission and within limits
        if (!perms.canApproveEmergencyWithdrawals) return false;
        
        if (perms.maxWithdrawalAmount > 0 && amount > perms.maxWithdrawalAmount) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @notice Check if a guardian can view vault activity
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     * @return true if guardian can view vault activity
     */
    function canViewActivity(address vault, address guardian) external view returns (bool) {
        GuardianRoleInfo memory info = guardianRoles[vault][guardian];
        
        if (!_isRoleValid(info)) return false;
        
        return rolePermissions[info.role].canView;
    }
    
    /**
     * @notice Check if a guardian can update vault guardians
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     * @return true if guardian can update guardians
     */
    function canUpdateGuardians(address vault, address guardian) external view returns (bool) {
        GuardianRoleInfo memory info = guardianRoles[vault][guardian];
        
        if (!_isRoleValid(info)) return false;
        
        return rolePermissions[info.role].canUpdateGuardians;
    }
    
    // ============ Information Functions ============
    
    /**
     * @notice Get the role of a guardian for a vault
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     * @return role The guardian's role
     */
    function getGuardianRole(address vault, address guardian) 
        external 
        view 
        returns (GuardianRole role) 
    {
        return guardianRoles[vault][guardian].role;
    }
    
    /**
     * @notice Get complete role information for a guardian
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     * @return info The complete role information
     */
    function getGuardianRoleInfo(address vault, address guardian)
        external
        view
        returns (GuardianRoleInfo memory info)
    {
        return guardianRoles[vault][guardian];
    }
    
    /**
     * @notice Get all active guardians for a vault
     * @param vault Address of the vault
     * @return guardians Array of active guardian addresses
     */
    function getActiveGuardians(address vault)
        external
        view
        returns (address[] memory guardians)
    {
        return activeGuardians[vault];
    }
    
    /**
     * @notice Get count of active guardians for a vault
     * @param vault Address of the vault
     * @return count Number of active guardians
     */
    function getActiveGuardianCount(address vault) external view returns (uint256) {
        return activeGuardians[vault].length;
    }
    
    /**
     * @notice Get permissions for a specific role
     * @param role The role to query
     * @return perms The permissions for that role
     */
    function getRolePermissions(GuardianRole role)
        external
        view
        returns (RolePermissions memory perms)
    {
        return rolePermissions[role];
    }
    
    /**
     * @notice Check if a guardian is currently active
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     * @return true if guardian is active
     */
    function isGuardianActive(address vault, address guardian) 
        external 
        view 
        returns (bool)
    {
        return _isRoleValid(guardianRoles[vault][guardian]);
    }
    
    // ============ Permission Configuration Functions ============
    
    /**
     * @notice Update permissions for a role (only owner can call)
     * @param role The role to update
     * @param canApproveRegular Can approve regular withdrawals
     * @param canApproveEmergency Can approve emergency withdrawals
     * @param canView Can view activity
     * @param canUpdate Can update guardians
     * @param maxAmount Maximum withdrawal amount (0 = unlimited)
     * @param maxDaily Maximum daily withdrawals (0 = unlimited)
     */
    function updateRolePermissions(
        GuardianRole role,
        bool canApproveRegular,
        bool canApproveEmergency,
        bool canView,
        bool canUpdate,
        uint256 maxAmount,
        uint256 maxDaily
    ) external onlyOwner {
        require(role != GuardianRole.NONE, "Cannot update NONE role");
        
        rolePermissions[role] = RolePermissions({
            canApproveRegularWithdrawals: canApproveRegular,
            canApproveEmergencyWithdrawals: canApproveEmergency,
            canView: canView,
            canUpdateGuardians: canUpdate,
            maxWithdrawalAmount: maxAmount,
            maxDailyWithdrawals: maxDaily
        });
        
        emit PermissionsUpdated(
            role,
            canApproveRegular,
            canApproveEmergency,
            canView,
            canUpdate,
            maxAmount,
            maxDaily
        );
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Initialize default permissions for each role
     * @dev SIGNER: Full permissions, OBSERVER: View only, EMERGENCY_ONLY: Emergency only
     */
    function _initializeDefaultPermissions() internal {
        // SIGNER: Full permissions
        rolePermissions[GuardianRole.SIGNER] = RolePermissions({
            canApproveRegularWithdrawals: true,
            canApproveEmergencyWithdrawals: true,
            canView: true,
            canUpdateGuardians: false,
            maxWithdrawalAmount: 0, // unlimited
            maxDailyWithdrawals: 0  // unlimited
        });
        
        // OBSERVER: View only
        rolePermissions[GuardianRole.OBSERVER] = RolePermissions({
            canApproveRegularWithdrawals: false,
            canApproveEmergencyWithdrawals: false,
            canView: true,
            canUpdateGuardians: false,
            maxWithdrawalAmount: 0,
            maxDailyWithdrawals: 0
        });
        
        // EMERGENCY_ONLY: Can only approve emergency withdrawals
        rolePermissions[GuardianRole.EMERGENCY_ONLY] = RolePermissions({
            canApproveRegularWithdrawals: false,
            canApproveEmergencyWithdrawals: true,
            canView: true,
            canUpdateGuardians: false,
            maxWithdrawalAmount: 0,
            maxDailyWithdrawals: 0
        });
    }
    
    /**
     * @notice Check if a role is valid (active and not expired)
     * @param info The role information to check
     * @return true if role is valid
     */
    function _isRoleValid(GuardianRoleInfo memory info) internal view returns (bool) {
        if (!info.isActive || info.role == GuardianRole.NONE) {
            return false;
        }
        
        if (info.expiresAt > 0 && block.timestamp >= info.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @notice Add a guardian to the active guardians list
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     */
    function _addToActiveGuardians(address vault, address guardian) internal {
        address[] storage guardians = activeGuardians[vault];
        
        // Check if already in list
        bool alreadyExists = false;
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == guardian) {
                alreadyExists = true;
                break;
            }
        }
        
        if (!alreadyExists) {
            guardianIndex[vault][guardian] = guardians.length;
            guardians.push(guardian);
            emit GuardianActivated(vault, guardian);
        }
    }
    
    /**
     * @notice Remove a guardian from the active guardians list
     * @param vault Address of the vault
     * @param guardian Address of the guardian
     */
    function _removeFromActiveGuardians(address vault, address guardian) internal {
        address[] storage guardians = activeGuardians[vault];
        
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == guardian) {
                // Swap with last element and pop
                guardians[i] = guardians[guardians.length - 1];
                guardians.pop();
                
                // Update index for swapped element
                if (i < guardians.length) {
                    guardianIndex[vault][guardians[i]] = i;
                }
                
                emit GuardianDeactivated(vault, guardian);
                break;
            }
        }
    }
    
    /**
     * @notice Get the string representation of a role
     * @param role The role to convert
     * @return roleString The string representation
     */
    function getRoleString(GuardianRole role) external pure returns (string memory) {
        if (role == GuardianRole.SIGNER) return "SIGNER";
        if (role == GuardianRole.OBSERVER) return "OBSERVER";
        if (role == GuardianRole.EMERGENCY_ONLY) return "EMERGENCY_ONLY";
        return "NONE";
    }
}
