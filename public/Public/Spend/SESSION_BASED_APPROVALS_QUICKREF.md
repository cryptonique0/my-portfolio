# Session-Based Approvals - Quick Reference

## 🚀 5-Minute Quick Start

### 1. Deploy
```bash
forge create contracts/SessionBasedApprovalsVault.sol:SessionBasedApprovalsVault \
  --constructor-args 0x[guardianSBT_address]
```

### 2. Create Session (Owner)
```javascript
const sessionId = await vault.createSession(
  24 * 60 * 60,  // 1 day duration
  100e18,        // 100 ETH budget
  "Marketing",   // Purpose
  false,         // Auto-spend allowed
  []             // All recipients (no restrictions)
);
// Result: Immediately ACTIVE
```

### 3. Create Session (Guardian)
```javascript
const sessionId = await vault.createSession(
  24 * 60 * 60,
  50e18,
  "Operations",
  false,
  []
);
// Result: PENDING (needs approvals)

// Guardian 2 approves
await vault.approveSession(sessionId);
// Result: ACTIVE (quorum reached)
```

### 4. Spend from Session
```javascript
await vault.spendFromSession(
  sessionId,
  address(0),    // ETH
  10e18,         // 10 ETH
  recipient,
  "Ad campaign"
);
// Result: Spend deducted, session budget reduced
```

---

## 📊 Session States

| State | Meaning | Can Spend? |
|-------|---------|-----------|
| **PENDING** | Waiting for approvals | ❌ No |
| **ACTIVE** | Approved & valid | ✅ Yes |
| **EXPIRED** | Past duration | ❌ No |
| **DEACTIVATED** | Manually stopped | ❌ No |
| **SPENT** | Budget exhausted | ❌ No |

---

## 🔧 Common Operations

### Create Session
```javascript
vault.createSession(
  duration,              // e.g., 1 days, 7 days
  totalApproved,         // e.g., 100e18
  purpose,               // e.g., "Q1 Budget"
  requiresApproval,      // true or false
  recipients             // [] or [0x..., 0x...]
)
// Returns: sessionId (bytes32)
```

### Approve Session (Guardian)
```javascript
vault.approveSession(sessionId)
// Adds 1 approval
// If reaches quorum → Auto-activates
```

### Spend from Session (Guardian)
```javascript
vault.spendFromSession(
  sessionId,
  token,                 // address(0) for ETH
  amount,
  recipient,
  reason
)
// Deducts from budget
// Records in history
// May auto-deactivate if fully spent
```

### Deactivate Session (Owner or Creator)
```javascript
vault.deactivateSession(sessionId, "Budget change")
// Stops further spending
// Existing spending tracked
```

### Add Recipient
```javascript
vault.addSessionRecipient(sessionId, newRecipient)
```

### Remove Recipient
```javascript
vault.removeSessionRecipient(sessionId, oldRecipient)
```

---

## 📈 Check Session Status

### Get Session Details
```javascript
const session = await vault.getSession(sessionId);
// Returns:
// - sessionId, initiator, createdAt, expiresAt
// - totalApproved, totalSpent
// - allowedRecipients, isActive, purpose
// - approvalsReceived, approvalsRequired
```

### Check if Valid
```javascript
const valid = await vault.isSessionValid(sessionId);
// true if: isActive AND not expired
```

### Get Time Remaining
```javascript
const timeLeft = await vault.getSessionTimeRemaining(sessionId);
// returns: seconds until expiration (0 if expired)
```

### Get Budget Remaining
```javascript
const remaining = await vault.getSessionRemaining(sessionId);
// returns: totalApproved - totalSpent
```

### Get Spending History
```javascript
const spends = await vault.getSessionSpends(sessionId);
// Returns array of:
// - token, amount, recipient, timestamp, reason
```

### Check Active Sessions
```javascript
const active = await vault.getActiveSessions();
// Returns array of sessionId bytes32[]
```

---

## 💡 Common Scenarios

### Scenario 1: Fast Vendor Payment
```javascript
// Owner approves vendor payments
const sessionId = await vault.createSession(
  7 days, 10000e18, "Vendor Payments",
  false,  // Auto-spend
  [vendorA, vendorB, vendorC]
);

// Spend 3x during week
await vault.spendFromSession(sessionId, USDC, 2000e18, vendorA, "Invoice #001");
await vault.spendFromSession(sessionId, USDC, 1500e18, vendorB, "Invoice #002");
await vault.spendFromSession(sessionId, USDC, 3000e18, vendorC, "Supplies");

// Session auto-expires in 7 days
```

### Scenario 2: Employee Reimbursement
```javascript
// Guardian initiates reimbursement session
const sessionId = await vault.createSession(
  1 hours,  // Short window
  500e18,   // Limited amount
  "Travel Reimbursement",
  false,
  []  // Any recipient
);
// Status: PENDING

// Other guardian approves
await vault.approveSession(sessionId);
// Status: ACTIVE

// Immediately reimburse
await vault.spendFromSession(sessionId, USDC, 300e18, employeeAddress, "Travel");
```

### Scenario 3: Budget by Department
```javascript
// Create separate sessions for each team
const marketing = await vault.createSession(
  30 days, 50000e18, "Marketing Budget",
  false, [marketingAgency, adNetwork]
);

const ops = await vault.createSession(
  30 days, 30000e18, "Operations Budget",
  false, [vendor1, vendor2, vendor3]
);

const rd = await vault.createSession(
  30 days, 100000e18, "R&D Budget",
  false, []  // No restrictions
);

// Each team spends within their session
// Automatic isolation and budget control
```

### Scenario 4: Emergency Spending
```javascript
// CEO wants emergency access
// Creates limited session
const sessionId = await vault.createSession(
  1 hours,  // 1 hour only
  1000e18,  // Limited amount
  "Emergency Operations",
  false,
  []
);
// Status: PENDING

// CFO quickly approves
await vault.approveSession(sessionId);
// Status: ACTIVE

// Can spend for 1 hour only
// Auto-expires after
```

---

## ⚙️ Configuration

### View Current Settings
```javascript
const minDuration = await vault.minSessionDuration();      // seconds
const maxDuration = await vault.maxSessionDuration();      // seconds
const quorum = await vault.defaultApprovalQuorum();        // number
```

### Change Duration Limits
```javascript
// Min 5 minutes, max 90 days
vault.setMinSessionDuration(5 * 60);
vault.setMaxSessionDuration(90 * 24 * 60 * 60);
```

### Change Approval Quorum
```javascript
// Require 3 guardians for all new sessions
vault.setDefaultApprovalQuorum(3);
```

---

## 🧪 Testing

### Test Session Creation
```bash
forge test -k "test_CreateSession" -v
# Tests: Basic creation, by owner, by guardian
```

### Test Approval
```bash
forge test -k "test_ApproveSession" -v
# Tests: Approval, quorum, activation
```

### Test Spending
```bash
forge test -k "test_SpendFromSession" -v
# Tests: Spending, limits, expiration
```

### Test All
```bash
forge test contracts/SessionBasedApprovals.test.sol -v
# Tests: 50+ comprehensive test cases
```

---

## 🔍 Debugging

### Session Won't Activate
Check:
- [ ] Is it a pending session? (Created by guardian)
- [ ] Have enough guardians approved? (Check approvalsReceived vs approvalsRequired)
- [ ] Is approval quorum met?

```javascript
const session = await vault.getSession(sessionId);
console.log(`Approvals: ${session.approvalsReceived}/${session.approvalsRequired}`);
```

### Can't Spend from Session
Check:
- [ ] Session is ACTIVE? (session.isActive)
- [ ] Session not expired? (block.timestamp < expiresAt)
- [ ] Budget available? (totalApproved > totalSpent + newAmount)
- [ ] Recipient allowed? (in recipients list or list is empty)
- [ ] Caller is guardian? (holds SBT)

```javascript
const session = await vault.getSession(sessionId);
const valid = await vault.isSessionValid(sessionId);
const timeLeft = await vault.getSessionTimeRemaining(sessionId);
const budgetLeft = await vault.getSessionRemaining(sessionId);
const allowed = await vault.isRecipientAllowed(sessionId, recipient);

console.log({ valid, timeLeft, budgetLeft, allowed });
```

### Session Expired
```javascript
// Claim expired session
vault.expireSession(sessionId);

// Or check remaining time
const timeLeft = await vault.getSessionTimeRemaining(sessionId);
if (timeLeft === 0) {
    console.log("Session has expired");
}
```

### Wrong Recipient
```javascript
// If restricted, check allowed list
const recipients = await vault.getSessionRecipients(sessionId);
console.log("Allowed recipients:", recipients);

// Add new recipient if needed
await vault.addSessionRecipient(sessionId, newRecipient);
```

---

## 📋 Duration Reference

| Duration | Seconds | Use Case |
|----------|---------|----------|
| 30 seconds | 30 | Testing |
| 1 minute | 60 | Very quick approvals |
| 5 minutes | 300 | Quick turnaround |
| 1 hour | 3600 | Same-day operations |
| 8 hours | 28800 | Business day |
| 1 day | 86400 | Daily budget |
| 7 days | 604800 | Weekly budget |
| 30 days | 2592000 | Monthly budget |
| 90 days | 7776000 | Quarterly budget |

---

## 🎯 Spending Patterns

### Pattern 1: Frequent Small Spend
```javascript
// Long duration, auto-spend, no restrictions
vault.createSession(30 days, 10000e18, "Ops", false, [])
// Can spend many times up to limit
```

### Pattern 2: One-Time Large Spend
```javascript
// Short duration, requires approval
vault.createSession(1 hours, 5000e18, "Purchase", true, [vendor])
// Single transaction, expires if not used
```

### Pattern 3: Restricted Vendor Payments
```javascript
// Medium duration, auto-spend, restricted
vault.createSession(7 days, 5000e18, "Vendor", false, [v1, v2, v3])
// Only these 3 vendors can receive
```

---

## 📊 Metrics

| Metric | Example |
|--------|---------|
| Sessions Created | `vault.getSessionHistoryLength()` |
| Active Now | `vault.getActiveSessions().length` |
| Total Spent | Sum all `SessionSpend` amounts |
| Budget Utilization | (totalSpent / totalApproved) * 100 |
| Time Used | (now - createdAt) / duration |

---

## ✅ Checklist: Starting a Session

- [ ] Decide: Owner or guardian creates?
- [ ] Set duration (1 min - 30 days)
- [ ] Set budget (amount to approve)
- [ ] Clear purpose (what for?)
- [ ] Decide: Require approval per spend? (rarely yes)
- [ ] List recipients (empty = all, or specific list)
- [ ] Create session
- [ ] (If guardian) Wait for approvals
- [ ] (If pending) Collect 2+ approvals
- [ ] Session becomes ACTIVE
- [ ] Start spending!

---

## 🚨 Safety Tips

1. **Start Small**: Test with small amounts first
2. **Time Limits**: Always set reasonable durations
3. **Budget Restrictions**: Don't over-approve
4. **Recipient Lists**: Restrict when possible
5. **Monitor**: Check spending regularly
6. **Audit**: Review complete history
7. **Deactivate**: Stop sessions that aren't needed

---

## 📞 Common Commands

```javascript
// Create
vault.createSession(1 days, 100e18, "Budget", false, [])

// Approve
vault.approveSession(sessionId)

// Spend
vault.spendFromSession(sessionId, token, amount, recipient, "reason")

// Check
vault.getSession(sessionId)
vault.getSessionRemaining(sessionId)
vault.isSessionValid(sessionId)

// Query
vault.getActiveSessions()
vault.getSessionSpends(sessionId)
vault.getSessionTimeRemaining(sessionId)

// Manage
vault.addSessionRecipient(sessionId, recipient)
vault.removeSessionRecipient(sessionId, recipient)
vault.deactivateSession(sessionId, "reason")
vault.expireSession(sessionId)
```

---

## 🎓 Learning Path

1. **Understand**: Read overview above
2. **Example**: Walk through one scenario
3. **Deploy**: Follow "5-Minute Quick Start"
4. **Test**: Run test suite
5. **Configure**: Adjust durations/quorum for your needs
6. **Use**: Create your first session!

---

**Quick Start**: ✅ Ready  
**Production**: ✅ Ready  
**Version**: 1.0  
**Last Updated**: January 2025
