# Guardian Roles Implementation Guide

## Overview

This guide covers the implementation of **Guardian Roles** - a feature that enables different guardian roles with specific permissions within the SpendGuard ecosystem. This allows vault owners to grant guardians varying levels of authority based on their responsibilities and trust levels.

## Guardian Roles

### Three Role Types

#### 1. **SIGNER** (Full Authority)
- **Description**: Full signing authority for all withdrawal types
- **Permissions**:
  - ✅ Approve regular withdrawals
  - ✅ Approve emergency withdrawals
  - ✅ View vault activity
  - ❌ Cannot update guardians (reserved for vault owner)
- **Use Cases**: Trusted financial advisors, primary family members, co-account managers
- **Default Limits**: Unlimited withdrawal amount and daily withdrawals

#### 2. **OBSERVER** (View-Only)
- **Description**: Can view vault activity but cannot approve any withdrawals
- **Permissions**:
  - ❌ Cannot approve regular withdrawals
  - ❌ Cannot approve emergency withdrawals
  - ✅ View vault activity
  - ❌ Cannot update guardians
- **Use Cases**: Auditors, compliance officers, advisory board members, family advisors
- **Default Limits**: No approval authority

#### 3. **EMERGENCY_ONLY** (Limited Authority)
- **Description**: Can only approve emergency withdrawals, not regular ones
- **Permissions**:
  - ❌ Cannot approve regular withdrawals
  - ✅ Approve emergency withdrawals
  - ✅ View vault activity
  - ❌ Cannot update guardians
- **Use Cases**: Backup guardians, secondary trustees, high-trust family members
- **Default Limits**: Unlimited emergency withdrawal amounts

## Smart Contracts

### GuardianRoles.sol

Central contract managing all guardian role functionality.

#### Key Structs

```solidity
enum GuardianRole {
    NONE,           // 0 - No role
    SIGNER,         // 1 - Full authority
    OBSERVER,       // 2 - View only
    EMERGENCY_ONLY  // 3 - Emergency only
}

struct GuardianRoleInfo {
    GuardianRole role;           // Current role
    uint256 assignedAt;          // When role was assigned
    uint256 expiresAt;           // When role expires (0 = never)
    bool isActive;               // Is role currently active
}

struct RolePermissions {
    bool canApproveRegularWithdrawals;
    bool canApproveEmergencyWithdrawals;
    bool canView;
    bool canUpdateGuardians;
    uint256 maxWithdrawalAmount;    // 0 = unlimited
    uint256 maxDailyWithdrawals;    // 0 = unlimited
}
```

#### Main Functions

**Role Assignment:**
```solidity
assignRole(address vault, address guardian, GuardianRole role, uint256 expiresAt)
```
- Assign or update a guardian's role for a specific vault
- Can set expiration time (optional)
- Only vault owner can call

**Role Revocation:**
```solidity
revokeRole(address vault, address guardian)
```
- Immediately remove a guardian's role
- Only vault owner can call

**Expiration Handling:**
```solidity
checkAndExpireRole(address vault, address guardian)
```
- Check if a role has expired and deactivate if needed
- Anyone can call (typically backend service)

**Permission Queries:**
```solidity
canApproveRegularWithdrawal(address vault, address guardian, uint256 amount) → bool
canApproveEmergencyWithdrawal(address vault, address guardian, uint256 amount) → bool
canViewActivity(address vault, address guardian) → bool
canUpdateGuardians(address vault, address guardian) → bool
```

**Information Functions:**
```solidity
getGuardianRole(address vault, address guardian) → GuardianRole
getGuardianRoleInfo(address vault, address guardian) → GuardianRoleInfo
getActiveGuardians(address vault) → address[]
getActiveGuardianCount(address vault) → uint256
getRolePermissions(GuardianRole role) → RolePermissions
isGuardianActive(address vault, address guardian) → bool
```

**Configuration:**
```solidity
updateRolePermissions(
    GuardianRole role,
    bool canApproveRegular,
    bool canApproveEmergency,
    bool canView,
    bool canUpdate,
    uint256 maxAmount,
    uint256 maxDaily
)
```
- Customize permissions for any role
- Only contract owner can call
- Applied globally to all vaults

### SpendVaultWithRoles.sol

Enhanced vault contract that integrates with GuardianRoles for role-based withdrawal approval.

#### Main Functions

**Withdrawal with Roles:**
```solidity
withdrawWithRoles(
    address token,
    uint256 amount,
    address recipient,
    string memory reason,
    bool isEmergency,
    bytes[] memory signatures
) external
```
- Execute withdrawal with role-based guardian approval
- Validates each signer's role and permissions
- Rejects signatures from guardians without proper role
- Requires minimum quorum of valid signatures

**Emergency Unlock:**
```solidity
requestEmergencyUnlock() external
executeEmergencyUnlock(address token) external
cancelEmergencyUnlock() external
getEmergencyUnlockTimeRemaining() external view
```
- Request emergency unlock with 30-day timelock
- Only vault owner can request/execute
- Full vault access after timelock

**Vault Freezing:**
```solidity
freezeVault() external      // Disable all withdrawals
unfreezeVault() external    // Re-enable withdrawals
```

## Integration Steps

### Step 1: Deploy GuardianRoles

```javascript
const GuardianRoles = await ethers.getContractFactory("GuardianRoles");
const guardianRoles = await GuardianRoles.deploy();
await guardianRoles.waitForDeployment();
const rolesAddress = await guardianRoles.getAddress();
```

### Step 2: Deploy SpendVaultWithRoles

```javascript
const SpendVaultWithRoles = await ethers.getContractFactory("SpendVaultWithRoles");
const vault = await SpendVaultWithRoles.deploy(
    guardianSBTAddress,  // Existing guardian SBT contract
    rolesAddress,        // GuardianRoles contract address
    2                    // Quorum
);
await vault.waitForDeployment();
```

### Step 3: Assign Guardian Roles

```javascript
// Assign SIGNER role to guardian1 (no expiration)
await guardianRoles.assignRole(
    vaultAddress,
    guardian1Address,
    1,  // GuardianRole.SIGNER
    0   // No expiration
);

// Assign OBSERVER role to guardian2 (1 year expiration)
const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
await guardianRoles.assignRole(
    vaultAddress,
    guardian2Address,
    2,  // GuardianRole.OBSERVER
    oneYearFromNow
);

// Assign EMERGENCY_ONLY role to guardian3 (6 month expiration)
const sixMonthsFromNow = Math.floor(Date.now() / 1000) + 6 * 30 * 24 * 60 * 60;
await guardianRoles.assignRole(
    vaultAddress,
    guardian3Address,
    3,  // GuardianRole.EMERGENCY_ONLY
    sixMonthsFromNow
);
```

### Step 4: Use Role-Based Withdrawals

```javascript
// Prepare withdrawal
const token = "0x0000000000000000000000000000000000000000"; // ETH
const amount = ethers.parseEther("10");
const recipient = "0x...";
const reason = "Household expenses";
const isEmergency = false;

// Get signatures from guardians with SIGNER role
const domain = {
    name: "SpendGuard",
    version: "1",
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: vaultAddress
};

const types = {
    Withdrawal: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "recipient", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "reason", type: "bytes32" },
        { name: "category", type: "bytes32" },
        { name: "createdAt", type: "uint256" }
    ]
};

const value = {
    token,
    amount,
    recipient,
    nonce: await vault.nonce(),
    reason: ethers.id(reason),
    category: ethers.id(isEmergency ? "emergency" : "regular"),
    createdAt: Math.floor(Date.now() / 1000)
};

// Get signatures from SIGNER guardians only
const sig1 = await guardian1.signTypedData(domain, types, value);
const sig2 = await guardian2.signTypedData(domain, types, value);

// Execute withdrawal
await vault.withdrawWithRoles(
    token,
    amount,
    recipient,
    reason,
    isEmergency,
    [sig1, sig2]
);
```

## Event Reference

### GuardianRoles Events

```solidity
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

event GuardianActivated(address indexed vault, address indexed guardian);
event GuardianDeactivated(address indexed vault, address indexed guardian);

event PermissionsUpdated(
    GuardianRole role,
    bool canApproveRegular,
    bool canApproveEmergency,
    bool canView,
    bool canUpdateGuardians,
    uint256 maxAmount,
    uint256 maxDaily
);
```

### SpendVaultWithRoles Events

```solidity
event WithdrawalApprovedByRole(
    address indexed guardian,
    GuardianRoles.GuardianRole role,
    uint256 nonce
);

event GuardianRoleCheckFailed(
    address indexed guardian,
    string reason,
    bool isEmergency
);

event VaultFrozen(address indexed by);
event VaultUnfrozen(address indexed by);
```

## Usage Examples

### Example 1: Family Trust Setup

```javascript
// Family with 3 guardians
const familyVault = "0x...";
const dadAddress = "0x...";
const momAddress = "0x...";
const sonAddress = "0x...";

// Dad: Full SIGNER authority
await guardianRoles.assignRole(familyVault, dadAddress, 1, 0);

// Mom: Full SIGNER authority
await guardianRoles.assignRole(familyVault, momAddress, 1, 0);

// Son: EMERGENCY_ONLY (until age 25)
const age25Date = Math.floor(Date.now() / 1000) + 5 * 365 * 24 * 60 * 60;
await guardianRoles.assignRole(familyVault, sonAddress, 3, age25Date);

// Required: 2 signatures
// Regular withdrawal: Dad + Mom (or Dad + Son is REJECTED)
// Emergency withdrawal: Dad + Son (valid, son has emergency role)
```

### Example 2: Corporate Treasury

```javascript
const treasuryVault = "0x...";

// CFO: SIGNER
await guardianRoles.assignRole(treasuryVault, cfoAddress, 1, 0);

// Treasurer: SIGNER
await guardianRoles.assignRole(treasuryVault, treasurerAddress, 1, 0);

// Auditor: OBSERVER (no signing authority)
await guardianRoles.assignRole(treasuryVault, auditorAddress, 2, 0);

// Chief Compliance: EMERGENCY_ONLY (emergency freezing only)
await guardianRoles.assignRole(treasuryVault, complianceAddress, 3, 0);

// Regular withdrawals: CFO + Treasurer
// Emergency unlock: Only CEO (vault owner) after 30-day timelock
// Audit: Auditor can view all activity
```

### Example 3: Expiring Roles

```javascript
// Temp guardian for 3 months
const threeMonthsFromNow = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60;
await guardianRoles.assignRole(
    vaultAddress,
    tempGuardianAddress,
    1,  // SIGNER role
    threeMonthsFromNow
);

// Role automatically becomes invalid after 3 months
// No need to manually revoke
```

### Example 4: Permission Customization

```javascript
// Restrict SIGNER role to max $10,000 per withdrawal
const maxAmount = ethers.parseEther("10");
const maxDaily = 5; // Max 5 withdrawals per day

await guardianRoles.updateRolePermissions(
    1,  // GuardianRole.SIGNER
    true,   // canApproveRegular
    true,   // canApproveEmergency
    true,   // canView
    false,  // canUpdateGuardians
    maxAmount,
    maxDaily
);

// Now only OBSERVER and EMERGENCY_ONLY keep original limits
```

## Security Considerations

1. **Role Validation**: Every signature is validated against the guardian's role
2. **Permission Enforcement**: Guardians without proper role are rejected (signatures skipped)
3. **Expiration Handling**: Expired roles automatically become inactive
4. **Signature Verification**: EIP-712 ensures type-safe signing
5. **Replay Protection**: Nonce increments after each withdrawal
6. **Emergency Timelock**: 30-day delay prevents rushed emergency withdrawals
7. **Vault Freezing**: Vault owner can freeze to prevent any activity during emergencies

## Gas Optimization Tips

1. **Batch Role Updates**: Update multiple guardians in one transaction when possible
2. **Check Expiration Offchain**: Run expiration checks via backend before attempting withdraw
3. **Use Observability Events**: Monitor events to sync guardian status in frontend cache
4. **Limit Active Guardians**: Keep number of active guardians reasonable for signature verification

## Troubleshooting

### "Guardian role inactive or expired"
- Check role expiration time: `await guardianRoles.getGuardianRoleInfo(vault, guardian)`
- Call `checkAndExpireRole()` to manually trigger expiration
- Reassign role if needed

### "Signer is not a guardian"
- Ensure guardian has SBT token: `await guardianSBT.balanceOf(guardian)`
- Ensure guardian is assigned a role

### "Insufficient valid signatures"
- Check that signers have SIGNER role (not OBSERVER or EMERGENCY_ONLY)
- For emergency: Use EMERGENCY_ONLY or SIGNER role only
- Verify quorum requirement: `await vault.quorum()`

### "Duplicate signature"
- Each guardian can only sign once per withdrawal
- Ensure you don't repeat the same guardian's signature

## Migration from Standard SpendVault

To migrate existing vaults to role-based system:

1. Deploy new GuardianRoles contract
2. Deploy new SpendVaultWithRoles contract
3. Assign roles to existing guardians:
   ```javascript
   // Existing signers → SIGNER role
   await guardianRoles.assignRole(newVault, existingGuardian, 1, 0);
   ```
4. Update frontend to use `withdrawWithRoles()` instead of `withdraw()`
5. Optionally sunset old vault after transition period

## Advanced Features

### Time-Locked Role Changes
```javascript
// Future-date role assignment (activate after certain date)
// Can be implemented with delayed execution pattern
```

### Conditional Permissions
```javascript
// Example: Different permissions based on amount
// Implemented via maxWithdrawalAmount parameter
```

### Role Rotation
```javascript
// Automated rotation using expiration + renewal logic
```

## API Reference Quick Lookup

| Function | Caller | Returns |
|----------|--------|---------|
| `assignRole()` | Vault Owner | - |
| `revokeRole()` | Vault Owner | - |
| `canApproveRegularWithdrawal()` | Anyone | bool |
| `canApproveEmergencyWithdrawal()` | Anyone | bool |
| `canViewActivity()` | Anyone | bool |
| `getGuardianRole()` | Anyone | GuardianRole |
| `getActiveGuardians()` | Anyone | address[] |
| `withdrawWithRoles()` | Anyone | - |
| `freezeVault()` | Vault Owner | - |
| `unfreezeVault()` | Vault Owner | - |

## Support

For questions or issues with guardian roles implementation:
1. Review the security considerations
2. Check the troubleshooting section
3. Examine event logs for detailed error information
4. Consult the integration examples for your use case
