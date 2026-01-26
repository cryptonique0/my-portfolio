# Transaction Status & Wallet UX Implementation Guide

## Overview

This document explains how to integrate the new transaction status feedback and enhanced wallet experience features into the BitArt Market marketplace components.

## Components Created

### 1. TransactionStatus.tsx
Provides three main components for transaction feedback:

#### TransactionToast
Displays real-time transaction status with BaseScan links.

```typescript
import { TransactionToast } from '../components/TransactionStatus';

// In a marketplace component:
<TransactionToast
  txHash={transactionHash}
  type="list"
  description="Listing NFT for sale"
  onStatusChange={(status) => {
    if (status === 'success') {
      // Refresh NFT data
    }
  }}
  autoClose={true}
  autoCloseDelay={10000}
/>
```

**Features:**
- Real-time status polling (pending → success/failed/cancelled)
- Automatic BaseScan link generation
- Status icons: ⏳ pending, ✅ success, ❌ failed, ⊘ cancelled
- Error details display for failed transactions
- Auto-close on completion
- Dark mode support

#### TransactionLoadingState
Shows loading indicator during transaction submission.

```typescript
import { TransactionLoadingState } from '../components/TransactionStatus';

// Show while submitting transaction
<TransactionLoadingState
  isLoading={isSubmitting}
  txHash={pendingTxHash}
  message="Listing your NFT..."
/>
```

#### TransactionHistory
Displays recent transactions with quick access to BaseScan.

```typescript
import { TransactionHistory } from '../components/TransactionStatus';

<TransactionHistory
  limit={5}
  className="mt-4"
/>
```

### 2. WalletErrors.tsx
Components for graceful error handling:

#### WalletDisconnectBanner
Shown when wallet unexpectedly disconnects.

```typescript
import { WalletDisconnectBanner } from '../components/WalletErrors';

const { disconnectError, clearDisconnectError } = useWallet();

<WalletDisconnectBanner
  error={disconnectError}
  onDismiss={clearDisconnectError}
  onReconnect={() => connect('base')}
  isLoading={loading}
/>
```

#### WalletErrorBanner
General wallet error display.

```typescript
<WalletErrorBanner
  error={error}
  onDismiss={() => setError(null)}
  type="error" // or "warning"
/>
```

### 3. Enhanced useWallet Hook
New features:

**Session Persistence:**
- Automatically saves wallet session to localStorage
- Restores session on app load (valid for 7 days)
- Handles expired sessions gracefully

**Disconnect Handling:**
- Listens for wallet disconnects
- Provides `disconnectError` and `clearDisconnectError` methods
- Allows graceful reconnection flow

```typescript
import { useWallet } from '../hooks/useWallet';

const {
  user,
  loading,
  error,
  disconnectError,      // NEW: Disconnect error state
  clearDisconnectError, // NEW: Method to clear error
  chain,
  connect,
  disconnect,
  isConnected,
  autoSwitchToBase
} = useWallet();
```

## Integration Examples

### Example 1: NFT Listing with Status Feedback

```typescript
import { useWallet } from '../hooks/useWallet';
import { TransactionToast, TransactionLoadingState } from '../components/TransactionStatus';
import { transactionService } from '../services/transaction';

export const ListNFTFlow: React.FC<{ nftId: string }> = ({ nftId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { user } = useWallet();

  const handleList = async (price: string) => {
    setIsSubmitting(true);
    try {
      // 1. Create transaction record
      const tx = transactionService.createTransaction(
        '', // Will be updated when tx is mined
        'list',
        `Listing NFT #${nftId}`,
        user.address!,
        undefined,
        price
      );

      // 2. Submit transaction to smart contract
      const response = await submitListingTx(nftId, price);
      const hash = response.hash;
      setTxHash(hash);

      // 3. Update transaction with hash
      transactionService.updateTransactionStatus(hash, 'pending');

      // 4. Start polling
      transactionService.pollTransactionStatus(hash);

    } catch (error) {
      console.error('Listing failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <TransactionLoadingState
        isLoading={isSubmitting}
        message="Submitting listing..."
      />
      
      {txHash && (
        <TransactionToast
          txHash={txHash}
          type="list"
          description={`Listing NFT #${nftId}`}
          onStatusChange={(status) => {
            if (status === 'success') {
              // Refresh NFT list
              window.location.reload();
            }
          }}
        />
      )}

      <button
        onClick={() => handleList('1.5')}
        disabled={isSubmitting}
      >
        List NFT
      </button>
    </div>
  );
};
```

### Example 2: Marketplace Page with Disconnect Handling

```typescript
import { useWallet } from '../hooks/useWallet';
import { WalletDisconnectBanner } from '../components/WalletErrors';
import { TransactionHistory } from '../components/TransactionStatus';

export const MarketplacePage: React.FC = () => {
  const {
    isConnected,
    disconnectError,
    clearDisconnectError,
    connect,
    loading
  } = useWallet();

  if (!isConnected) {
    return <div>Please connect wallet to continue</div>;
  }

  return (
    <div>
      <WalletDisconnectBanner
        error={disconnectError}
        onDismiss={clearDisconnectError}
        onReconnect={() => connect('base')}
        isLoading={loading}
      />

      <TransactionHistory limit={5} />

      {/* Rest of marketplace UI */}
    </div>
  );
};
```

## Service Integration

### Transaction Service API

```typescript
import { transactionService } from '../services/transaction';

// Create transaction record
const tx = transactionService.createTransaction(
  txHash,
  'buy', // or 'list', 'auction', 'bid', 'approve', 'mint'
  'Buying NFT from marketplace',
  userAddress,
  sellerAddress,
  '2.5' // ETH value
);

// Update status as it progresses
transactionService.updateTransactionStatus(txHash, 'pending');

// Poll for completion (automatic receipt checking)
transactionService.pollTransactionStatus(
  txHash,
  60, // max polls
  1000 // poll interval (ms)
);

// Listen for status changes
const unsubscribe = transactionService.onTransactionStatusChange(
  txHash,
  (tx) => {
    console.log(`Transaction ${tx.hash} is now ${tx.status}`);
  }
);

// Get transaction history
const recentTxs = transactionService.getRecentTransactions(10);
const pendingTxs = transactionService.getPendingTransactions();

// Generate BaseScan link
const explorerUrl = transactionService.getBaseScanLink(txHash);

// Get status message for UI
const { title, message } = transactionService.getTransactionMessage(tx);

// Cleanup
unsubscribe();
```

## Session Persistence Details

**Storage Key:** `bitart_wallet_session`

**Stored Data:**
```typescript
{
  address: string;        // User's wallet address
  chain: 'stacks' | 'base'; // Current chain
  timestamp: number;      // When session was created
}
```

**Session Lifetime:** 7 days
- Sessions older than 7 days are automatically cleared
- Session is updated on every wallet action
- User can explicitly clear session via `disconnect()`

## Error Handling Flow

```
User Action
    ↓
Wallet Operation
    ↓
    ├─ Success → Show success toast
    │            Save session
    │            Poll transaction
    │
    ├─ User Rejects → Show error banner
    │                 Clear session
    │                 Offer reconnect
    │
    └─ Wallet Disconnects → Show disconnect banner
                           Clear session
                           Offer reconnect button
```

## Best Practices

1. **Always Create Transaction Records**
   - Create before submitting to blockchain
   - Update hash once received from provider
   - This ensures accurate status tracking

2. **Use RPC Polling for Confirmation**
   - Don't rely solely on provider events
   - `pollTransactionStatus()` checks receipt periodically
   - Detects mining completion within 60 polls (~60 seconds)

3. **Show Loading States During Submission**
   - Use `TransactionLoadingState` while awaiting tx receipt
   - Prevents double-submission
   - Shows user tx is in progress

4. **Provide BaseScan Links**
   - Generated automatically by transaction service
   - Users can verify on-chain status independently
   - Builds trust in NFT marketplace

5. **Handle Disconnect Gracefully**
   - Don't assume user will see error
   - Provide prominent reconnect button
   - Clear user state immediately
   - Save session for quick recovery

6. **Test with Real Transactions**
   - Use Base Mainnet testnet (if needed) or Mainnet
   - Verify polling detects confirmations
   - Test error scenarios (reject tx, network issues)

## Component Composition Example

```typescript
// Complete marketplace action with all features
<div className="space-y-4">
  {/* Disconnect error at top */}
  <WalletDisconnectBanner {...} />

  {/* Loading state during submission */}
  <TransactionLoadingState isLoading={isSubmitting} />

  {/* Status toast after submission */}
  {txHash && <TransactionToast txHash={txHash} />}

  {/* Recent transactions in sidebar */}
  <TransactionHistory limit={5} />

  {/* Main action button */}
  <button onClick={handleBuy} disabled={isSubmitting}>
    Buy NFT
  </button>
</div>
```

## Performance Considerations

- **Polling Interval:** Default 1000ms (1 second)
  - Increase for slower networks (2000ms)
  - Decrease for faster feedback (500ms)

- **Max Polls:** Default 60 (1 minute)
  - Sufficient for most Base transactions
  - Reduce to 30 for faster timeout

- **Session Storage:** Minimal overhead
  - Only stores address + chain + timestamp
  - ~100 bytes per session
  - No impact on performance

## Testing Checklist

- [ ] Transaction toast appears with correct status
- [ ] BaseScan link opens correct explorer page
- [ ] Status updates from pending → success/failed
- [ ] Session persists on page refresh
- [ ] Session clears on disconnect
- [ ] Disconnect banner appears when wallet disconnects
- [ ] Reconnect button works after disconnect
- [ ] Error messages are clear and actionable
- [ ] Dark mode styling works
- [ ] Mobile responsive layout maintained

## Troubleshooting

**Transaction stays pending:**
- Increase polling interval if network is slow
- Check RPC URL is correct in environment
- Verify transaction was actually submitted

**Session not persisting:**
- Check localStorage is enabled
- Verify SESSION_STORAGE_KEY not cleared by other code
- Check browser storage isn't in private/incognito mode

**Disconnect error not showing:**
- Verify wallet listener is registered
- Check useWallet hook is called in component
- Ensure wallet provider supports disconnect events

**BaseScan links broken:**
- Verify CHAIN_ID is 8453 (Base Mainnet)
- Check network is actually Base
- Verify transaction hash is correct

## Future Enhancements

1. **Toast Position Customization**
   - Currently displayed inline
   - Could add fixed position notifications

2. **Transaction Notifications**
   - Browser notifications for tx completion
   - Email alerts (requires backend)

3. **Transaction Analytics**
   - Track common transaction types
   - User transaction history export
   - Gas spending analytics

4. **Multi-wallet Support**
   - Coinbase Wallet optimizations
   - Safe wallets
   - WalletConnect universal support

5. **Advanced Status Tracking**
   - ERC-4337 bundler status
   - Mempool monitoring
   - Gas price recommendations
