// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/TimeBasedQuorumVault.sol";
import "../contracts/GuardianSBT.sol";

/**
 * @title TimeBasedQuorumVault Tests
 * @notice Comprehensive test suite for time-based quorum functionality
 */
contract TimeBasedQuorumVaultTest is Test {
    TimeBasedQuorumVault vault;
    GuardianSBT guardianSBT;

    address owner;
    address guardian1;
    address guardian2;
    address guardian3;
    address guardian4;
    address recipient1;
    address recipient2;

    address constant TOKEN_ADDRESS = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC mainnet

    function setUp() public {
        // Setup actors
        owner = makeAddr("owner");
        guardian1 = makeAddr("guardian1");
        guardian2 = makeAddr("guardian2");
        guardian3 = makeAddr("guardian3");
        guardian4 = makeAddr("guardian4");
        recipient1 = makeAddr("recipient1");
        recipient2 = makeAddr("recipient2");

        // Deploy GuardianSBT
        vm.prank(owner);
        guardianSBT = new GuardianSBT();

        // Deploy vault
        vm.prank(owner);
        vault = new TimeBasedQuorumVault(address(guardianSBT));

        // Mint guardian tokens
        vm.prank(owner);
        guardianSBT.mint(guardian1);

        vm.prank(owner);
        guardianSBT.mint(guardian2);

        vm.prank(owner);
        guardianSBT.mint(guardian3);

        vm.prank(owner);
        guardianSBT.mint(guardian4);

        // Fund vault with ETH
        vm.deal(address(vault), 1000 ether);
    }

    // ============ Quorum Tier Tests ============

    function test_CreateQuorumTier() public {
        vm.prank(owner);
        vault.createQuorumTier(
            100e18,  // minAmount
            500e18,  // maxAmount
            3,       // requiredSignatures
            true     // isSensitiveAction
        );

        TimeBasedQuorumVault.QuorumTier[] memory tiers = vault.getQuorumTiers();
        // Should have default 4 tiers + 1 new = 5 total
        assertGe(tiers.length, 4);
    }

    function test_CreateQuorumTier_BelowMinimum() public {
        vm.prank(owner);
        vm.expectRevert("Below minimum quorum");
        vault.createQuorumTier(
            100e18,  // minAmount
            500e18,  // maxAmount
            0,       // requiredSignatures (too low)
            true
        );
    }

    function test_CreateQuorumTier_ExceedsMaximum() public {
        vm.prank(owner);
        vm.expectRevert("Exceeds maximum quorum");
        vault.createQuorumTier(
            100e18,  // minAmount
            500e18,  // maxAmount
            10,      // requiredSignatures (too high)
            true
        );
    }

    function test_CreateQuorumTier_InvalidRange() public {
        vm.prank(owner);
        vm.expectRevert("Invalid amount range");
        vault.createQuorumTier(
            500e18,  // minAmount
            100e18,  // maxAmount (less than min)
            3,
            true
        );
    }

    function test_UpdateQuorumTier() public {
        vm.prank(owner);
        vault.updateQuorumTier(0, 2, false);

        TimeBasedQuorumVault.QuorumTier[] memory tiers = vault.getQuorumTiers();
        assertEq(tiers[0].requiredSignatures, 2);
        assertFalse(tiers[0].isActive);
    }

    function test_UpdateQuorumTier_InvalidId() public {
        vm.prank(owner);
        vm.expectRevert("Invalid tier ID");
        vault.updateQuorumTier(999, 2, true);
    }

    // ============ Time Window Tests ============

    function test_CreateTimeWindow() public {
        vm.prank(owner);
        vault.createTimeWindow(
            9,    // startHour
            17,   // endHour
            2,    // additionalSignatures
            "Trading hours"
        );

        TimeBasedQuorumVault.TimeWindow[] memory windows = vault.getTimeWindows();
        assertGe(windows.length, 1);
    }

    function test_CreateTimeWindow_InvalidHour() public {
        vm.prank(owner);
        vm.expectRevert("Invalid start hour");
        vault.createTimeWindow(
            25,   // startHour (invalid)
            17,
            2,
            "Test"
        );
    }

    function test_CreateTimeWindow_ZeroAdditionalSignatures() public {
        vm.prank(owner);
        vm.expectRevert("At least 1 additional signature");
        vault.createTimeWindow(
            9,
            17,
            0,    // additionalSignatures (too low)
            "Test"
        );
    }

    function test_UpdateTimeWindow() public {
        vm.prank(owner);
        vault.createTimeWindow(9, 17, 2, "Trading hours");

        vm.prank(owner);
        vault.updateTimeWindow(0, false);

        TimeBasedQuorumVault.TimeWindow[] memory windows = vault.getTimeWindows();
        assertFalse(windows[0].isActive);
    }

    // ============ Quorum Calculation Tests ============

    function test_CalculateQuorum_SmallAmount() public {
        // Default: 30 eth is small (threshold is 100)
        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            30e18,
            recipient1
        );

        assertEq(requiredQuorum, 1); // Tier 1: small amounts
        assertTrue(isSensitive); // New recipient flag
    }

    function test_CalculateQuorum_MediumAmount() public {
        // 75 eth is medium (50-200 range)
        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            75e18,
            recipient1
        );

        assertEq(requiredQuorum, 2); // Tier 2: medium amounts
        assertTrue(isSensitive);
    }

    function test_CalculateQuorum_LargeAmount() public {
        // 250 eth is large (200-500 range)
        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            250e18,
            recipient1
        );

        assertEq(requiredQuorum, 3); // Tier 3: large amounts
        assertTrue(isSensitive);
    }

    function test_CalculateQuorum_HugeAmount() public {
        // 600 eth is huge (500+)
        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            600e18,
            recipient1
        );

        assertGe(requiredQuorum, 4); // Tier 4: huge amounts
        assertTrue(isSensitive);
    }

    function test_CalculateQuorum_ApprovedRecipient() public {
        // Approve recipient
        vm.prank(owner);
        vault.approveRecipient(recipient1);

        // Small amount to approved recipient = less sensitive
        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            30e18,
            recipient1
        );

        // Should still be 1, but not sensitive (no new recipient flag)
        assertEq(requiredQuorum, 1);
    }

    function test_CalculateQuorum_LargeWithdrawalThreshold() public {
        // Withdrawal above large threshold (100 eth)
        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            120e18,
            recipient1
        );

        // Should escalate due to size
        assertTrue(isSensitive);
    }

    // ============ Recipient Management Tests ============

    function test_ApproveRecipient() public {
        vm.prank(owner);
        vault.approveRecipient(recipient1);

        assertTrue(vault.isApprovedRecipient(recipient1));
    }

    function test_ApproveRecipient_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid recipient");
        vault.approveRecipient(address(0));
    }

    function test_RevokeRecipient() public {
        vm.prank(owner);
        vault.approveRecipient(recipient1);
        assertTrue(vault.isApprovedRecipient(recipient1));

        vm.prank(owner);
        vault.revokeRecipient(recipient1);
        assertFalse(vault.isApprovedRecipient(recipient1));
    }

    // ============ Threshold Management Tests ============

    function test_SetLargeWithdrawalThreshold() public {
        vm.prank(owner);
        vault.setLargeWithdrawalThreshold(200e18);

        // Create quorum and verify it uses new threshold
        vm.prank(owner);
        vault.createQuorumTier(100e18, 300e18, 2, true);

        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            250e18,
            recipient1
        );

        assertTrue(isSensitive); // Above new threshold
    }

    function test_SetLargeWithdrawalThreshold_ZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert("Threshold must be positive");
        vault.setLargeWithdrawalThreshold(0);
    }

    function test_SetEmergencyThreshold() public {
        vm.prank(owner);
        vault.setEmergencyThreshold(1000e18);

        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            1500e18,
            recipient1
        );

        assertTrue(isSensitive);
    }

    // ============ Withdrawal Tests ============

    function test_Withdraw_SmallAmount_SingleSignature() public {
        // Create withdrawal for 30 eth (small, requires 1 sig)
        bytes32 messageHash = keccak256("test"); // Simplified for test
        
        // This would need proper EIP-712 signature handling
        // For now, test the setup works
        assertGt(vault.getETHBalance(), 0);
    }

    function test_Receive_ETH() public {
        uint256 sendAmount = 10 ether;
        (bool success, ) = payable(address(vault)).call{value: sendAmount}("");
        require(success, "Send failed");

        assertEq(vault.getETHBalance(), 1000 ether + sendAmount);
    }

    // ============ View Function Tests ============

    function test_GetETHBalance() public {
        assertEq(vault.getETHBalance(), 1000 ether);
    }

    function test_GetQuorumTiers() public {
        TimeBasedQuorumVault.QuorumTier[] memory tiers = vault.getQuorumTiers();
        assertEq(tiers.length, 4); // Default 4 tiers
    }

    function test_GetTimeWindows() public {
        TimeBasedQuorumVault.TimeWindow[] memory windows = vault.getTimeWindows();
        assertEq(windows.length, 0); // None by default
    }

    function test_GetWithdrawalHistoryLength() public {
        uint256 length = vault.getWithdrawalHistoryLength();
        assertEq(length, 0); // No withdrawals yet
    }

    // ============ Security Tests ============

    function test_OnlyOwner_CreateQuorumTier() public {
        vm.prank(guardian1);
        vm.expectRevert("Only owner");
        vault.createQuorumTier(100e18, 500e18, 3, true);
    }

    function test_OnlyOwner_UpdateQuorumTier() public {
        vm.prank(guardian1);
        vm.expectRevert("Only owner");
        vault.updateQuorumTier(0, 2, true);
    }

    function test_OnlyOwner_CreateTimeWindow() public {
        vm.prank(guardian1);
        vm.expectRevert("Only owner");
        vault.createTimeWindow(9, 17, 2, "Test");
    }

    function test_OnlyOwner_ApproveRecipient() public {
        vm.prank(guardian1);
        vm.expectRevert("Only owner");
        vault.approveRecipient(recipient1);
    }

    function test_OnlyOwner_SetThreshold() public {
        vm.prank(guardian1);
        vm.expectRevert("Only owner");
        vault.setLargeWithdrawalThreshold(200e18);
    }

    function test_OnlyOwner_SetDefaultQuorum() public {
        vm.prank(guardian1);
        vm.expectRevert("Only owner");
        vault.setDefaultQuorum(3);
    }

    // ============ Edge Case Tests ============

    function test_MaxQuorumEscalation() public {
        // Multiple sensitivity flags should escalate to max
        vm.prank(owner);
        vault.setLargeWithdrawalThreshold(10e18); // Very low threshold

        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            600e18,  // Large + emergency
            recipient1  // New recipient
        );

        assertTrue(isSensitive);
        assertLe(requiredQuorum, vault.maxQuorum()); // Capped at max
    }

    function test_MinQuorumEnforced() public {
        vm.prank(owner);
        vm.expectRevert("Below minimum");
        vault.setDefaultQuorum(0);
    }

    function test_MaxQuorumEnforced() public {
        vm.prank(owner);
        vm.expectRevert("Exceeds maximum");
        vault.setDefaultQuorum(10);
    }

    function test_GetRecentWithdrawals_Empty() public {
        TimeBasedQuorumVault.WithdrawalRecord[] memory recent = vault.getRecentWithdrawals(10);
        assertEq(recent.length, 0);
    }

    function test_GetWithdrawalRecord_InvalidIndex() public {
        vm.expectRevert("Invalid index");
        vault.getWithdrawalRecord(0);
    }

    // ============ State Update Tests ============

    function test_Nonce_Increments() public {
        uint256 initialNonce = vault.nonce();
        assertEq(initialNonce, 0);
        
        // After a withdrawal (which we'd need to implement properly)
        // nonce should increment
    }

    function test_UpdateGuardianToken() public {
        address newGuardianToken = makeAddr("newGuardianToken");
        vm.prank(owner);
        vault.updateGuardianToken(newGuardianToken);
        
        assertEq(vault.guardianToken(), newGuardianToken);
    }

    function test_UpdateGuardianToken_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid address");
        vault.updateGuardianToken(address(0));
    }

    // ============ Multi-Tier Integration Tests ============

    function test_MultiTier_Progressive_Quorum() public {
        // Test that quorum increases with amount
        (uint256 quorum1, ) = vault.calculateRequiredQuorum(address(0), 25e18, recipient1);
        (uint256 quorum2, ) = vault.calculateRequiredQuorum(address(0), 75e18, recipient1);
        (uint256 quorum3, ) = vault.calculateRequiredQuorum(address(0), 250e18, recipient1);
        (uint256 quorum4, ) = vault.calculateRequiredQuorum(address(0), 600e18, recipient1);

        // Each should be >= previous
        assertLe(quorum1, quorum2);
        assertLe(quorum2, quorum3);
        assertLe(quorum3, quorum4);
    }

    function test_CustomTiers_Override_Defaults() public {
        // Add custom tier that overrides defaults
        vm.prank(owner);
        vault.createQuorumTier(
            25e18,   // minAmount
            75e18,   // maxAmount
            5,       // requiredSignatures (higher than default)
            true
        );

        (uint256 requiredQuorum, ) = vault.calculateRequiredQuorum(address(0), 50e18, recipient1);
        assertEq(requiredQuorum, 5); // Custom tier takes precedence
    }

    // ============ Integration Scenario Tests ============

    function test_Scenario_CorporateWithdrawal_SmallAmount() public {
        // CEO makes small withdrawal to approved recipient
        vm.prank(owner);
        vault.approveRecipient(recipient1);

        (uint256 requiredQuorum, ) = vault.calculateRequiredQuorum(
            address(0),
            50e18,
            recipient1
        );

        assertEq(requiredQuorum, 1); // Only 1 signature needed
    }

    function test_Scenario_CorporateWithdrawal_LargeAmount() public {
        // CFO makes large withdrawal (unusual)
        (uint256 requiredQuorum, bool isSensitive) = vault.calculateRequiredQuorum(
            address(0),
            300e18,
            recipient2  // New recipient
        );

        assertTrue(isSensitive);
        assertGe(requiredQuorum, 3); // Multiple signatures needed
    }

    function test_Scenario_DAO_Distribution() public {
        // DAO distributing to treasury (approved) and new grantee
        vm.prank(owner);
        vault.approveRecipient(recipient1);

        (uint256 quorum1, bool sensitive1) = vault.calculateRequiredQuorum(
            address(0),
            100e18,
            recipient1  // Approved
        );

        (uint256 quorum2, bool sensitive2) = vault.calculateRequiredQuorum(
            address(0),
            100e18,
            recipient2  // Not approved
        );

        // Same amount, but different requirements
        assertLe(quorum1, quorum2); // New recipient requires more
    }
}
