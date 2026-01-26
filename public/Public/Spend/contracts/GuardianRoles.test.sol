// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/GuardianRoles.sol";

contract GuardianRolesTest is Test {
    GuardianRoles guardianRoles;
    
    address vaultOwner = address(0x1);
    address guardian1 = address(0x2);
    address guardian2 = address(0x3);
    address guardian3 = address(0x4);
    address vaultAddress = address(0x5);
    
    function setUp() public {
        guardianRoles = new GuardianRoles();
    }
    
    // ============ Role Assignment Tests ============
    
    function testAssignSignerRole() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            0
        );
        
        GuardianRoles.GuardianRole role = guardianRoles.getGuardianRole(vaultAddress, guardian1);
        assertEq(uint256(role), uint256(GuardianRoles.GuardianRole.SIGNER));
    }
    
    function testAssignObserverRole() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian2,
            GuardianRoles.GuardianRole.OBSERVER,
            0
        );
        
        GuardianRoles.GuardianRole role = guardianRoles.getGuardianRole(vaultAddress, guardian2);
        assertEq(uint256(role), uint256(GuardianRoles.GuardianRole.OBSERVER));
    }
    
    function testAssignEmergencyOnlyRole() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian3,
            GuardianRoles.GuardianRole.EMERGENCY_ONLY,
            0
        );
        
        GuardianRoles.GuardianRole role = guardianRoles.getGuardianRole(vaultAddress, guardian3);
        assertEq(uint256(role), uint256(GuardianRoles.GuardianRole.EMERGENCY_ONLY));
    }
    
    function testAssignRoleWithExpiration() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        uint256 expirationTime = block.timestamp + 365 days;
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            expirationTime
        );
        
        GuardianRoles.GuardianRoleInfo memory info = guardianRoles.getGuardianRoleInfo(vaultAddress, guardian1);
        assertEq(info.expiresAt, expirationTime);
        assertEq(info.isActive, true);
    }
    
    function testCannotAssignToZeroAddress() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        vm.expectRevert("Invalid guardian address");
        guardianRoles.assignRole(
            vaultAddress,
            address(0),
            GuardianRoles.GuardianRole.SIGNER,
            0
        );
    }
    
    function testCannotAssignNoneRole() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        vm.expectRevert("Cannot assign NONE role");
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.NONE,
            0
        );
    }
    
    function testCannotAssignPastExpiration() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        uint256 pastTime = block.timestamp - 1;
        vm.expectRevert("Expiration must be in future");
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            pastTime
        );
    }
    
    // ============ Role Revocation Tests ============
    
    function testRevokeRole() public {
        // First assign a role
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            0
        );
        
        // Then revoke it
        guardianRoles.revokeRole(vaultAddress, guardian1);
        
        GuardianRoles.GuardianRole role = guardianRoles.getGuardianRole(vaultAddress, guardian1);
        assertEq(uint256(role), uint256(GuardianRoles.GuardianRole.NONE));
    }
    
    function testCannotRevokeNonexistentRole() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        vm.expectRevert("Guardian has no active role");
        guardianRoles.revokeRole(vaultAddress, guardian1);
    }
    
    // ============ Permission Tests ============
    
    function testSignerCanApproveRegularWithdrawal() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            0
        );
        
        bool canApprove = guardianRoles.canApproveRegularWithdrawal(vaultAddress, guardian1, 1 ether);
        assertTrue(canApprove);
    }
    
    function testSignerCanApproveEmergencyWithdrawal() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            0
        );
        
        bool canApprove = guardianRoles.canApproveEmergencyWithdrawal(vaultAddress, guardian1, 1 ether);
        assertTrue(canApprove);
    }
    
    function testObserverCannotApproveAnyWithdrawal() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian2,
            GuardianRoles.GuardianRole.OBSERVER,
            0
        );
        
        bool canApproveRegular = guardianRoles.canApproveRegularWithdrawal(vaultAddress, guardian2, 1 ether);
        bool canApproveEmergency = guardianRoles.canApproveEmergencyWithdrawal(vaultAddress, guardian2, 1 ether);
        
        assertFalse(canApproveRegular);
        assertFalse(canApproveEmergency);
    }
    
    function testObserverCanViewActivity() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian2,
            GuardianRoles.GuardianRole.OBSERVER,
            0
        );
        
        bool canView = guardianRoles.canViewActivity(vaultAddress, guardian2);
        assertTrue(canView);
    }
    
    function testEmergencyOnlyCanApproveEmergencyOnly() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian3,
            GuardianRoles.GuardianRole.EMERGENCY_ONLY,
            0
        );
        
        bool canApproveRegular = guardianRoles.canApproveRegularWithdrawal(vaultAddress, guardian3, 1 ether);
        bool canApproveEmergency = guardianRoles.canApproveEmergencyWithdrawal(vaultAddress, guardian3, 1 ether);
        
        assertFalse(canApproveRegular);
        assertTrue(canApproveEmergency);
    }
    
    // ============ Expiration Tests ============
    
    function testRoleExpiresAfterTime() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        uint256 expirationTime = block.timestamp + 1 days;
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            expirationTime
        );
        
        // Before expiration
        assertTrue(guardianRoles.isGuardianActive(vaultAddress, guardian1));
        
        // After expiration
        vm.warp(expirationTime + 1);
        assertFalse(guardianRoles.isGuardianActive(vaultAddress, guardian1));
    }
    
    function testCheckAndExpireRole() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        uint256 expirationTime = block.timestamp + 1 days;
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            expirationTime
        );
        
        // Advance time past expiration
        vm.warp(expirationTime + 1);
        
        // Call checkAndExpireRole
        guardianRoles.checkAndExpireRole(vaultAddress, guardian1);
        
        // Verify role is no longer active
        GuardianRoles.GuardianRole role = guardianRoles.getGuardianRole(vaultAddress, guardian1);
        assertEq(uint256(role), uint256(GuardianRoles.GuardianRole.NONE));
    }
    
    // ============ Active Guardians Tests ============
    
    function testGetActiveGuardians() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(vaultAddress, guardian1, GuardianRoles.GuardianRole.SIGNER, 0);
        guardianRoles.assignRole(vaultAddress, guardian2, GuardianRoles.GuardianRole.OBSERVER, 0);
        
        address[] memory activeGuardians = guardianRoles.getActiveGuardians(vaultAddress);
        assertEq(activeGuardians.length, 2);
    }
    
    function testActiveGuardianCountDecreasesOnRevoke() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(vaultAddress, guardian1, GuardianRoles.GuardianRole.SIGNER, 0);
        guardianRoles.assignRole(vaultAddress, guardian2, GuardianRoles.GuardianRole.OBSERVER, 0);
        
        uint256 countBefore = guardianRoles.getActiveGuardianCount(vaultAddress);
        
        guardianRoles.revokeRole(vaultAddress, guardian1);
        
        uint256 countAfter = guardianRoles.getActiveGuardianCount(vaultAddress);
        assertEq(countBefore - countAfter, 1);
    }
    
    // ============ Permission Configuration Tests ============
    
    function testUpdateRolePermissions() public {
        vm.startPrank(address(guardianRoles.owner()));
        
        guardianRoles.updateRolePermissions(
            GuardianRoles.GuardianRole.SIGNER,
            false,  // canApproveRegular
            true,   // canApproveEmergency
            true,   // canView
            false,  // canUpdate
            1 ether,
            5
        );
        
        GuardianRoles.RolePermissions memory perms = guardianRoles.getRolePermissions(
            GuardianRoles.GuardianRole.SIGNER
        );
        
        assertFalse(perms.canApproveRegularWithdrawals);
        assertTrue(perms.canApproveEmergencyWithdrawals);
        assertEq(perms.maxWithdrawalAmount, 1 ether);
        assertEq(perms.maxDailyWithdrawals, 5);
    }
    
    function testMaxWithdrawalAmountEnforced() public {
        vm.startPrank(vaultOwner);
        vm.mockCall(vaultAddress, abi.encodeWithSignature("owner()"), abi.encode(vaultOwner));
        
        guardianRoles.assignRole(
            vaultAddress,
            guardian1,
            GuardianRoles.GuardianRole.SIGNER,
            0
        );
        
        // Update signer max amount to 1 ether
        vm.startPrank(address(guardianRoles.owner()));
        guardianRoles.updateRolePermissions(
            GuardianRoles.GuardianRole.SIGNER,
            true,
            true,
            true,
            false,
            1 ether,
            0
        );
        
        // Should allow withdrawals up to 1 ether
        bool canApprove1 = guardianRoles.canApproveRegularWithdrawal(vaultAddress, guardian1, 1 ether);
        assertTrue(canApprove1);
        
        // Should reject withdrawals over 1 ether
        bool canApprove2 = guardianRoles.canApproveRegularWithdrawal(vaultAddress, guardian1, 2 ether);
        assertFalse(canApprove2);
    }
}
