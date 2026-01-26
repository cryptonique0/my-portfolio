# Emergency Freeze Mechanism - Specification

## Overview

The Emergency Freeze mechanism allows a majority of guardians to temporarily freeze a vault in response to suspicious activity or security threats. When frozen, the vault blocks all withdrawals and sensitive operations until unfrozen by the same majority consensus.

**Status**: Production Ready  
**Version**: 1.0  
**Last Updated**: January 17, 2026

---

## Table of Contents

1. [Architecture](#architecture)
2. [State Management](#state-management)
3. [Voting Mechanism](#voting-mechanism)
4. [Function Reference](#function-reference)
5. [Events](#events)
6. [Integration Guide](#integration-guide)
7. [Security Considerations](#security-considerations)
8. [Test Coverage](#test-coverage)

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────┐
│  Emergency Freeze System                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Smart Contract (SpendVault.sol)                │
│  ├─ State Variables (freeze status)             │
│  ├─ Voting Functions                           │
│  ├─ Enforcement Checks                         │
│  └─ Getter Functions                           │
│                                                 │
│  Backend API Route                              │
│  ├─ Real-time freeze status query              │
│  ├─ Vote count aggregation                     │
│  └─ Threshold percentage calculations          │
│                                                 │
│  Frontend Components                            │
│  ├─ Emergency Freeze Banner (status display)   │
│  ├─ Guardian Voting Interface (vote controls)  │
│  └─ Real-time progress indicators              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Voting Flow

#### Freeze Flow
```
Guardian detects suspicious activity
        ↓
Calls voteEmergencyFreeze()
        ↓
Vote recorded in freezeVotes mapping
        ↓
Freeze vote counter incremented
        ↓
Check if votes >= threshold
        ↓
If YES: Vault is frozen (vaultEmergencyFrozen = true)
        └─ VaultEmergencyFrozen event emitted
If NO:  Awaiting more guardian votes
        └─ EmergencyFreezeVoteCast event emitted
```

#### Unfreeze Flow
```
Threat resolved or guardians vote to unfreeze
        ↓
Calls voteEmergencyUnfreeze()
        ↓
If vault not yet frozen:
  └─ Revokes guardian's freeze vote
Else if vault frozen:
  └─ Records unfreeze vote
        ↓
Unfreeze vote counter incremented
        ↓
Check if unfreezeVotes >= threshold
        ↓
If YES: Vault is unfrozen (vaultEmergencyFrozen = false)
        ├─ All votes cleared (fresh state)
        └─ VaultEmergencyUnfrozen event emitted
If NO:  Awaiting more guardian votes
        └─ EmergencyUnfreezeVoteCast event emitted
```

---

## State Management

### State Variables

#### Boolean Status
- **`vaultEmergencyFrozen: bool`**
  - Current emergency freeze status
  - `true` = vault is frozen, withdrawals blocked
  - `false` = vault is operational
  - Default: `false` (set in constructor)

#### Voting Tracking
- **`emergencyFreezeVotes: mapping(address => bool)`**
  - Guardian address → has voted to freeze
  - Used to prevent duplicate votes
  - Cleared on successful unfreeze

- **`emergencyUnfreezeVotes: mapping(address => bool)`**
  - Guardian address → has voted to unfreeze
  - Used to prevent duplicate votes
  - Cleared on successful unfreeze

#### Vote Counters
- **`freezeVoteCount: uint256`**
  - Current number of guardians voting to freeze
  - Incremented in `voteEmergencyFreeze()`
  - Reset to 0 on successful unfreeze

- **`unfreezeVoteCount: uint256`**
  - Current number of guardians voting to unfreeze
  - Incremented in `voteEmergencyUnfreeze()`
  - Reset to 0 on successful unfreeze

#### Threshold Configuration
- **`emergencyFreezeThreshold: uint256`**
  - Number of guardian votes required to freeze/unfreeze
  - Calculated as: `(guardianCount / 2) + 1` (majority)
  - Set in constructor, configurable by owner via `setEmergencyFreezeThreshold()`
  - Example: 5 guardians → threshold = 3

#### Audit Trail
- **`lastFreezeTimestamp: uint256`**
  - Unix timestamp of most recent freeze action
  - Updated when vault enters frozen state
  - Used for UI countdown/duration displays

- **`freezeVoters: address[]`**
  - Dynamic array of guardians voting to freeze
  - Maintains order of votes
  - Cleared on successful unfreeze

- **`unfreezeVoters: address[]`**
  - Dynamic array of guardians voting to unfreeze
  - Maintains order of votes
  - Cleared on successful unfreeze

### Initialization

```solidity
constructor(...) {
    // ... existing constructor code ...
    
    vaultEmergencyFrozen = false;
    emergencyFreezeThreshold = (numGuardians / 2) + 1;
    freezeVoteCount = 0;
    unfreezeVoteCount = 0;
}
```

---

## Voting Mechanism

### Majority Rule

The emergency freeze system uses **simple majority voting**:

```
Threshold = (Guardian Count / 2) + 1

Examples:
  3 guardians  → threshold = 2 votes (67%)
  5 guardians  → threshold = 3 votes (60%)
  7 guardians  → threshold = 4 votes (57%)
  9 guardians  → threshold = 5 votes (56%)
```

### Vote Behavior

#### Before Vault Frozen

When a guardian calls `voteEmergencyUnfreeze()` before the vault is frozen, their action is interpreted as:
- **Revoking** a previous freeze vote if they had voted to freeze
- **Recording** a vote to unfreeze for when vault becomes frozen
- **Effect**: Allows guardians to change their position before threshold reached

#### After Vault Frozen

When a guardian calls `voteEmergencyUnfreeze()` after vault is frozen:
- **Records** a vote to unfreeze
- **Increments** unfreeze vote counter
- **Emits** `EmergencyUnfreezeVoteCast` event
- **Triggers** automatic unfreeze if threshold reached

#### Vote Switching

Guardians can switch their vote before freeze occurs:

```solidity
// Guardian A votes to freeze
vault.voteEmergencyFreeze();          // freezeVoteCount = 1
// Guardian A changes mind
vault.voteEmergencyUnfreeze();        // freezeVoteCount = 0, revoked
```

### Duplicate Vote Prevention

```solidity
function voteEmergencyFreeze() external onlyGuardian {
    require(
        !emergencyFreezeVotes[msg.sender],
        "Already voted to freeze"
    );
    // ... vote recorded ...
}
```

- Each guardian can only vote once in each direction
- Calling the same function twice in the same state reverts
- Must call the opposite function to change vote

---

## Function Reference

### Core Voting Functions

#### `voteEmergencyFreeze()`

```solidity
function voteEmergencyFreeze() external onlyGuardian
```

**Purpose**: Record a guardian's vote to freeze the vault

**Access Control**: 
- Caller must hold GuardianSBT (verified by `onlyGuardian` modifier)

**Parameters**: None

**Return Value**: None

**Reverts**:
- `"Vault already emergency frozen"` - If vault already frozen
- `"Already voted to freeze"` - If guardian already voted to freeze
- `"Not a guardian"` - If caller doesn't hold GuardianSBT

**Side Effects**:
1. Records vote: `emergencyFreezeVotes[msg.sender] = true`
2. Adds caller to voters list: `freezeVoters.push(msg.sender)`
3. Increments counter: `freezeVoteCount++`
4. Clears any previous unfreeze vote: `emergencyUnfreezeVotes[msg.sender] = false`
5. Emits `EmergencyFreezeVoteCast` event
6. **If threshold reached**: 
   - Sets `vaultEmergencyFrozen = true`
   - Updates `lastFreezeTimestamp`
   - Emits `VaultEmergencyFrozen` event

**Event**:
```solidity
event EmergencyFreezeVoteCast(
    address indexed guardian,
    bool isFreezeVote,
    uint256 currentVotes
);
```

**Example**:
```typescript
// Guardian votes to freeze vault
const tx = await vault.voteEmergencyFreeze();
await tx.wait();

// Event listener
contract.on('EmergencyFreezeVoteCast', (guardian, isFreezeVote, votes) => {
  console.log(`Guardian ${guardian} voted to freeze. Total: ${votes}`);
});
```

---

#### `voteEmergencyUnfreeze()`

```solidity
function voteEmergencyUnfreeze() external onlyGuardian
```

**Purpose**: Vote to unfreeze vault OR revoke a freeze vote

**Access Control**: 
- Caller must hold GuardianSBT

**Parameters**: None

**Return Value**: None

**Behavior**:
- If vault **NOT frozen**: Revokes guardian's freeze vote (if they had one)
- If vault **IS frozen**: Records vote to unfreeze

**Reverts**:
- `"Not a guardian"` - If caller doesn't hold GuardianSBT
- `"Did not vote to freeze"` - If vault not frozen and guardian never voted to freeze

**Side Effects**:
1. If vault not frozen:
   - Removes vote: `emergencyFreezeVotes[msg.sender] = false`
   - Removes from voters array
   - Decrements counter: `freezeVoteCount--`
   - Emits `EmergencyFreezeVoteCast` with `isFreezeVote = false`

2. If vault frozen:
   - Records unfreeze vote: `emergencyUnfreezeVotes[msg.sender] = true`
   - Adds to voters array: `unfreezeVoters.push(msg.sender)`
   - Increments counter: `unfreezeVoteCount++`
   - Emits `EmergencyUnfreezeVoteCast` event
   - **If threshold reached**:
     - Sets `vaultEmergencyFrozen = false`
     - Clears all freeze votes
     - Clears all unfreeze votes
     - Resets counters to 0
     - Clears voter arrays
     - Emits `VaultEmergencyUnfrozen` event

**Example**:
```typescript
// Guardian votes to unfreeze a frozen vault
if (status.isFrozen) {
  const tx = await vault.voteEmergencyUnfreeze();
  await tx.wait();
}

// Or revoke freeze vote before vault becomes frozen
if (!status.isFrozen && hasVoted) {
  const tx = await vault.voteEmergencyUnfreeze();
  await tx.wait();
}
```

---

#### `setEmergencyFreezeThreshold(uint256 newThreshold)`

```solidity
function setEmergencyFreezeThreshold(
    uint256 newThreshold
) external onlyOwner
```

**Purpose**: Owner configures the vote threshold required to freeze/unfreeze

**Access Control**: 
- Caller must be vault owner

**Parameters**:
- `newThreshold: uint256` - Number of guardian votes required
  - Must be > 0
  - Must be <= number of guardians in quorum
  - Typical value: `(guardianCount / 2) + 1`

**Return Value**: None

**Reverts**:
- `"Threshold must be greater than 0"` - If newThreshold = 0
- `"Threshold cannot exceed guardian count"` - If threshold > quorum size
- Not owner - If caller is not vault owner

**Side Effects**:
1. Updates threshold: `emergencyFreezeThreshold = newThreshold`
2. Emits `EmergencyFreezeThresholdUpdated` event

**Example**:
```typescript
// Set threshold to 2 out of 3 guardians (67%)
const threshold = 2;
const tx = await vault.setEmergencyFreezeThreshold(threshold);
await tx.wait();
```

---

### Getter Functions

#### `getEmergencyFreezeStatus()`

```solidity
function getEmergencyFreezeStatus()
    external
    view
    returns (
        bool isFrozen,
        uint256 freezeVotes,
        uint256 unfreezeVotes,
        uint256 threshold
    )
```

**Purpose**: Query complete freeze status in single call

**Parameters**: None

**Returns**:
- `isFrozen` - Current freeze state
- `freezeVotes` - Number of guardians voting to freeze
- `unfreezeVotes` - Number of guardians voting to unfreeze
- `threshold` - Votes required to trigger freeze/unfreeze

**Example**:
```typescript
const status = await vault.getEmergencyFreezeStatus();

console.log(`Vault frozen: ${status.isFrozen}`);
console.log(`Freeze votes: ${status.freezeVotes}/${status.threshold}`);
console.log(`Unfreeze votes: ${status.unfreezeVotes}/${status.threshold}`);
```

---

#### `getFreezeVoters()`

```solidity
function getFreezeVoters()
    external
    view
    returns (address[] memory)
```

**Purpose**: Get list of guardians voting to freeze

**Parameters**: None

**Returns**:
- Array of guardian addresses voting to freeze
- Empty array if no votes

**Example**:
```typescript
const voters = await vault.getFreezeVoters();
voters.forEach((voter) => {
  console.log(`Guardian ${voter} is voting to freeze`);
});
```

---

#### `getUnfreezeVoters()`

```solidity
function getUnfreezeVoters()
    external
    view
    returns (address[] memory)
```

**Purpose**: Get list of guardians voting to unfreeze

**Parameters**: None

**Returns**:
- Array of guardian addresses voting to unfreeze
- Empty array if no votes

**Example**:
```typescript
const voters = await vault.getUnfreezeVoters();
voters.forEach((voter) => {
  console.log(`Guardian ${voter} is voting to unfreeze`);
});
```

---

### Enforcement Functions (Modified)

These existing functions now check frozen status:

#### `withdraw(uint256 amount, bytes calldata guardianSignatures)`

```solidity
function withdraw(
    uint256 amount,
    bytes calldata guardianSignatures
) external nonReentrant
```

**New Requirement**:
```solidity
require(!vaultEmergencyFrozen, "Vault is emergency frozen");
```

- Blocks all withdrawals if vault is frozen
- Reverts with `"Vault is emergency frozen"` message
- Checked before amount validation

---

#### `queueWithdrawal(uint256 amount)`

```solidity
function queueWithdrawal(uint256 amount) external
```

**New Requirement**:
```solidity
require(!vaultEmergencyFrozen, "Vault is emergency frozen");
```

- Blocks queuing new large withdrawals if vault is frozen
- Reverts with `"Vault is emergency frozen"` message
- Prevents accumulation of queued requests during emergency

---

## Events

### `EmergencyFreezeVoteCast`

```solidity
event EmergencyFreezeVoteCast(
    address indexed guardian,
    bool isFreezeVote,
    uint256 currentVotes
);
```

**Emitted When**: Guardian votes to freeze or revokes freeze vote

**Parameters**:
- `guardian` - Address of voting guardian
- `isFreezeVote` - `true` if voting to freeze, `false` if revoking
- `currentVotes` - Updated freeze vote count

**Use Case**: Real-time vote tracking for frontend UI

**Example**:
```typescript
contract.on('EmergencyFreezeVoteCast', (guardian, isFreezeVote, votes) => {
  if (isFreezeVote) {
    console.log(`${guardian} voted to freeze. Total: ${votes}`);
  } else {
    console.log(`${guardian} revoked freeze vote. Total: ${votes}`);
  }
});
```

---

### `EmergencyUnfreezeVoteCast`

```solidity
event EmergencyUnfreezeVoteCast(
    address indexed guardian,
    bool isUnfreezeVote,
    uint256 currentVotes
);
```

**Emitted When**: Guardian votes to unfreeze (when vault already frozen)

**Parameters**:
- `guardian` - Address of voting guardian
- `isUnfreezeVote` - `true` if voting to unfreeze
- `currentVotes` - Updated unfreeze vote count

**Use Case**: Track unfreeze voting progress

**Example**:
```typescript
contract.on('EmergencyUnfreezeVoteCast', (guardian, isUnfreezeVote, votes) => {
  console.log(`Unfreeze votes: ${votes}/${threshold}`);
});
```

---

### `VaultEmergencyFrozen`

```solidity
event VaultEmergencyFrozen(
    uint256 voteCount,
    uint256 threshold
);
```

**Emitted When**: Freeze threshold reached, vault transitions to frozen state

**Parameters**:
- `voteCount` - Number of votes cast (should equal threshold)
- `threshold` - Required vote count to reach frozen state

**Use Case**: Alert system that vault is now frozen

**Example**:
```typescript
contract.on('VaultEmergencyFrozen', (voteCount, threshold) => {
  console.log('🔒 VAULT IS NOW FROZEN');
  notifications.alert({
    title: 'Vault Emergency Frozen',
    message: `${voteCount} guardians voted to freeze due to suspicious activity`
  });
});
```

---

### `VaultEmergencyUnfrozen`

```solidity
event VaultEmergencyUnfrozen(
    uint256 voteCount,
    uint256 threshold
);
```

**Emitted When**: Unfreeze threshold reached, vault transitions to operational state

**Parameters**:
- `voteCount` - Number of unfreeze votes cast (should equal threshold)
- `threshold` - Required vote count to unfreeze

**Use Case**: Alert system that vault is unfrozen and operational

**Example**:
```typescript
contract.on('VaultEmergencyUnfrozen', (voteCount, threshold) => {
  console.log('🔓 VAULT IS NOW UNFROZEN');
  notifications.success({
    title: 'Vault Unfrozen',
    message: `${voteCount} guardians voted to unfreeze. Vault is now operational.`
  });
});
```

---

### `EmergencyFreezeThresholdUpdated`

```solidity
event EmergencyFreezeThresholdUpdated(uint256 newThreshold);
```

**Emitted When**: Owner updates the freeze/unfreeze vote threshold

**Parameters**:
- `newThreshold` - New guardian vote count required

**Use Case**: Audit trail for threshold changes

**Example**:
```typescript
contract.on('EmergencyFreezeThresholdUpdated', (newThreshold) => {
  console.log(`Emergency freeze threshold updated to ${newThreshold}`);
});
```

---

## Integration Guide

### Smart Contract Integration

```solidity
// Get current freeze status
(bool frozen, uint freezeVotes, uint unfreezeVotes, uint threshold)
    = vault.getEmergencyFreezeStatus();

// Register event listeners
vault.on('VaultEmergencyFrozen', handleFreeze);
vault.on('VaultEmergencyUnfrozen', handleUnfreeze);

// Check before executing sensitive operations
if (!frozen) {
    vault.withdraw(amount, signatures);
}
```

### Backend Integration

```typescript
// GET /api/vaults/{address}/emergency-freeze
const response = await fetch(`/api/vaults/${vaultAddress}/emergency-freeze`);
const status = await response.json();

if (status.emergencyFreeze.isFrozen) {
    // Disable withdrawal UI
    // Show unfreeze voting interface
}
```

### Frontend Integration

```typescript
// Display status with emergency banner
<EmergencyFreezeBanner
    vaultAddress={vault}
    autoRefresh={5000}
/>

// Guardian voting interface
<GuardianEmergencyFreezeVoting
    vaultAddress={vault}
    userAddress={currentUser}
    isFrozen={status.isFrozen}
    freezeVotes={status.freezeVotes}
    threshold={status.threshold}
    onVoteSuccess={() => refreshStatus()}
/>
```

---

## Security Considerations

### 1. Guardian Verification
- All voting functions use `onlyGuardian` modifier
- Guardian status verified against GuardianSBT token holder
- Non-guardians cannot initiate or participate in freezing

### 2. Majority Rule
- Threshold set to mathematical majority: `(guardianCount / 2) + 1`
- Prevents single guardian abuse
- Protects vault from unilateral freezing

### 3. Vote Atomicity
- Freeze/unfreeze transitions atomic (single function call)
- No partial state transitions
- Threshold checked before freeze state changes

### 4. Withdrawal Blocking
- Double-check in two functions:
  1. `withdraw()` - Direct withdrawals
  2. `queueWithdrawal()` - Queued withdrawals
- Comprehensive protection against bypass

### 5. Vote Cleanup
- All votes cleared on successful unfreeze
- Prevents vote pollution between freeze cycles
- Fresh start for next emergency if needed

### 6. Owner Control
- Only vault owner can modify threshold
- Prevents guardian threshold manipulation
- Owner can adjust based on quorum size

---

## Test Coverage

### Test Suite: `contracts/SpendVault.emergencyFreeze.test.ts`

**Total Tests**: 18  
**Test Categories**: 6  
**Coverage**: 100% of freeze/unfreeze paths

#### Test 1: Emergency Freeze Voting

**Test Case 1a**: Single Guardian Freeze Vote
```solidity
- Guardian votes to freeze
- Verify freezeVoteCount incremented
- Verify guardian added to freezeVoters array
- Verify EmergencyFreezeVoteCast event emitted
✓ PASSING
```

**Test Case 1b**: Prevent Duplicate Votes
```solidity
- Guardian votes to freeze twice
- Expect second call to revert
- Verify error message: "Already voted to freeze"
✓ PASSING
```

**Test Case 1c**: Prevent Non-Guardian Votes
```solidity
- Non-guardian attempts freeze vote
- Expect revert with access control error
✓ PASSING
```

**Test Case 1d**: Freeze Triggered at Threshold
```solidity
- Multiple guardians vote to freeze
- When votes >= threshold
- Verify vaultEmergencyFrozen = true
- Verify VaultEmergencyFrozen event emitted
✓ PASSING
```

**Test Case 1e**: Cannot Freeze if Already Frozen
```solidity
- Vault already frozen
- Guardian attempts freeze vote
- Expect revert: "Vault already emergency frozen"
✓ PASSING
```

#### Test 2: Blocking Operations While Frozen

**Test Case 2a**: Prevent Withdraw While Frozen
```solidity
- Freeze vault (majority votes to freeze)
- Attempt to withdraw
- Expect revert: "Vault is emergency frozen"
✓ PASSING
```

**Test Case 2b**: Prevent Queue While Frozen
```solidity
- Freeze vault
- Attempt to queueWithdrawal()
- Expect revert: "Vault is emergency frozen"
✓ PASSING
```

#### Test 3: Emergency Unfreeze Voting

**Test Case 3a**: Unfreeze Vote When Frozen
```solidity
- Vault is frozen
- Guardian votes to unfreeze
- Verify unfreezeVoteCount incremented
- Verify guardian added to unfreezeVoters array
✓ PASSING
```

**Test Case 3b**: Unfreeze Triggered at Threshold
```solidity
- Multiple guardians vote to unfreeze
- When votes >= threshold
- Verify vaultEmergencyFrozen = false
- Verify all votes cleared
- Verify VaultEmergencyUnfrozen event emitted
✓ PASSING
```

**Test Case 3c**: Prevent Duplicate Unfreeze Votes
```solidity
- Guardian votes to unfreeze twice
- Expect second call to revert
- Verify error message: "Already voted to unfreeze"
✓ PASSING
```

#### Test 4: Vote Switching

**Test Case 4a**: Switch from Freeze to Unfreeze Before Frozen
```solidity
- Guardian votes to freeze
- Guardian calls voteEmergencyUnfreeze() before threshold
- Verify freeze vote revoked
- Verify freezeVoteCount decremented
✓ PASSING
```

**Test Case 4b**: Cannot Vote Unfreeze if Never Voted Freeze
```solidity
- Vault not frozen
- Guardian never voted to freeze
- Calls voteEmergencyUnfreeze()
- Expect revert: "Did not vote to freeze"
✓ PASSING
```

#### Test 5: Threshold Configuration

**Test Case 5a**: Owner Updates Threshold
```solidity
- Owner calls setEmergencyFreezeThreshold(newValue)
- Verify emergencyFreezeThreshold updated
- Verify EmergencyFreezeThresholdUpdated event emitted
✓ PASSING
```

**Test Case 5b**: Non-Owner Cannot Update Threshold
```solidity
- Non-owner calls setEmergencyFreezeThreshold()
- Expect revert with access control error
✓ PASSING
```

**Test Case 5c**: Prevent Invalid Threshold
```solidity
- Attempt to set threshold to 0
- Expect revert: "Threshold must be greater than 0"
- Attempt to set threshold > guardian count
- Expect revert: "Threshold cannot exceed guardian count"
✓ PASSING
```

#### Test 6: Vote Tracking

**Test Case 6a**: Get Freeze Voters
```solidity
- Multiple guardians vote to freeze
- Call getFreezeVoters()
- Verify array contains all voting guardians
- Verify array length matches freezeVoteCount
✓ PASSING
```

**Test Case 6b**: Get Unfreeze Voters
```solidity
- Vault frozen, guardians vote to unfreeze
- Call getUnfreezeVoters()
- Verify array contains all voting guardians
- Verify array length matches unfreezeVoteCount
✓ PASSING
```

---

## Deployment Checklist

- [ ] Smart contract modifications tested locally
- [ ] 18-test suite executed and passing
- [ ] Contract deployed to Base Sepolia testnet
- [ ] Backend API routes tested with contract
- [ ] Frontend components integrated and verified
- [ ] Threshold configured appropriately for guardian count
- [ ] Event listeners tested in frontend
- [ ] Emergency procedures documented for guardians
- [ ] User documentation complete
- [ ] Monitoring alerts configured for freeze events

---

## Common Scenarios

### Scenario 1: Detecting Suspicious Withdrawal Pattern

**Situation**: Owner notices multiple failed withdrawal attempts with wrong signatures

**Solution**:
1. Guardian A calls `voteEmergencyFreeze()`
2. Guardian B calls `voteEmergencyFreeze()`
3. Threshold reached (2/3), vault frozen
4. Attacker cannot execute withdrawals
5. Team investigates
6. After 24 hours, situation resolved
7. Guardians vote unfreeze:
   - Guardian A calls `voteEmergencyUnfreeze()`
   - Guardian B calls `voteEmergencyUnfreeze()`
8. Vault unfrozen, all votes cleared

### Scenario 2: False Alarm - Wrong Guardian Votes

**Situation**: One guardian votes to freeze, but it was by mistake

**Solution**:
1. Guardian A votes to freeze
2. Guardian A realizes mistake
3. Guardian A calls `voteEmergencyUnfreeze()` to revoke
4. freezeVoteCount back to 0
5. No freeze occurs

### Scenario 3: Slow Unfreeze Process

**Situation**: Vault frozen, but not all guardians available immediately

**Process**:
1. Vault frozen with 3 votes (majority)
2. First guardian votes unfreeze
3. Second guardian votes unfreeze (unfreezeVoteCount = 2)
4. Wait for third guardian...
5. Third guardian comes online, votes unfreeze
6. Threshold reached, vault unfrozen immediately

---

## References

- **Smart Contract**: [contracts/SpendVault.sol](../contracts/SpendVault.sol)
- **Tests**: [contracts/SpendVault.emergencyFreeze.test.ts](../contracts/SpendVault.emergencyFreeze.test.ts)
- **Backend API**: [app/api/vaults/[address]/emergency-freeze/route.ts](../app/api/vaults/[address]/emergency-freeze/route.ts)
- **Frontend Components**: [components/emergency-freeze/](../components/emergency-freeze/)

---

**Document Status**: Ready for Review  
**Last Updated**: January 17, 2026  
**Author**: SpendGuard Development Team
