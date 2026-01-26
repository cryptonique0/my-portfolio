# Marketplace Components - Transaction UX Integration Checklist

This document provides step-by-step instructions for integrating transaction status feedback and wallet UX features into each marketplace component.

## MarketplacePage.tsx Integration

### Current State
- Displays NFT grid
- Basic buy/list buttons
- No transaction feedback

### Changes Required

1. **Add Imports**
   ```typescript
   import { TransactionToast, TransactionLoadingState, TransactionHistory } from '../components/TransactionStatus';
   import { WalletDisconnectBanner } from '../components/WalletErrors';
   import { transactionService } from '../services/transaction';
   ```

2. **Add State Management**
   ```typescript
   const [pendingTxHash, setPendingTxHash] = useState<string | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { disconnectError, clearDisconnectError, loading } = useWallet();
   ```

3. **Add Disconnect Banner at Top**
   ```typescript
   return (
     <>
       <WalletDisconnectBanner
         error={disconnectError}
         onDismiss={clearDisconnectError}
         onReconnect={() => connect('base')}
         isLoading={loading}
       />
       {/* Existing page content */}
     </>
   );
   ```

4. **Add Transaction History Sidebar**
   ```typescript
   <aside className="sticky top-20">
     <TransactionHistory limit={5} />
   </aside>
   ```

### Status: PENDING
Location: `frontend/src/pages/MarketplacePage.tsx`

---

## NFTCard.tsx Integration

### Current State
- Shows NFT image, title, price
- Basic buy button
- No transaction feedback

### Changes Required

1. **Convert to Component with State**
   ```typescript
   export const NFTCard: React.FC<NFTCardProps> = (props) => {
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [txHash, setTxHash] = useState<string | null>(null);
     const { user } = useWallet();
   ```

2. **Add Buy Handler with Transaction Tracking**
   ```typescript
   const handleBuy = async () => {
     setIsSubmitting(true);
     try {
       // Create transaction record
       const tx = transactionService.createTransaction(
         '',
         'buy',
         `Buying ${props.title}`,
         user.address!,
         props.seller,
         props.price
       );

       // Submit to blockchain
       const response = await buyNFT(props.id, props.price);
       
       // Update with hash
       transactionService.updateTransactionStatus(
         response.hash,
         'pending'
       );
       setTxHash(response.hash);

       // Start polling
       transactionService.pollTransactionStatus(response.hash);
     } catch (error) {
       console.error('Purchase failed:', error);
     } finally {
       setIsSubmitting(false);
     }
   };
   ```

3. **Add Loading and Toast States**
   ```typescript
   return (
     <div className="bg-white rounded-lg overflow-hidden">
       {txHash && (
         <TransactionToast
           txHash={txHash}
           type="buy"
           description={`Buying ${props.title}`}
           onStatusChange={(status) => {
             if (status === 'success') {
               // Refresh NFT data
               props.onPurchaseComplete?.();
             }
           }}
         />
       )}

       <TransactionLoadingState
         isLoading={isSubmitting}
         message="Processing purchase..."
       />

       {/* Existing card UI */}
       <button
         onClick={handleBuy}
         disabled={isSubmitting || !user.isConnected}
       >
         {isSubmitting ? 'Purchasing...' : 'Buy Now'}
       </button>
     </div>
   );
   ```

### Status: PENDING
Location: `frontend/src/components/NFTCard.tsx`

---

## CreatePage.tsx Integration

### Current State
- Form for creating NFT
- Upload to IPFS
- Mint button
- No transaction feedback

### Changes Required

1. **Add Transaction Tracking to Mint Handler**
   ```typescript
   const handleMint = async () => {
     setIsSubmitting(true);
     try {
       // Show loading state
       const txHash = '';
       setPendingTxHash(txHash);

       // Submit mint transaction
       const response = await mintNFT(formData);
       const hash = response.hash;
       
       // Update pending hash
       setPendingTxHash(hash);
       transactionService.createTransaction(
         hash,
         'mint',
         `Minting "${formData.title}"`,
         user.address!,
         undefined,
         '0'
       );

       // Wait for confirmation
       await transactionService.pollTransactionStatus(hash);
       
       // Refresh user's NFTs
       await refetchUserNFTs();
       
     } finally {
       setIsSubmitting(false);
     }
   };
   ```

2. **Add UI Components**
   ```typescript
   return (
     <div className="max-w-2xl mx-auto">
       <TransactionLoadingState
         isLoading={isSubmitting}
         message="Minting your NFT..."
         txHash={pendingTxHash}
       />

       {pendingTxHash && (
         <TransactionToast
           txHash={pendingTxHash}
           type="mint"
           description={`Minting "${formData.title}"`}
           onStatusChange={(status) => {
             if (status === 'success') {
               showSuccessNotification('NFT minted successfully!');
             }
           }}
         />
       )}

       {/* Existing form */}
       <button
         onClick={handleMint}
         disabled={isSubmitting}
       >
         {isSubmitting ? 'Minting...' : 'Mint NFT'}
       </button>
     </div>
   );
   ```

### Status: PENDING
Location: `frontend/src/pages/CreatePage.tsx`

---

## NFTDetailPage.tsx Integration

### Current State
- Shows full NFT details
- Auction/listing actions
- No transaction feedback

### Changes Required

1. **Add Multiple Transaction Handlers**
   ```typescript
   const handleListForSale = async (price: string) => {
     const tx = transactionService.createTransaction(
       '',
       'list',
       `Listing for ${price} ETH`,
       user.address!,
       undefined,
       price
     );
     // ... submit and track
   };

   const handlePlaceBid = async (bidAmount: string) => {
     const tx = transactionService.createTransaction(
       '',
       'bid',
       `Bidding ${bidAmount} ETH`,
       user.address!,
       undefined,
       bidAmount
     );
     // ... submit and track
   };

   const handleCreateAuction = async (startPrice: string, duration: number) => {
     const tx = transactionService.createTransaction(
       '',
       'auction',
       `Creating auction - ${startPrice} ETH`,
       user.address!,
       undefined,
       startPrice
     );
     // ... submit and track
   };
   ```

2. **Add Action Buttons with Loading**
   ```typescript
   <div className="space-y-4">
     <button
       onClick={() => handleListForSale(price)}
       disabled={isSubmitting}
     >
       List for Sale
     </button>
     
     {pendingTxHash && (
       <TransactionToast
         txHash={pendingTxHash}
         type="list"
         onStatusChange={(status) => {
           if (status === 'success') {
             refetchNFTDetails();
           }
         }}
       />
     )}
   </div>
   ```

### Status: PENDING
Location: `frontend/src/pages/NFTDetailPage.tsx`

---

## ProfilePage.tsx Integration

### Current State
- Shows user profile
- User's NFTs list
- No transaction history

### Changes Required

1. **Add Transaction History Display**
   ```typescript
   import { TransactionHistory } from '../components/TransactionStatus';

   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     {/* User info and stats */}
     
     {/* User's NFTs */}
     
     {/* Transaction History */}
     <div>
       <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
       <TransactionHistory limit={10} />
     </div>
   </div>
   ```

2. **Filter Transactions by User**
   ```typescript
   const userTransactions = transactionService
     .getRecentTransactions(10)
     .filter(tx => tx.from === user.address);
   ```

### Status: PENDING
Location: `frontend/src/pages/ProfilePage.tsx`

---

## Integration Priority

### Phase 1 (Critical)
- [ ] MarketplacePage - Add disconnect banner and transaction history
- [ ] NFTCard - Add buy transaction tracking

### Phase 2 (Important)
- [ ] CreatePage - Add mint transaction tracking
- [ ] NFTDetailPage - Add list/bid/auction transaction tracking

### Phase 3 (Nice to Have)
- [ ] ProfilePage - Add transaction history display
- [ ] Notification animations
- [ ] Advanced filtering

---

## Testing for Each Component

### MarketplacePage
- [ ] Disconnect banner appears when wallet disconnects
- [ ] Transaction history shows recent transactions
- [ ] Clicking BaseScan link navigates correctly
- [ ] Reconnect button works

### NFTCard
- [ ] Buy button disabled until wallet connected
- [ ] Loading state shows during submission
- [ ] Transaction toast appears after submission
- [ ] Status updates from pending to success/failed
- [ ] Success callback triggered on completion

### CreatePage
- [ ] Form validates before mint
- [ ] Loading state shows IPFS upload progress
- [ ] Loading state shows blockchain confirmation
- [ ] Mint transaction shows on profile

### NFTDetailPage
- [ ] Multiple action buttons work independently
- [ ] Each action creates separate transaction record
- [ ] Toasts stack properly for multiple txs
- [ ] Details refresh after successful transaction

### ProfilePage
- [ ] Transaction history loads on page load
- [ ] Filters show only user's transactions
- [ ] BaseScan links work for all transactions
- [ ] List updates as new transactions occur

---

## Code Snippets for Copy-Paste

### Basic Transaction Tracking Template
```typescript
import { transactionService } from '../services/transaction';

const handleAction = async (actionName: string, params: any) => {
  setIsSubmitting(true);
  try {
    // Create transaction record
    const tx = transactionService.createTransaction(
      '', // hash will be updated
      'buy', // action type
      `${actionName}`, // description
      user.address!,
      params.target,
      params.value
    );

    // Submit to blockchain
    const response = await submitToBlockchain(params);
    const hash = response.hash;

    // Update transaction with hash
    transactionService.updateTransactionStatus(hash, 'pending');

    // Start polling for confirmation
    transactionService.pollTransactionStatus(hash);

    // Show toast
    setTxHash(hash);

  } catch (error) {
    // Handle error
    console.error('Action failed:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

### Transaction Status Listener Template
```typescript
useEffect(() => {
  if (!pendingTxHash) return;

  const unsubscribe = transactionService.onTransactionStatusChange(
    pendingTxHash,
    (updatedTx) => {
      if (updatedTx.status === 'success') {
        // Action successful
        onSuccess?.(updatedTx);
      } else if (updatedTx.status === 'failed') {
        // Action failed
        onError?.(updatedTx.error);
      }
    }
  );

  return unsubscribe;
}, [pendingTxHash]);
```

---

## Migration Notes

- Existing components continue to work as-is
- New components are backwards compatible
- Gradual migration is safe
- No breaking changes to APIs
- Session persistence is automatic

---

## Support Resources

- See `TRANSACTION_UX_GUIDE.md` for detailed API docs
- See `BASE_FEATURES.md` for Base-specific integrations
- See `frontend/src/services/transaction.ts` for implementation details
