# Time-Locked Withdrawals Specification

## Overview

Time-locked withdrawals provide enhanced security for large treasury transactions by introducing a configurable delay period during which guardians can review and potentially freeze suspicious withdrawals. This feature enforces the principle that significant transactions require not just approval but also temporal review windows.

## Architecture

### Core Concepts

1. **Threshold-Based Triggering**: Withdrawals exceeding a configured threshold are automatically queued and locked
2. **Guardian Review Window**: During the lock period, guardians can freeze withdrawals for investigation
3. **Flexible Configuration**: Each token can have its own threshold, with a global default fallback
4. **Multi-Signature Validation**: Large withdrawals require multiple guardian signatures to queue

### State Variables

```solidity
// Time-lock delay (default: 2 days / 172800 seconds)
uint256 public timeLockDelay;

// Global large transaction threshold (default: 1000 ether)
uint256 public largeTxThreshold;

// Per-token transaction thresholds (token address => threshold in wei)
mapping(address => uint256) public tokenTxThresholds;

// Queued withdrawals (withdrawal ID => withdrawal details)
mapping(uint256 => QueuedWithdrawal) public queuedWithdrawals;

// Freeze tracking (withdrawal ID => guardian => has frozen)
mapping(uint256 => mapping(address => bool)) public frozenBy;

// Auto-incrementing withdrawal ID counter
uint256 public withdrawalQueueId;
```

### Data Structures

```solidity
struct QueuedWithdrawal {
    address token;              // Token to withdraw (address(0) for ETH)
    uint256 amount;             // Withdrawal amount in wei
    address recipient;          // Destination address
    uint256 queuedAt;           // Block timestamp when queued
    uint256 readyAt;            // Block timestamp when executable
    string reason;              // Withdrawal reason (for audit trail)
    string category;            // Withdrawal category (e.g., "operating", "investment")
    bool isFrozen;              // Whether any guardian froze it
    bool isExecuted;            // Whether already executed
    bool isCancelled;           // Whether cancelled by owner/signers
    address[] signers;          // Guardians who approved queuing
}
```

## Functions

### Core Operations

#### `queueWithdrawal(address token, uint256 amount, address recipient, string reason, string category, bytes[] calldata signatures)`

Queues a large withdrawal for time-locked execution or immediately executes small withdrawals.

**Parameters:**
- `token`: Token address (address(0) for native ETH)
- `amount`: Amount to withdraw in wei
- `recipient`: Destination address
- `reason`: Human-readable reason for withdrawal
- `category`: Categorization (e.g., "operating", "investment", "emergency")
- `signatures`: Array of EIP-712 signatures from guardians approving the withdrawal

**Behavior:**
- If `amount >= threshold`: Queue withdrawal with time-lock
- If `amount < threshold`: Execute immediately
- Signature verification against registered guardians
- Stores signer addresses for audit trail

**Events Emitted:**
- `WithdrawalQueued(withdrawalId, token, amount, recipient, readyAt)`
- `WithdrawalExecuted(withdrawalId)` (if auto-executed)

**Reverts:**
- `InvalidRecipient` if recipient is address(0)
- `InvalidAmount` if amount is 0
- `InsufficientSignatures` if signatures don't meet quorum
- `TransferFailed` if immediate execution fails

**Gas:** ~150,000 - 300,000 (varies with signature verification)

#### `executeQueuedWithdrawal(uint256 withdrawalId)`

Executes a queued withdrawal after the time-lock delay expires and withdrawal is not frozen/cancelled.

**Parameters:**
- `withdrawalId`: ID of the queued withdrawal to execute

**Behavior:**
- Verifies `block.timestamp >= readyAt`
- Checks withdrawal is not frozen or cancelled
- Transfers tokens to recipient
- Marks as executed
- Clears freeze tracking

**Events Emitted:**
- `WithdrawalExecuted(withdrawalId)`

**Reverts:**
- `WithdrawalNotFound` if ID is invalid
- `TimeLockNotExpired` if delay not elapsed
- `WithdrawalFrozen` if guardians froze it
- `WithdrawalCancelled` if owner cancelled it
- `WithdrawalAlreadyExecuted` if already executed
- `TransferFailed` if token transfer fails

**Gas:** ~80,000 - 150,000

#### `cancelQueuedWithdrawal(uint256 withdrawalId)`

Cancels a queued withdrawal (only by owner or signers who approved it).

**Parameters:**
- `withdrawalId`: ID of the queued withdrawal to cancel

**Behavior:**
- Verifies caller is owner or a signer on withdrawal
- Marks withdrawal as cancelled
- Prevents further execution or freezing

**Events Emitted:**
- `WithdrawalCancelled(withdrawalId, cancelledBy)`

**Reverts:**
- `WithdrawalNotFound` if ID is invalid
- `UnauthorizedCancellation` if not owner/signer
- `WithdrawalAlreadyExecuted` if already executed

**Gas:** ~50,000 - 100,000

#### `freezeQueuedWithdrawal(uint256 withdrawalId)`

Freezes a queued withdrawal for guardian review (any guardian can freeze).

**Parameters:**
- `withdrawalId`: ID of the queued withdrawal to freeze

**Behavior:**
- Requires caller to be a guardian (has GuardianSBT)
- Records guardian's freeze
- Sets `isFrozen` flag if first freeze
- Prevents execution until all guardians who froze it unfreeze

**Events Emitted:**
- `WithdrawalFrozen(withdrawalId, frozenBy)`

**Reverts:**
- `WithdrawalNotFound` if ID is invalid
- `NotGuardian` if caller is not a guardian
- `WithdrawalAlreadyExecuted` if already executed
- `WithdrawalAlreadyCancelled` if already cancelled
- `AlreadyFrozen` if guardian already froze it

**Gas:** ~80,000 - 120,000

#### `unfreezeQueuedWithdrawal(uint256 withdrawalId)`

Unfreezes a queued withdrawal (only guardian who froze it).

**Parameters:**
- `withdrawalId`: ID of the queued withdrawal to unfreeze

**Behavior:**
- Requires caller to have frozen the withdrawal
- Removes caller's freeze flag
- If freeze count reaches 0, sets `isFrozen = false`
- Prevents execution if any other guardian still has it frozen

**Events Emitted:**
- `WithdrawalUnfrozen(withdrawalId, unfrozenBy)`

**Reverts:**
- `WithdrawalNotFound` if ID is invalid
- `NotFrozenByYou` if guardian didn't freeze it
- `WithdrawalNotFrozen` if withdrawal is not frozen

**Gas:** ~70,000 - 110,000

### Configuration Functions

#### `setTimeLockDelay(uint256 newDelaySeconds)`

Updates the global time-lock delay (owner only).

**Parameters:**
- `newDelaySeconds`: New delay in seconds (e.g., 172800 for 2 days)

**Behavior:**
- Only owner can call
- Affects future queued withdrawals
- Doesn't affect already-queued withdrawals

**Events Emitted:**
- `TimeLockDelayUpdated(newDelaySeconds)`

**Reverts:**
- `Unauthorized` if not owner
- `InvalidDelay` if delay is 0 or unreasonably large

**Gas:** ~30,000

#### `setLargeTxThreshold(uint256 newThresholdWei)`

Updates the global large transaction threshold in wei.

**Parameters:**
- `newThresholdWei`: New threshold (e.g., 1000 ether for ETH)

**Behavior:**
- Only owner can call
- Used as fallback if no token-specific threshold set
- Affects future withdrawals

**Events Emitted:**
- `LargeTxThresholdUpdated(address(0), newThresholdWei)`

**Reverts:**
- `Unauthorized` if not owner
- `InvalidThreshold` if 0

**Gas:** ~30,000

#### `setTokenThreshold(address token, uint256 thresholdWei)`

Sets a per-token threshold override.

**Parameters:**
- `token`: Token address (address(0) for ETH)
- `thresholdWei`: Threshold amount in wei

**Behavior:**
- Only owner can call
- Overrides global threshold for this token
- Set to 0 to remove override (fall back to global)

**Events Emitted:**
- `LargeTxThresholdUpdated(token, thresholdWei)`

**Reverts:**
- `Unauthorized` if not owner

**Gas:** ~30,000 - 50,000

### Query Functions

#### `getQueuedWithdrawal(uint256 withdrawalId) → QueuedWithdrawal memory`

Returns complete details of a queued withdrawal plus freeze count.

**Parameters:**
- `withdrawalId`: ID to query

**Returns:**
- `QueuedWithdrawal`: All withdrawal details including signers
- `freezeCount`: Number of guardians who froze it

**Gas:** ~20,000 (read-only)

## Events

### WithdrawalQueued
```solidity
event WithdrawalQueued(
    uint256 indexed withdrawalId,
    address indexed token,
    uint256 amount,
    address indexed recipient,
    uint256 readyAt
);
```
Emitted when withdrawal is queued and time-lock activated.

### WithdrawalExecuted
```solidity
event WithdrawalExecuted(uint256 indexed withdrawalId);
```
Emitted when queued withdrawal is successfully executed.

### WithdrawalCancelled
```solidity
event WithdrawalCancelled(uint256 indexed withdrawalId, address indexed cancelledBy);
```
Emitted when withdrawal is cancelled before execution.

### WithdrawalFrozen
```solidity
event WithdrawalFrozen(uint256 indexed withdrawalId, address indexed frozenBy);
```
Emitted when guardian freezes withdrawal for review.

### WithdrawalUnfrozen
```solidity
event WithdrawalUnfrozen(uint256 indexed withdrawalId, address indexed unfrozenBy);
```
Emitted when guardian unfreezes their freeze.

### TimeLockDelayUpdated
```solidity
event TimeLockDelayUpdated(uint256 newDelay);
```
Emitted when time-lock delay is updated.

### LargeTxThresholdUpdated
```solidity
event LargeTxThresholdUpdated(address indexed token, uint256 newThreshold);
```
Emitted when transaction threshold changes.

## Security Considerations

### Multi-Guardian Freezing

- Any guardian can freeze a withdrawal for review
- **Critical**: A withdrawal remains frozen until **ALL** guardians who froze it unfreeze it
- This prevents a single guardian's malicious unfreeze from overriding others
- Use case: If Guardian A suspects fraud and freezes, Guardian B cannot unfreeze until A approves

### Time-Lock Duration

- Default 2 days (172800 seconds) for off-chain monitoring and response
- Configurable per deployment for different security requirements
- Suggested ranges:
  - High security: 7 days (604800 seconds)
  - Standard: 2-3 days (172800-259200 seconds)
  - Emergency operations: 6-12 hours (21600-43200 seconds)

### Signature Verification

- Large withdrawals require EIP-712 signatures from guardians
- Signatures verified against GuardianSBT registry
- Stores signers for audit trail (enables attribution)
- Prevents unsigned withdrawals from bypassing time-lock

### Threshold Tuning

- Set thresholds based on treasury risk tolerance
- ETH/stablecoins: 1000+ ether typical
- High-value tokens: Adjust for decimals
- Emergency reserve access: Consider very high thresholds or immediate withdrawal category

### Cancellation Authorization

- Only owner (multisig) or signers (guardians who approved) can cancel
- Prevents unauthorized third parties from cancelling valid withdrawals
- Maintains integrity of approval process

## Integration Examples

### Frontend - Queue a Withdrawal

```typescript
import { useContractWrite } from 'wagmi';
import { SpendVaultABI } from '@/lib/abis/SpendVault';

function QueueLargeWithdrawal() {
  const { writeAsync } = useContractWrite({
    address: vaultAddress,
    abi: SpendVaultABI,
    functionName: 'queueWithdrawal'
  });

  const queueWithdrawal = async (signatures: `0x${string}`[]) => {
    await writeAsync({
      args: [
        tokenAddress,
        parseEther('5000'),           // 5000 token units
        recipientAddress,
        'Quarterly dividend payout',
        'dividend',
        signatures
      ]
    });
  };

  return <button onClick={() => queueWithdrawal(sigs)}>Queue Withdrawal</button>;
}
```

### Frontend - Execute After Delay

```typescript
function ExecuteWithdrawal({ withdrawalId }) {
  const { writeAsync } = useContractWrite({
    address: vaultAddress,
    abi: SpendVaultABI,
    functionName: 'executeQueuedWithdrawal'
  });

  return (
    <button onClick={() => writeAsync({ args: [BigInt(withdrawalId)] })}>
      Execute Withdrawal
    </button>
  );
}
```

### Frontend - Guardian Freeze/Unfreeze

```typescript
function GuardianControls({ withdrawalId, isFrozen }) {
  const { writeAsync: freeze } = useContractWrite({
    address: vaultAddress,
    abi: SpendVaultABI,
    functionName: 'freezeQueuedWithdrawal'
  });

  const { writeAsync: unfreeze } = useContractWrite({
    address: vaultAddress,
    abi: SpendVaultABI,
    functionName: 'unfreezeQueuedWithdrawal'
  });

  if (isFrozen) {
    return (
      <button onClick={() => unfreeze({ args: [BigInt(withdrawalId)] })}>
        Unfreeze for Execution
      </button>
    );
  }

  return (
    <button onClick={() => freeze({ args: [BigInt(withdrawalId)] })}>
      Freeze for Review
    </button>
  );
}
```

### Backend - Monitor Queue

```typescript
// Fetch all queued withdrawals
const response = await fetch(
  `/api/withdrawals/queued?vault=${vaultAddress}`
);
const data = await response.json();

// data.withdrawals contains array of QueuedWithdrawalInfo
data.withdrawals.forEach(w => {
  console.log(`#${w.withdrawalId}: ${w.amount} tokens, ready in ${w.timeRemaining}s`);
});
```

### Backend - Get Withdrawal Details

```typescript
const response = await fetch(
  `/api/withdrawals/${withdrawalId}?vault=${vaultAddress}`
);
const { withdrawal } = await response.json();

// Check if ready and not frozen
if (withdrawal.status === 'ready' && !withdrawal.isFrozen) {
  console.log('Ready to execute!');
}
```

## Testing

See `contracts/SpendVault.timeLocks.test.ts` for comprehensive test suite including:
- Queuing behavior with thresholds
- Time-lock expiry and execution
- Guardian freezing mechanics
- Multi-guardian freeze scenarios
- Configuration updates
- Edge cases and error conditions

## Deployment

### Configuration Steps

1. **Deploy SpendVault with time-lock support**
   ```bash
   npx hardhat run scripts/deployFactory.ts
   ```

2. **Set initial thresholds** (via admin)
   ```solidity
   vault.setLargeTxThreshold(1000 ether);        // Global 1000 ETH
   vault.setTokenThreshold(usdcAddress, 1e6 * 1000);  // 1000 USDC
   ```

3. **Configure delay** (via admin)
   ```solidity
   vault.setTimeLockDelay(172800);  // 2 days in seconds
   ```

4. **Monitor queue** via backend API
   ```bash
   curl "http://localhost:3000/api/withdrawals/queued?vault=0x..."
   ```

## Changelog

### Version 1.0.0
- Initial time-lock implementation
- Multi-guardian freeze with AND logic
- Per-token threshold configuration
- Complete test coverage (22 tests)
- Frontend UI components with real-time countdown
- Backend API routes for monitoring

## Future Enhancements

1. **Escalation Levels**: Different thresholds trigger different delay periods
2. **Governance Voting**: Guardians vote on frozen withdrawals instead of timeout
3. **Budget Windows**: Monthly/quarterly spending limits
4. **Recovery Wallet**: Withdraw to separate recovery address after delay
5. **Partial Execution**: Execute subset of queued withdrawals
6. **Conditional Withdrawals**: Trigger based on external data (Chainlink oracles, etc.)
