# Emergency Freeze Mechanism - Quick Reference

## TL;DR

**Emergency Freeze**: Guardians can vote to temporarily freeze the vault (block all withdrawals) if suspicious activity is detected. Requires majority consensus (e.g., 2 of 3 guardians).

**When Frozen**: No withdrawals possible until majority votes to unfreeze.

**Status**: 🟢 Production Ready

---

## Quick Start for Guardians

### To Vote Freeze (Emergency Mode)

1. Open vault dashboard
2. See "Emergency Freeze" section
3. Click **"🔒 Vote to Freeze Vault"** button
4. Confirm in wallet
5. Status updates when threshold reached
6. If 2/3+ guardians vote: **VAULT FROZEN** ✓

### To Vote Unfreeze (Recovery Mode)

1. When vault frozen, see red "VAULT EMERGENCY FROZEN" banner
2. Click **"🔓 Vote to Unfreeze Vault"** button
3. Confirm in wallet
4. When 2/3+ guardians vote: **VAULT UNFROZEN** ✓

### To Revoke Your Vote (Before Freeze)

1. Before freeze occurs, you can change your mind
2. Click **"Revoke Vote"** button
3. Your freeze vote is canceled
4. Vote counter decreases

---

## Smart Contract Functions

### Main Functions

| Function | When to Use | Who Can Call | Effect |
|----------|------------|------------|--------|
| `voteEmergencyFreeze()` | Initiate emergency freeze | Guardians only | Vote to freeze vault (blocks withdrawals) |
| `voteEmergencyUnfreeze()` | Unfreeze vault or revoke vote | Guardians only | Vote to unfreeze (before frozen) or unfreeze (when frozen) |
| `setEmergencyFreezeThreshold(n)` | Configure voting threshold | Vault owner only | Set number of votes needed to freeze/unfreeze |
| `getEmergencyFreezeStatus()` | Check vault status | Anyone | Returns frozen state, vote counts, threshold |
| `getFreezeVoters()` | See who voted to freeze | Anyone | Returns array of guardian addresses |
| `getUnfreezeVoters()` | See who voted to unfreeze | Anyone | Returns array of guardian addresses |

### Function Calls

```typescript
// Check vault status
const { isFrozen, freezeVotes, unfreezeVotes, threshold } 
    = await vault.getEmergencyFreezeStatus();

// Guardian votes to freeze
await vault.voteEmergencyFreeze();

// Guardian votes to unfreeze
await vault.voteEmergencyUnfreeze();

// See who voted (for monitoring)
const freezeVoters = await vault.getFreezeVoters();
const unfreezeVoters = await vault.getUnfreezeVoters();
```

---

## Voting Rules

### Threshold Calculation

```
Threshold = (Guardian Count ÷ 2) + 1

3 guardians → Need 2 votes to freeze/unfreeze
5 guardians → Need 3 votes to freeze/unfreeze
7 guardians → Need 4 votes to freeze/unfreeze
```

### Vote Limitations

- ✓ Can vote once per guardian (freeze OR unfreeze)
- ✓ Can revoke freeze vote before vault frozen
- ✓ Can switch from freeze to unfreeze before frozen
- ✗ Cannot vote twice in same direction
- ✗ Cannot vote if not a guardian (must hold GuardianSBT)
- ✗ Cannot freeze if already frozen
- ✗ Cannot unfreeze if not frozen (unless revoking freeze vote)

---

## State Machine

### Vault Operating States

```
NORMAL (Operational)
    ↓
    Guardian votes to freeze (repeatly)
    ↓
FREEZING (Voting in progress)
    ├─ Withdrawals BLOCKED ❌
    ├─ Queuing BLOCKED ❌
    └─ Guardians can revoke votes
    ↓
FROZEN (Threshold reached)
    ├─ Withdrawals BLOCKED ❌
    ├─ Queuing BLOCKED ❌
    └─ Vote to unfreeze
    ↓
UNFREEZING (Unfreeze voting)
    ├─ Withdrawals still BLOCKED ❌
    └─ When unfreeze threshold reached:
    ↓
NORMAL (Operational again)
    ├─ All votes cleared
    ├─ Withdrawals ALLOWED ✓
    └─ Queuing ALLOWED ✓
```

### Key Points

- **Once frozen**: Withdrawals blocked immediately
- **Unfreeze voting**: Counts separate from freeze votes
- **Vote clearing**: All votes cleared when unfreeze succeeds
- **No partial freeze**: Freeze only happens at exact threshold

---

## API Endpoint

### GET `/api/vaults/{address}/emergency-freeze`

**Response**:
```json
{
  "success": true,
  "vault": "0x1234...",
  "timestamp": 1705334400,
  "emergencyFreeze": {
    "isFrozen": true,
    "freezeVotes": 2,
    "unfreezeVotes": 1,
    "threshold": 2,
    "freezeVoters": ["0x123...", "0x456..."],
    "unfreezeVoters": ["0x789..."],
    "lastFreezeTimestamp": 1705334200,
    "percentToFreeze": 100,
    "percentToUnfreeze": 50
  }
}
```

---

## Events

### 4 Core Events

| Event | When Fired | Use |
|-------|-----------|-----|
| `VaultEmergencyFrozen(voteCount, threshold)` | Threshold reached, vault frozen | Alert system, send notifications |
| `VaultEmergencyUnfrozen(voteCount, threshold)` | Unfreeze threshold reached, vault operational | Alert system, clear warnings |
| `EmergencyFreezeVoteCast(guardian, isFreezeVote, currentVotes)` | Guardian votes or revokes freeze vote | Update UI vote counter |
| `EmergencyUnfreezeVoteCast(guardian, isUnfreezeVote, currentVotes)` | Guardian votes to unfreeze | Update UI unfreeze counter |

### Listening to Events

```typescript
// Listen for vault frozen alert
contract.on('VaultEmergencyFrozen', (voteCount, threshold) => {
  console.log('🔒 VAULT IS FROZEN');
  sendAlert('Vault has been emergency frozen');
});

// Listen for unfreeze
contract.on('VaultEmergencyUnfrozen', (voteCount, threshold) => {
  console.log('🔓 VAULT IS UNFROZEN');
  sendAlert('Vault is now operational');
});

// Live vote tracking
contract.on('EmergencyFreezeVoteCast', (guardian, isFreezeVote, votes) => {
  console.log(`Guardian ${guardian} voted. Total: ${votes}`);
  updateVoteCounter(votes);
});
```

---

## Frontend Components

### 1. Emergency Freeze Banner
**File**: `components/emergency-freeze/emergency-freeze-banner.tsx`

**Shows**:
- Current freeze status (🔒 FROZEN / ⚠️ IN PROGRESS / ✅ NORMAL)
- Vote counts and progress bar
- List of voting guardians
- Color-coded states (red/yellow/green)

**Props**:
```typescript
<EmergencyFreezeBanner
  vaultAddress="0x..."
  autoRefresh={5000}  // Optional: refresh every 5 seconds
/>
```

**Auto-refresh**: Updates freeze status every 5 seconds

### 2. Guardian Freeze Voting
**File**: `components/emergency-freeze/emergency-freeze-voting.tsx`

**Shows**:
- Vote buttons (freeze/unfreeze)
- Current vote count
- Revoke option
- Transaction status

**Props**:
```typescript
<GuardianEmergencyFreezeVoting
  vaultAddress="0x..."
  guardianSBTAddress="0x..."
  userAddress="0x..."
  isFrozen={false}
  freezeVotes={0}
  unfreezeVotes={0}
  threshold={2}
  onVoteSuccess={() => refreshStatus()}
/>
```

**Features**:
- Only shows if user is guardian
- Shows vote buttons when operational
- Shows unfreeze button when frozen
- Displays current guardian's vote status
- Auto-disables if threshold reached

---

## Integration Examples

### React Component

```typescript
import { EmergencyFreezeBanner } from '@/components/emergency-freeze/emergency-freeze-banner';
import { GuardianEmergencyFreezeVoting } from '@/components/emergency-freeze/emergency-freeze-voting';

export function VaultDashboard() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchFreezeStatus();
  }, []);

  return (
    <>
      {/* Show freeze status prominently */}
      <EmergencyFreezeBanner 
        vaultAddress={vault} 
        autoRefresh={5000}
      />

      {/* Guardian voting controls */}
      <GuardianEmergencyFreezeVoting
        vaultAddress={vault}
        userAddress={currentUser}
        isFrozen={status?.isFrozen}
        freezeVotes={status?.freezeVotes}
        threshold={status?.threshold}
      />
    </>
  );
}
```

### Hardhat Test

```typescript
describe('Emergency Freeze', () => {
  it('should freeze vault when majority votes', async () => {
    // 3 guardians, threshold = 2
    await vault.connect(guardian1).voteEmergencyFreeze();
    await vault.connect(guardian2).voteEmergencyFreeze();
    
    // Check frozen status
    const { isFrozen } = await vault.getEmergencyFreezeStatus();
    expect(isFrozen).to.be.true;
    
    // Verify withdrawals blocked
    await expect(
      vault.withdraw(1000, signatures)
    ).to.be.revertedWith('Vault is emergency frozen');
  });
});
```

---

## Common Actions

### Action 1: Freeze Vault (3 Guardians)

```
Time 0:00   Guardian A votes to freeze (1/2 votes)
Time 0:15   Guardian B votes to freeze (2/2 votes) ← VAULT FROZEN ✓
Time 0:30   Guardian C tries to vote → Error (already frozen)
```

### Action 2: Unfreeze Vault

```
Time 1:00   Vault is frozen
Time 1:15   Guardian A votes to unfreeze (1/2 votes)
Time 1:30   Guardian B votes to unfreeze (2/2 votes) ← VAULT UNFROZEN ✓
Time 1:45   Withdrawals now work again
```

### Action 3: Guardian Changes Mind (Before Freeze)

```
Time 0:00   Guardian A votes to freeze (1/2)
Time 0:15   Guardian A regrets, calls voteEmergencyUnfreeze() → Vote revoked (0/2)
Time 0:30   Guardian B votes to freeze (1/2)
Time 1:00   No more votes → Vault remains operational
```

---

## Troubleshooting

### "Already voted to freeze"
- You already voted to freeze
- **Solution**: Call `voteEmergencyUnfreeze()` to revoke your vote

### "Vault already emergency frozen"
- Vault is already frozen
- **Solution**: Call `voteEmergencyUnfreeze()` to unfreeze

### "Vault is emergency frozen"
- Trying to withdraw while frozen
- **Solution**: Wait for guardians to unfreeze vault

### "Not a guardian"
- You don't hold GuardianSBT token
- **Solution**: Ask vault owner to add you as guardian

### "Did not vote to freeze"
- Vault not frozen, you never voted to freeze
- **Solution**: Call `voteEmergencyFreeze()` if you want to vote

---

## State Variables Reference

| Variable | Type | Purpose |
|----------|------|---------|
| `vaultEmergencyFrozen` | `bool` | Current freeze status |
| `emergencyFreezeThreshold` | `uint256` | Votes needed to freeze/unfreeze |
| `freezeVoteCount` | `uint256` | Current freeze votes |
| `unfreezeVoteCount` | `uint256` | Current unfreeze votes |
| `emergencyFreezeVotes` | `mapping` | Track who voted to freeze |
| `emergencyUnfreezeVotes` | `mapping` | Track who voted to unfreeze |
| `freezeVoters` | `address[]` | Array of freeze voters |
| `unfreezeVoters` | `address[]` | Array of unfreeze voters |
| `lastFreezeTimestamp` | `uint256` | When vault was last frozen |

---

## Checklist: Setting Up Emergency Freeze

- [ ] Smart contract deployed with emergency freeze functions
- [ ] Threshold set to appropriate value: `(guardians / 2) + 1`
- [ ] Guardian SBT contract linked and verified
- [ ] Backend API endpoint tested
- [ ] Emergency Freeze Banner component integrated
- [ ] Guardian Voting component integrated
- [ ] Event listeners configured
- [ ] Frontend notifications set up for freeze events
- [ ] Guardians trained on voting process
- [ ] Documentation shared with team

---

## Performance Notes

| Operation | Gas Cost | Time |
|-----------|----------|------|
| `voteEmergencyFreeze()` | ~45,000 | 12-15s (Base Sepolia) |
| `voteEmergencyUnfreeze()` | ~50,000 | 12-15s (Base Sepolia) |
| `setEmergencyFreezeThreshold()` | ~35,000 | 12-15s (Base Sepolia) |
| `getEmergencyFreezeStatus()` | 0 (view) | Instant |
| `getFreezeVoters()` | 0 (view) | Instant |
| `getUnfreezeVoters()` | 0 (view) | Instant |

---

## Security Reminders

✓ **Non-guardians cannot vote** (verified by GuardianSBT)  
✓ **Single guardian cannot freeze vault** (requires majority)  
✓ **Votes are immutable** (only revokable before freeze)  
✓ **Withdrawals completely blocked** (checked in 2 places)  
✓ **Threshold enforced at contract level** (not frontend)  
✓ **All votes cleared on unfreeze** (prevents pollution)  

---

**Quick Ref Version**: 1.0  
**Last Updated**: January 17, 2026  
**Status**: Ready for Production
