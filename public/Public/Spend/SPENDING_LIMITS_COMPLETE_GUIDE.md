# Spending Limits - Complete Implementation Guide

**Feature**: Daily, weekly, and monthly withdrawal caps enforced at the contract level  
**Status**: ✅ Production-Ready  
**Version**: 1.0  
**Solidity**: 0.8.20+  

---

## 📖 Overview

The Spending Limits feature provides multi-timeframe withdrawal controls:

- **Per-Guardian Limits**: Individual spending caps for each guardian
- **Vault-Level Limits**: Organization-wide spending controls
- **Three Timeframes**: Daily, weekly, and monthly (30-day) periods
- **Automatic Reset**: Limits reset at period boundaries
- **Multiple Tokens**: Separate limits per token
- **Independent Enforcement**: Each timeframe checked independently

---

## 🏗️ Architecture

### Components

```
SpendingLimits.sol
  ├─ Guardian Limits Management
  │  ├─ setGuardianLimit()
  │  ├─ removeGuardianLimit()
  │  ├─ checkGuardianLimit()
  │  └─ recordGuardianWithdrawal()
  │
  ├─ Vault Limits Management
  │  ├─ setVaultLimit()
  │  ├─ checkVaultLimit()
  │  └─ recordVaultWithdrawal()
  │
  └─ Period Reset Logic
     └─ _resetGuardianPeriods()
     └─ _resetVaultPeriods()

SpendVaultWithLimits.sol
  └─ Integration with SpendingLimits
     ├─ withdrawWithLimits()
     ├─ getGuardianLimitStatus()
     └─ getVaultLimitStatus()
```

### Data Structures

#### GuardianLimit
```solidity
struct GuardianLimit {
    bool isActive;              // Whether limit is enforced
    uint256 dailyLimit;         // Max daily withdrawal
    uint256 weeklyLimit;        // Max weekly withdrawal
    uint256 monthlyLimit;       // Max monthly withdrawal
    uint256 lastResetDay;       // Last reset timestamp (day)
    uint256 lastResetWeek;      // Last reset timestamp (week)
    uint256 lastResetMonth;     // Last reset timestamp (month)
}
```

#### GuardianSpending
```solidity
struct GuardianSpending {
    uint256 dailySpent;         // Amount spent today
    uint256 weeklySpent;        // Amount spent this week
    uint256 monthlySpent;       // Amount spent this month
}
```

---

## 🔧 Implementation Details

### Setting Guardian Limits

```solidity
// Set comprehensive limits
limitsContract.setGuardianLimit(
    address vault,
    address token,
    address guardian,
    uint256 dailyLimit,
    uint256 weeklyLimit,
    uint256 monthlyLimit
);
```

**Logic**:
1. Validates vault and guardian addresses
2. Creates/updates GuardianLimit struct
3. Initializes reset timestamps on first set
4. Emits GuardianLimitSet event

**Features**:
- Zero value = unlimited for that timeframe
- Can update existing limits anytime
- Separate limits per token
- Separate limits per vault

### Checking Limits

```solidity
(bool allowed, string memory reason) = limitsContract.checkGuardianLimit(
    vault,
    token,
    guardian,
    amount
);
```

**Logic**:
1. Returns early if limit inactive
2. Resets periods if boundaries crossed
3. Checks daily limit (if set)
4. Checks weekly limit (if set)
5. Checks monthly limit (if set)
6. Returns allowed status and reason

**Return Reasons**:
- `""` (empty) = allowed
- `"DAILY_LIMIT_EXCEEDED"` = daily overage
- `"WEEKLY_LIMIT_EXCEEDED"` = weekly overage
- `"MONTHLY_LIMIT_EXCEEDED"` = monthly overage

### Recording Withdrawals

```solidity
limitsContract.recordGuardianWithdrawal(
    vault,
    token,
    guardian,
    amount
);
```

**Logic**:
1. Resets periods if needed
2. Adds amount to daily/weekly/monthly spent
3. Emits GuardianWithdrawal event with updated amounts

### Period Reset Logic

```solidity
function _resetGuardianPeriods(...) private {
    uint256 currentDay = block.timestamp / ONE_DAY;
    uint256 currentWeek = block.timestamp / ONE_WEEK;
    uint256 currentMonth = block.timestamp / ONE_MONTH;
    
    // Reset if we've moved to a new period
    if (currentDay > (limit.lastResetDay / ONE_DAY)) {
        spending.dailySpent = 0;
        limit.lastResetDay = block.timestamp;
    }
    // ... same for week and month
}
```

**Constants**:
```solidity
uint256 private constant ONE_DAY = 86400;    // 24 hours
uint256 private constant ONE_WEEK = 604800;  // 7 days
uint256 private constant ONE_MONTH = 2592000; // 30 days
```

---

## 📊 Real-World Scenarios

### Scenario 1: Corporate Treasury

**Setup**:
```solidity
// CEO - Highest authority
setGuardianLimit(vault, USDC, ceo,
    10000e6,   // $10k daily
    50000e6,   // $50k weekly
    200000e6   // $200k monthly
);

// CFO - Financial oversight
setGuardianLimit(vault, USDC, cfo,
    5000e6,    // $5k daily
    25000e6,   // $25k weekly
    100000e6   // $100k monthly
);

// Treasurer - Operational
setGuardianLimit(vault, USDC, treasurer,
    2000e6,    // $2k daily
    10000e6,   // $10k weekly
    50000e6    // $50k monthly
);

// Vault-wide limit
setVaultLimit(vault, USDC,
    15000e6,   // $15k daily max across all
    70000e6,   // $70k weekly max across all
    300000e6   // $300k monthly max across all
);
```

**Usage**:
- Monday: CEO withdraws $10k → OK (hits CEO daily limit)
- Monday: CFO tries $7k → DENIED (exceeds CFO $5k daily limit)
- Tuesday: CEO withdraws $8k → OK (new day, fresh limit)

### Scenario 2: DAO with Spending Tiers

**Setup**:
```solidity
// Founder - Full discretion
setGuardianLimit(vault, USDC, founder,
    50000e6,   // $50k daily
    200000e6,  // $200k weekly
    500000e6   // $500k monthly
);

// Senior Developer - Mid-tier
setGuardianLimit(vault, USDC, seniorDev,
    10000e6,   // $10k daily
    50000e6,   // $50k weekly
    200000e6   // $200k monthly
);

// Junior Developer - Operational
setGuardianLimit(vault, USDC, juniorDev,
    2000e6,    // $2k daily
    10000e6,   // $10k weekly
    50000e6    // $50k monthly
);
```

**Benefits**:
- Roles have appropriate spending authority
- Prevents unauthorized large transfers
- Encourages escalation for large transactions
- Transparent spending governance

### Scenario 3: Family Trust

**Setup**:
```solidity
// Patriarch - Trustee with full authority
setGuardianLimit(vault, USDC, patriarch,
    5000e6,    // $5k daily
    20000e6,   // $20k weekly
    100000e6   // $100k monthly
);

// Adult Child - Significant authority
setGuardianLimit(vault, USDC, adultChild1,
    2000e6,    // $2k daily
    10000e6,   // $10k weekly
    50000e6    // $50k monthly
);

// Grandchild - Limited authority
setGuardianLimit(vault, USDC, grandchild,
    1000e6,    // $1k daily
    5000e6,    // $5k weekly
    20000e6    // $20k monthly
);
```

**Philosophy**:
- Authority scales with maturity/responsibility
- Prevents excessive withdrawals
- Allows emergency access if needed
- Clear governance structure

---

## 🔐 Security Considerations

### 1. Limit Enforcement Point
- Checks happen **before** fund transfer
- Prevents unauthorized amounts leaving vault
- ReentrancyGuard prevents state manipulation

### 2. Independent Timeframes
- All three must pass for approval
- Can't bypass one by staying under another
- Example: Hit daily limit but under weekly doesn't allow withdrawal

### 3. Vault-Level Backup
- Even if individual limits bypass (edge case)
- Vault total limit still enforced
- Provides second layer of protection

### 4. Automatic Reset
- No manual intervention needed
- Resets happen at period boundaries
- Unix timestamp based (UTC)

### 5. Multiple Tokens
- Limits tracked separately per token
- Can't combine different tokens to bypass
- ETH (address(0)) separate from ERC-20s

---

## 💾 Gas Optimization

### Storage Layout
- Mappings use (vault → token → guardian) keys
- Direct O(1) lookups
- No enumeration needed for checks

### Computation
- Period reset: O(1) comparison-only
- Limit check: O(3) for three comparisons
- Spending record: O(1) addition

### Typical Gas Costs

| Operation | Gas | Notes |
|-----------|-----|-------|
| Set Guardian Limit | ~50k | Includes event |
| Check Guardian Limit | ~5k | Simple comparisons |
| Record Withdrawal | ~25k | Updates + event |
| Get Remaining | ~8k | View function |

---

## 🧪 Testing Examples

### Test: Guardian Limit Active
```solidity
function testGuardianLimitEnforced() public {
    limitsContract.setGuardianLimit(vault, token, guardian1, 1 ether, 5 ether, 20 ether);
    
    (bool allowed,) = limitsContract.checkGuardianLimit(vault, token, guardian1, 2 ether);
    assertFalse(allowed); // Exceeds 1 ether daily
}
```

### Test: Period Reset
```solidity
function testDailyLimitResets() public {
    limitsContract.setGuardianLimit(vault, token, guardian1, 1 ether, 5 ether, 20 ether);
    limitsContract.recordGuardianWithdrawal(vault, token, guardian1, 1 ether);
    
    // Jump to next day
    vm.warp(block.timestamp + 1 days);
    
    (bool allowed,) = limitsContract.checkGuardianLimit(vault, token, guardian1, 1 ether);
    assertTrue(allowed); // Limit reset, new daily period
}
```

### Test: Vault Total Limit
```solidity
function testVaultTotalLimitEnforced() public {
    limitsContract.setVaultLimit(vault, token, 10 ether, 50 ether, 100 ether);
    
    (bool allowed,) = limitsContract.checkVaultLimit(vault, token, 15 ether);
    assertFalse(allowed); // Exceeds 10 ether daily
}
```

---

## 🔄 Integration Pattern

### In SpendVaultWithLimits

```solidity
function withdrawWithLimits(
    address token,
    uint256 amount,
    address recipient,
    string memory reason,
    bytes[] calldata signatures
) public onlyOwner nonReentrant vaultNotFrozen {
    // 1. Check guardian limits for each signer
    for (uint256 i = 0; i < signatures.length; i++) {
        (bool allowed, string memory reason) = limitsContract.checkGuardianLimit(
            address(this), token, signer, amount
        );
        require(allowed, reason);
    }
    
    // 2. Check vault-level limit
    (bool vaultAllowed, string memory vaultReason) = limitsContract.checkVaultLimit(
        address(this), token, amount
    );
    require(vaultAllowed, vaultReason);
    
    // 3. Record spending
    for (uint256 i = 0; i < signatures.length; i++) {
        limitsContract.recordGuardianWithdrawal(address(this), token, signer, amount);
    }
    limitsContract.recordVaultWithdrawal(address(this), token, amount);
    
    // 4. Execute withdrawal
    // ... transfer funds
}
```

---

## 📋 API Reference

### Guardian Limits

```solidity
// Set limits
setGuardianLimit(address vault, address token, address guardian, uint256 daily, uint256 weekly, uint256 monthly)

// Remove limits
removeGuardianLimit(address vault, address token, address guardian)

// Check limit
checkGuardianLimit(address vault, address token, address guardian, uint256 amount) 
  → (bool allowed, string memory reason)

// Record withdrawal
recordGuardianWithdrawal(address vault, address token, address guardian, uint256 amount)

// Query spending
getGuardianSpending(address vault, address token, address guardian)
  → (uint256 daily, uint256 weekly, uint256 monthly)

// Query remaining
getGuardianRemaining(address vault, address token, address guardian)
  → (uint256 dailyRemaining, uint256 weeklyRemaining, uint256 monthlyRemaining)
```

### Vault Limits

```solidity
// Set limits
setVaultLimit(address vault, address token, uint256 daily, uint256 weekly, uint256 monthly)

// Check limit
checkVaultLimit(address vault, address token, uint256 amount)
  → (bool allowed, string memory reason)

// Record withdrawal
recordVaultWithdrawal(address vault, address token, uint256 amount)

// Query spending
getVaultSpending(address vault, address token)
  → (uint256 daily, uint256 weekly, uint256 monthly)

// Query remaining
getVaultRemaining(address vault, address token)
  → (uint256 dailyRemaining, uint256 weeklyRemaining, uint256 monthlyRemaining)
```

---

## 🚀 Deployment Checklist

- [ ] Deploy SpendingLimits contract
- [ ] Deploy SpendVaultWithLimits contract (pass SpendingLimits address)
- [ ] Set guardian limits for each guardian/token
- [ ] Set vault limits for each token
- [ ] Test with small withdrawal (should pass)
- [ ] Test with large withdrawal (should fail with appropriate reason)
- [ ] Verify spending tracking works
- [ ] Run full test suite
- [ ] Transfer ownership to secure account

---

## ❓ FAQ

**Q: What happens when limits reset?**
A: Automatically at the next day/week/month boundary. No manual action needed.

**Q: Can I set different limits for different tokens?**
A: Yes. Limits are tracked separately per token.

**Q: What if daily and weekly limits conflict?**
A: Both must pass. If you hit daily limit, you can't withdraw even if weekly is open.

**Q: Can I update limits while funds are locked?**
A: Yes. Can update anytime. New limits apply to next withdrawal.

**Q: What happens if limit is 0?**
A: Zero means unlimited for that timeframe.

**Q: Are limits case-sensitive for tokens?**
A: Yes. address(0x...) and address(0x...) are different tokens.

---

**See also**: [SPENDING_LIMITS_INTEGRATION.js](SPENDING_LIMITS_INTEGRATION.js) for JavaScript integration examples
