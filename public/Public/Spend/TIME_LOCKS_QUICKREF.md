# Time-Locked Withdrawals Quick Reference

## What is it?

Large withdrawals are automatically queued and locked for a review period (default 2 days). During this time:
- **Guardians** can freeze suspicious withdrawals
- **Owner** can cancel at any time
- **Anyone** can execute once delay expires (unless frozen)

## Configuration

### Set Global Threshold (Owner Only)
```solidity
// Large withdrawals = amounts >= threshold
vault.setLargeTxThreshold(1000 ether);  // 1000 ETH for example
```

### Set Per-Token Threshold
```solidity
vault.setTokenThreshold(usdcAddress, 1_000_000 * 10**6);  // 1M USDC
vault.setTokenThreshold(address(0), 500 ether);  // 500 ETH (override global)
```

### Update Time-Lock Delay
```solidity
vault.setTimeLockDelay(172800);  // 2 days in seconds
vault.setTimeLockDelay(604800);  // 1 week
```

## Workflow

### 1. Queue a Large Withdrawal

**Solidity:**
```solidity
bytes[] memory signatures = [sig1, sig2, sig3];  // EIP-712 signatures
vault.queueWithdrawal(
    usdcAddress,           // token
    1_000_000 * 10**6,     // amount (1M USDC)
    recipientAddress,      // where to send
    "Quarterly payout",    // reason (audit trail)
    "dividend",           // category
    signatures            // guardian approvals
);
```

**Result:** Withdrawal queued with readyAt = now + 2 days

### 2. Guardian Review Window

**Guardian can freeze for investigation:**
```solidity
vault.freezeQueuedWithdrawal(0);  // Freeze withdrawal #0
```

**Multiple guardians can freeze independently:**
- Guardian A freezes → isFrozen = true
- Guardian B freezes → isFrozen = true (still frozen)
- Guardian A unfreezes → isFrozen = true (B still froze it)
- Guardian B unfreezes → isFrozen = false (all unfroze)

**Owner/Signers can cancel anytime:**
```solidity
vault.cancelQueuedWithdrawal(0);  // Cancel withdrawal #0
```

### 3. Execution (After Delay Expires)

**Anyone can execute:**
```solidity
// After 2 days AND withdrawal not frozen AND not cancelled
vault.executeQueuedWithdrawal(0);
```

## Frontend Examples

### Display Queue with React

```typescript
import { WithdrawalQueue } from '@/components/withdrawal-queue/withdrawal-queue';

export function VaultPage() {
  return (
    <WithdrawalQueue 
      vaultAddress="0x..."
      maxItems={10}
      onRefresh={() => console.log('Refreshed')}
    />
  );
}
```

### Show Countdown Timer

```typescript
import { ExecutionCountdown } from '@/components/withdrawal-queue/execution-countdown';

<ExecutionCountdown
  readyAt={1705420800}  // Unix timestamp
  status="pending"
  onReady={() => alert('Ready to execute!')}
/>
```

### Guardian Actions

```typescript
import { GuardianActions } from '@/components/withdrawal-queue/guardian-actions';

<GuardianActions
  withdrawalId={0}
  vaultAddress="0x..."
  guardianSBTAddress="0x..."
  userAddress={userAddress}
  withdrawalStatus="pending"
  isFrozen={false}
  freezeCount={0}
  onActionSuccess={() => refreshWithdrawals()}
/>
```

## Backend API Endpoints

### Get All Queued Withdrawals

```bash
curl "http://localhost:3000/api/withdrawals/queued?vault=0x...&maxResults=50"
```

**Response:**
```json
{
  "success": true,
  "vault": "0x...",
  "totalWithdrawals": 5,
  "displayedWithdrawals": 5,
  "timestamp": 1705334400,
  "withdrawals": [
    {
      "withdrawalId": 4,
      "token": "0x...",
      "amount": "1000000000000000000",
      "recipient": "0x...",
      "queuedAt": 1705334400,
      "readyAt": 1705507200,
      "timeRemaining": 172800,
      "status": "pending",
      "isFrozen": false,
      "freezeCount": 0,
      "reason": "Quarterly dividend",
      "category": "dividend",
      "signers": ["0x...", "0x..."]
    }
  ]
}
```

### Get Withdrawal Details

```bash
curl "http://localhost:3000/api/withdrawals/4?vault=0x..."
```

**Response:**
```json
{
  "success": true,
  "withdrawal": {
    "withdrawalId": 4,
    "vault": "0x...",
    "token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "amount": "1000000000000000000",
    "recipient": "0x1234567890123456789012345678901234567890",
    "queuedAt": 1705334400,
    "readyAt": 1705507200,
    "readyAtDate": "2024-01-18T08:00:00.000Z",
    "timeRemaining": 172800,
    "timeRemainingFormatted": "2d 0h",
    "status": "pending",
    "isFrozen": false,
    "freezeCount": 0,
    "reason": "Quarterly dividend",
    "category": "dividend",
    "signers": ["0x...", "0x..."]
  }
}
```

## Statuses Explained

| Status | Meaning | Executable? |
|--------|---------|------------|
| `pending` | Queued, waiting for delay | ❌ No |
| `ready` | Delay expired, can execute | ✅ Yes |
| `frozen` | Guardian(s) froze it for review | ❌ No |
| `executed` | Already executed | ❌ N/A |
| `cancelled` | Cancelled by owner/signers | ❌ N/A |

## Common Scenarios

### Scenario 1: Freeze Suspicious Withdrawal

```typescript
// Guardian sees unusual withdrawal details
const withdrawal = await fetch(`/api/withdrawals/2?vault=${vaultAddr}`);

// Freeze it for manual review
await walletClient.writeContract({
  address: vaultAddress,
  abi: SpendVaultABI,
  functionName: 'freezeQueuedWithdrawal',
  args: [BigInt(2)]
});

// Other guardians can see it's frozen and investigate
```

### Scenario 2: Multi-Guardian Consensus on Unfreeze

```typescript
// Guardian A froze withdrawal
vault.freezeQueuedWithdrawal(3);

// Guardian B also concerned, also freezes
vault.freezeQueuedWithdrawal(3);

// After investigation, Guardian A unfreezes
vault.unfreezeQueuedWithdrawal(3);  // Still frozen (B didn't unfreeze)

// Guardian B unfreezes after checking
vault.unfreezeQueuedWithdrawal(3);  // Now truly unfrozen! Can execute.
```

### Scenario 3: Owner Cancels Pre-Maturely

```typescript
// Owner notices withdrawal details were wrong
await ownerClient.writeContract({
  address: vaultAddress,
  abi: SpendVaultABI,
  functionName: 'cancelQueuedWithdrawal',
  args: [BigInt(1)]
});

// Guardians' freeze votes don't matter - it's cancelled
```

### Scenario 4: Auto-Execute Small Withdrawal

```typescript
// Small withdrawal (amount < threshold)
vault.queueWithdrawal(
  tokenAddr,
  parseEther('10'),  // 10 tokens (below 1000 threshold)
  recipient,
  "Small payment",
  "operational",
  signatures  // Still need signatures
);
// Events: WithdrawalExecuted immediately (no time-lock)
```

## Testing

Run the test suite:
```bash
npx hardhat test contracts/SpendVault.timeLocks.test.ts
```

**Key test cases:**
- ✅ Large withdrawals get queued
- ✅ Small withdrawals execute immediately
- ✅ Can't execute before delay expires
- ✅ Guardians can freeze/unfreeze
- ✅ Multiple guardians freeze independently
- ✅ Owner can cancel anytime
- ✅ Configuration updates work

## Troubleshooting

### "Time-lock not expired"
**Cause:** Trying to execute before `readyAt` timestamp
**Fix:** Wait for delay or check current block timestamp

### "Withdrawal frozen"
**Cause:** One or more guardians froze the withdrawal
**Fix:** Check with guardians, have them unfreeze if investigation complete

### "Insufficient signatures"
**Cause:** Not enough guardian signatures provided when queuing
**Fix:** Collect signatures from more guardians (check quorum requirement)

### "Not a guardian"
**Cause:** Caller doesn't have GuardianSBT token
**Fix:** Only active guardians can freeze/unfreeze

## Events to Monitor

Monitor these events for off-chain systems:

```solidity
// New withdrawal queued
event WithdrawalQueued(
    uint256 indexed withdrawalId,
    address indexed token,
    uint256 amount,
    address indexed recipient,
    uint256 readyAt
);

// Guardian froze it
event WithdrawalFrozen(uint256 indexed withdrawalId, address indexed frozenBy);

// Guardian unfroze it
event WithdrawalUnfrozen(uint256 indexed withdrawalId, address indexed unfrozenBy);

// Successfully executed
event WithdrawalExecuted(uint256 indexed withdrawalId);

// Cancelled
event WithdrawalCancelled(uint256 indexed withdrawalId, address indexed cancelledBy);
```

## Gas Costs

| Operation | Gas | Notes |
|-----------|-----|-------|
| Queue withdrawal | 150k-300k | Includes sig verification |
| Execute withdrawal | 80k-150k | Depends on token type |
| Cancel withdrawal | 50k-100k | Quick operation |
| Freeze | 80k-120k | Records guardian freeze |
| Unfreeze | 70k-110k | Removes guardian freeze |
| Set delay | 30k | Configuration |
| Set threshold | 30k-50k | Configuration |

## Related Documentation

- **Full Spec:** [TIME_LOCKS_SPEC.md](TIME_LOCKS_SPEC.md)
- **Test Suite:** [contracts/SpendVault.timeLocks.test.ts](contracts/SpendVault.timeLocks.test.ts)
- **Smart Contract:** [contracts/SpendVault.sol](contracts/SpendVault.sol)
- **Frontend Components:** [components/withdrawal-queue/](components/withdrawal-queue/)
- **Backend API:** [app/api/withdrawals/](app/api/withdrawals/)
