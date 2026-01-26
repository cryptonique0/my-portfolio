// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RoleBasedAccessControl
 * @notice Hierarchical role-based access control system
 * @dev Supports Admin, Manager, Auditor roles with granular permissions
 */
contract RoleBasedAccessControl is Ownable {
    
    enum Role { ADMIN, MANAGER, AUDITOR, USER }
    
    struct RolePermission {
        bool canCreateAirdrop;
        bool canApproveAirdrop;
        bool canExecuteTransfer;
        bool canManageUsers;
        bool canAudit;
        bool canConfigureSystem;
        bool canWithdraw;
        bool canEmergencyPause;
    }
    
    mapping(address => Role) public userRole;
    mapping(Role => RolePermission) public rolePermissions;
    mapping(address => bool) public isRoleHolder;
    
    address[] public admins;
    address[] public managers;
    address[] public auditors;
    
    event RoleAssigned(address indexed user, Role role);
    event RoleRevoked(address indexed user, Role role);
    event PermissionUpdated(Role role, string permission, bool value);
    event RoleHolderCountUpdated(Role role, uint256 count);
    
    constructor() {
        _setupDefaultPermissions();
    }
    
    /**
     * @notice Assign role to user
     * @param _user User address
     * @param _role Role to assign
     */
    function assignRole(address _user, Role _role) external onlyOwner {
        require(_user != address(0), "Invalid user");
        
        if (isRoleHolder[_user]) {
            _removeFromRoleArray(_user, userRole[_user]);
        }
        
        userRole[_user] = _role;
        isRoleHolder[_user] = true;
        
        _addToRoleArray(_user, _role);
        
        emit RoleAssigned(_user, _role);
    }
    
    /**
     * @notice Revoke role from user
     * @param _user User address
     */
    function revokeRole(address _user) external onlyOwner {
        require(isRoleHolder[_user], "User has no role");
        require(_user != owner(), "Cannot revoke owner");
        
        Role previousRole = userRole[_user];
        _removeFromRoleArray(_user, previousRole);
        
        userRole[_user] = Role.USER;
        isRoleHolder[_user] = false;
        
        emit RoleRevoked(_user, previousRole);
    }
    
    /**
     * @notice Set permission for a role
     * @param _role Role to modify
     * @param _permission Permission name
     * @param _value True to grant, false to revoke
     */
    function setPermission(
        Role _role,
        string memory _permission,
        bool _value
    ) external onlyOwner {
        RolePermission storage perms = rolePermissions[_role];
        
        if (keccak256(bytes(_permission)) == keccak256(bytes("canCreateAirdrop"))) {
            perms.canCreateAirdrop = _value;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canApproveAirdrop"))) {
            perms.canApproveAirdrop = _value;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canExecuteTransfer"))) {
            perms.canExecuteTransfer = _value;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canManageUsers"))) {
            perms.canManageUsers = _value;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canAudit"))) {
            perms.canAudit = _value;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canConfigureSystem"))) {
            perms.canConfigureSystem = _value;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canWithdraw"))) {
            perms.canWithdraw = _value;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canEmergencyPause"))) {
            perms.canEmergencyPause = _value;
        }
        
        emit PermissionUpdated(_role, _permission, _value);
    }
    
    /**
     * @notice Check if user has permission
     * @param _user User address
     * @param _permission Permission name
     */
    function hasPermission(address _user, string memory _permission)
        external
        view
        returns (bool)
    {
        if (_user == owner()) return true;
        
        Role userRole_ = userRole[_user];
        RolePermission memory perms = rolePermissions[userRole_];
        
        if (keccak256(bytes(_permission)) == keccak256(bytes("canCreateAirdrop"))) {
            return perms.canCreateAirdrop;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canApproveAirdrop"))) {
            return perms.canApproveAirdrop;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canExecuteTransfer"))) {
            return perms.canExecuteTransfer;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canManageUsers"))) {
            return perms.canManageUsers;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canAudit"))) {
            return perms.canAudit;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canConfigureSystem"))) {
            return perms.canConfigureSystem;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canWithdraw"))) {
            return perms.canWithdraw;
        } else if (keccak256(bytes(_permission)) == keccak256(bytes("canEmergencyPause"))) {
            return perms.canEmergencyPause;
        }
        
        return false;
    }
    
    /**
     * @notice Get user role
     * @param _user User address
     */
    function getUserRole(address _user) external view returns (Role) {
        return userRole[_user];
    }
    
    /**
     * @notice Get role permissions
     * @param _role Role to check
     */
    function getRolePermissions(Role _role)
        external
        view
        returns (RolePermission memory)
    {
        return rolePermissions[_role];
    }
    
    /**
     * @notice Get admin count
     */
    function getAdminCount() external view returns (uint256) {
        return admins.length;
    }
    
    /**
     * @notice Get manager count
     */
    function getManagerCount() external view returns (uint256) {
        return managers.length;
    }
    
    /**
     * @notice Get auditor count
     */
    function getAuditorCount() external view returns (uint256) {
        return auditors.length;
    }
    
    /**
     * @notice Get all admins
     */
    function getAdmins() external view returns (address[] memory) {
        return admins;
    }
    
    /**
     * @notice Get all managers
     */
    function getManagers() external view returns (address[] memory) {
        return managers;
    }
    
    /**
     * @notice Get all auditors
     */
    function getAuditors() external view returns (address[] memory) {
        return auditors;
    }
    
    // Internal Functions
    
    function _setupDefaultPermissions() internal {
        // Admin permissions
        rolePermissions[Role.ADMIN] = RolePermission({
            canCreateAirdrop: true,
            canApproveAirdrop: true,
            canExecuteTransfer: true,
            canManageUsers: true,
            canAudit: true,
            canConfigureSystem: true,
            canWithdraw: true,
            canEmergencyPause: true
        });
        
        // Manager permissions
        rolePermissions[Role.MANAGER] = RolePermission({
            canCreateAirdrop: true,
            canApproveAirdrop: true,
            canExecuteTransfer: true,
            canManageUsers: true,
            canAudit: false,
            canConfigureSystem: false,
            canWithdraw: false,
            canEmergencyPause: false
        });
        
        // Auditor permissions
        rolePermissions[Role.AUDITOR] = RolePermission({
            canCreateAirdrop: false,
            canApproveAirdrop: false,
            canExecuteTransfer: false,
            canManageUsers: false,
            canAudit: true,
            canConfigureSystem: false,
            canWithdraw: false,
            canEmergencyPause: false
        });
    }
    
    function _addToRoleArray(address _user, Role _role) internal {
        if (_role == Role.ADMIN) {
            admins.push(_user);
        } else if (_role == Role.MANAGER) {
            managers.push(_user);
        } else if (_role == Role.AUDITOR) {
            auditors.push(_user);
        }
    }
    
    function _removeFromRoleArray(address _user, Role _role) internal {
        if (_role == Role.ADMIN) {
            _removeFromArray(admins, _user);
        } else if (_role == Role.MANAGER) {
            _removeFromArray(managers, _user);
        } else if (_role == Role.AUDITOR) {
            _removeFromArray(auditors, _user);
        }
    }
    
    function _removeFromArray(address[] storage arr, address _item) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == _item) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }
}
