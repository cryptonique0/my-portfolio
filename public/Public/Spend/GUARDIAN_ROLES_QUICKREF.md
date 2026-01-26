# Guardian Roles Quick Reference

## Guardian Role Types

### 🔑 SIGNER (Role ID: 1)
**Full Authority** - Can approve all withdrawals
- ✅ Regular Withdrawals
- ✅ Emergency Withdrawals
- ✅ View Activity
- ⚠️ Cannot update other guardians (owner only)

**Default Limits:**
- Withdrawal Amount: Unlimited
- Daily Withdrawals: Unlimited

**Best For:** Trusted family members, financial advisors, primary account managers

---

### 👁️ OBSERVER (Role ID: 2)
**View-Only** - Can only monitor vault activity
- ❌ Regular Withdrawals
- ❌ Emergency Withdrawals
- ✅ View Activity
- ⚠️ Cannot update other guardians

**Default Limits:**
- No approval authority

**Best For:** Auditors, compliance officers, advisors, estate attorneys

---

### 🚨 EMERGENCY_ONLY (Role ID: 3)
**Limited Authority** - Can only approve emergency withdrawals
- ❌ Regular Withdrawals
- ✅ Emergency Withdrawals
- ✅ View Activity
- ⚠️ Cannot update other guardians

**Default Limits:**
- Withdrawal Amount: Unlimited
- Daily Withdrawals: Unlimited

**Best For:** Backup trustees, secondary guardians, high-priority contacts

---

## Deployment Checklist

```bash
# 1. Deploy GuardianRoles
✓ Deploy GuardianRoles contract
✓ Save contract address

# 2. Deploy SpendVaultWithRoles
✓ Use GuardianSBT address
✓ Use GuardianRoles address
✓ Set quorum requirement

# 3. Configure Roles
✓ Assign guardians to roles
✓ Set expiration times (if needed)
✓ Customize permissions (if needed)

# 4. Integrate Frontend
✓ Update withdrawal signature process
✓ Filter signers by role
✓ Show role status in UI
```

---

## Common Operations

### Assign a SIGNER
```solidity
guardianRoles.assignRole(
    vaultAddress,
    guardianAddress,
    1,  // GuardianRole.SIGNER
    0   // No expiration
);
```

### Assign a TEMPORARY OBSERVER (3 months)
```solidity
uint256 threeMonths = block.timestamp + 90 days;
guardianRoles.assignRole(
    vaultAddress,
    auditorAddress,
    2,  // GuardianRole.OBSERVER
    threeMonths
);
```

### Assign EMERGENCY_ONLY with 1-year expiration
```solidity
uint256 oneYear = block.timestamp + 365 days;
guardianRoles.assignRole(
    vaultAddress,
    emergencyContactAddress,
    3,  // GuardianRole.EMERGENCY_ONLY
    oneYear
);
```

### Revoke a Role
```solidity
guardianRoles.revokeRole(vaultAddress, guardianAddress);
```

### Check If Guardian Can Approve
```solidity
bool canApprove = guardianRoles.canApproveRegularWithdrawal(
    vaultAddress,
    guardianAddress,
    withdrawalAmount
);
```

### Get All Active Guardians
```solidity
address[] memory guardians = guardianRoles.getActiveGuardians(vaultAddress);
```

---

## Signature Requirements

### Regular Withdrawal
- ✅ SIGNER role
- ❌ OBSERVER (cannot sign)
- ❌ EMERGENCY_ONLY (cannot sign)
- Requires: Quorum from SIGNER guardians

### Emergency Withdrawal
- ✅ SIGNER role
- ❌ OBSERVER (cannot sign)
- ✅ EMERGENCY_ONLY role
- Requires: Quorum from SIGNER + EMERGENCY_ONLY guardians

### Example Setup: Quorum = 2
| Scenario | Guardian 1 | Guardian 2 | Result |
|----------|-----------|-----------|--------|
| Regular | SIGNER | SIGNER | ✅ Valid |
| Regular | SIGNER | OBSERVER | ❌ Invalid (need 2 signers) |
| Emergency | SIGNER | EMERGENCY_ONLY | ✅ Valid |
| Emergency | OBSERVER | OBSERVER | ❌ Invalid (observers can't sign) |

---

## Role Expiration Patterns

### No Expiration (Permanent)
```solidity
assignRole(vault, guardian, role, 0);  // 0 = never expires
```

### Temporary (Time-Bound)
```solidity
// 6 months
assignRole(vault, guardian, role, block.timestamp + 180 days);

// 1 year
assignRole(vault, guardian, role, block.timestamp + 365 days);

// Until specific date
assignRole(vault, guardian, role, 1704067200);  // Unix timestamp
```

### Check Remaining Time
```solidity
GuardianRoles.GuardianRoleInfo memory info = 
    guardianRoles.getGuardianRoleInfo(vault, guardian);
    
if (info.expiresAt > 0) {
    uint256 timeRemaining = info.expiresAt - block.timestamp;
}
```

---

## Permission Customization Examples

### Restrict SIGNER to $10k per withdrawal
```solidity
guardianRoles.updateRolePermissions(
    1,  // SIGNER
    true,      // Can approve regular
    true,      // Can approve emergency
    true,      // Can view
    false,     // Cannot update guardians
    10 ether,  // Max $10k withdrawal
    0          // Unlimited daily
);
```

### Restrict OBSERVER to view-only (already default)
```solidity
guardianRoles.updateRolePermissions(
    2,  // OBSERVER
    false,     // Cannot approve regular
    false,     // Cannot approve emergency
    true,      // Can view only
    false,     // Cannot update guardians
    0,         // No approval amount
    0          // No approval limit
);
```

### Limit EMERGENCY_ONLY to 2 withdrawals per day
```solidity
guardianRoles.updateRolePermissions(
    3,  // EMERGENCY_ONLY
    false,     // Cannot approve regular
    true,      // Can approve emergency
    true,      // Can view
    false,     // Cannot update guardians
    0,         // Unlimited amount
    2          // Max 2 per day
);
```

---

## Event Monitoring

### Track Role Changes
```javascript
// Listen for role assignments
guardianRoles.on("RoleAssigned", (vault, guardian, role, expiresAt) => {
    console.log(`Guardian ${guardian} assigned role ${role}`);
    if (expiresAt > 0) {
        console.log(`Expires in ${expiresAt - Date.now() / 1000} seconds`);
    }
});

// Listen for revocations
guardianRoles.on("RoleRevoked", (vault, guardian, previousRole) => {
    console.log(`Guardian ${guardian} role revoked`);
});

// Listen for expirations
guardianRoles.on("RoleExpired", (vault, guardian, role) => {
    console.log(`Guardian ${guardian} role expired`);
});
```

---

## Withdrawal Flow with Roles

### Frontend Implementation
```javascript
// 1. Get active guardians with their roles
const guardians = await guardianRoles.getActiveGuardians(vault);

// 2. Filter eligible signers
const eligibleSigners = guardians.filter(guardian => {
    return guardianRoles.canApproveRegularWithdrawal(vault, guardian, amount);
});

// 3. Show UI to select required signers
// Show: Name, Role, Expiration (if any)

// 4. Collect signatures from selected guardians
const signatures = await Promise.all(
    selectedGuardians.map(signer => signer.signWithdrawal(...))
);

// 5. Execute withdrawal
await vault.withdrawWithRoles(
    token,
    amount,
    recipient,
    reason,
    false,  // isEmergency
    signatures
);
```

---

## Troubleshooting

### Issue: "Guardian role inactive or expired"
**Cause:** Guardian role has expired or was revoked
**Solution:** 
1. Check expiration: `getGuardianRoleInfo(vault, guardian)`
2. Reassign role if needed
3. Call `checkAndExpireRole()` to update status

### Issue: "Insufficient valid signatures"
**Cause:** Some signers don't have permission for this withdrawal type
**Solution:**
1. Verify signer roles: `getGuardianRole(vault, guardian)`
2. Check `canApproveRegularWithdrawal()` / `canApproveEmergencyWithdrawal()`
3. Use guardians with correct roles

### Issue: "Duplicate signature"
**Cause:** Same guardian signed twice
**Solution:**
1. Ensure each guardian signs only once per withdrawal
2. Verify in frontend before submitting

### Issue: "Signer is not a guardian"
**Cause:** Address doesn't have SBT token
**Solution:**
1. Mint guardian SBT token: `guardianSBT.mint(address, vault)`
2. Verify with `IGuardianSBT(guardianToken).balanceOf(guardian)`

---

## Security Checklist

- [ ] GuardianRoles contract deployed and verified
- [ ] SpendVaultWithRoles contract deployed and verified
- [ ] All guardians have SBT tokens
- [ ] All guardians assigned appropriate roles
- [ ] Role expiration dates set correctly
- [ ] Quorum requirement matches number of SIGNER guardians
- [ ] Emergency timelock duration is acceptable
- [ ] Vault owner address is correct
- [ ] Role permissions customized per requirements
- [ ] Events being monitored for changes

---

## Gas Cost Estimates

| Operation | Gas (approx) |
|-----------|--------------|
| assignRole() | 45,000 |
| revokeRole() | 35,000 |
| canApproveRegularWithdrawal() | 3,000 (view) |
| withdrawWithRoles() | 80,000 - 150,000 |
| checkAndExpireRole() | 8,000 |
| getActiveGuardians() | 2,000 (view) |

---

## Integration Checklist

- [ ] Deploy GuardianRoles
- [ ] Deploy SpendVaultWithRoles
- [ ] Assign guardian roles
- [ ] Update frontend withdrawal form
- [ ] Add role filters to signer selection
- [ ] Implement role display in guardian list
- [ ] Add role expiration warnings
- [ ] Monitor role-related events
- [ ] Test withdrawal with different role combinations
- [ ] Verify permission enforcement
- [ ] Test role expiration behavior
- [ ] Document role assignments for audit trail

---

## API Quick Reference

| Function | Reads/Writes | Guardian Can Call |
|----------|-------|------|
| `assignRole()` | Write | Owner only |
| `revokeRole()` | Write | Owner only |
| `canApproveRegularWithdrawal()` | Read | Anyone |
| `canApproveEmergencyWithdrawal()` | Read | Anyone |
| `canViewActivity()` | Read | Anyone |
| `getGuardianRole()` | Read | Anyone |
| `getActiveGuardians()` | Read | Anyone |
| `withdrawWithRoles()` | Write | Any guardian |
| `checkAndExpireRole()` | Write | Anyone |
| `updateRolePermissions()` | Write | Owner only |

---

**Last Updated:** 2024
**Version:** 1.0
**Contracts:** GuardianRoles.sol, SpendVaultWithRoles.sol
