# Blockchain Features Quick Reference

## File Locations

### Backend Services
- **Blockchain Service:** `backend/src/services/blockchain.service.ts`
- **Transaction Tracker:** `backend/src/services/transaction-tracker.service.ts`
- **NFT Minting:** `backend/src/services/minting.service.ts`
- **Auction Service:** `backend/src/services/auction.service.ts` (extended)

### Backend Routes
- **Minting Endpoints:** `backend/src/routes/minting.ts`
- **Transaction Endpoints:** `backend/src/routes/transactions.ts` (extended)
- **Auction Endpoints:** `backend/src/routes/auctions.ts`

### Frontend Components
- **Blockchain Hooks:** `frontend/src/hooks/useBlockchain.ts`
- **Mint Component:** `frontend/src/components/MintNFT.tsx`
- **Auction Component:** `frontend/src/components/AuctionSystem.tsx`
- **Tracker Component:** `frontend/src/components/TransactionTracker.tsx`

### Routes
- `/mint` - NFT Minting page
- `/auctions` - Auction Marketplace
- `/transactions` - Transaction Tracker

## Quick Start

### 1. Connect Wallet

```typescript
import { useBlockchain } from './hooks/useBlockchain';

function App() {
  const { connectWallet, isConnected, address } = useBlockchain();

  return (
    <button onClick={connectWallet} disabled={isConnected}>
      {isConnected ? `Connected: ${address}` : 'Connect Wallet'}
    </button>
  );
}
```

### 2. Mint NFT

```typescript
import { useMintNFT } from './hooks/useBlockchain';

function MintForm() {
  const { mint, minting, progress } = useMintNFT();

  const handleMint = async (metadata) => {
    const { hash } = await mint(CONTRACT_ADDRESS, metadata, signer);
    console.log('Minted:', hash);
  };

  return (
    <div>
      <button onClick={handleMint} disabled={minting}>Mint</button>
      {progress && <p>{progress.message}</p>}
    </div>
  );
}
```

### 3. Place Bid

```typescript
import { useBid } from './hooks/useBlockchain';

function AuctionBid() {
  const { placeBid, bidding } = useBid();

  const handleBid = async (auctionId, amount) => {
    const hash = await placeBid(auctionId, amount, signer);
    console.log('Bid placed:', hash);
  };

  return <button onClick={handleBid} disabled={bidding}>Place Bid</button>;
}
```

### 4. Track Transaction

```typescript
import { useTransactionStatus } from './hooks/useBlockchain';

function TxStatus() {
  const { status, details } = useTransactionStatus(txHash);

  return (
    <div>
      <p>Status: {status}</p>
      {details && <p>Gas: {details.gasUsed}</p>}
    </div>
  );
}
```

## API Endpoints

### Minting
```
POST   /api/minting/prepare      → Prepare metadata
POST   /api/minting/confirm      → Confirm mint
GET    /api/minting/stats        → Get statistics
GET    /api/minting/user/:id     → User history
POST   /api/minting/estimate     → Estimate gas
```

### Transactions
```
POST   /api/transactions/track                    → Track TX
GET    /api/transactions/:hash/status             → TX status
GET    /api/transactions/user/:id/blockchain      → User TXs
GET    /api/transactions/user/:id/summary         → TX summary
```

### Auctions
```
GET    /api/auctions/active              → Active auctions
GET    /api/auctions/:id                 → Details
GET    /api/auctions/:id/bids            → Bid history
POST   /api/auctions/:id/bid             → Place bid
```

## Environment Variables

```env
NEXT_PUBLIC_NETWORK=base
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532

REACT_APP_NFT_CONTRACT=0x...
REACT_APP_MARKETPLACE_CONTRACT=0x...
REACT_APP_AUCTION_CONTRACT=0x...

IPFS_API_KEY=your_key
IPFS_GATEWAY=https://gateway.pinata.cloud
```

## Database Tables

### transactions
```sql
- id, hash (unique), user_id, type, status
- amount, gas_used, block_number, confirmations
- error, related_id, created_at, updated_at
```

### nfts (extended)
```sql
- metadata_ipfs, mint_tx_hash, mint_status
- token_id, royalty_percentage
```

## Service Methods

### BlockchainService
```typescript
- initialize()
- estimateGas(to, value, data)
- verifySignature(message, sig)
- getTransactionStatus(hash)
- getNFTMetadata(uri)
- uploadMetadataToIPFS(metadata)
- isValidAddress(addr)
- getBalance(addr)
```

### TransactionTrackerService
```typescript
- createTransaction(data)
- getTransaction(hash)
- getUserTransactions(userId, limit, offset)
- pollTransactionStatus(hash)
- watchTransaction(hash)
- failTransaction(hash, error)
- getTransactionSummary(userId)
```

### NFTMintingService
```typescript
- prepareMint(metadata, contract)
- createNFTRecord(userId, contract, name, desc, ipfs)
- updateNFTStatus(id, status, txHash, tokenId)
- estimateMintGas(contract)
- getMintingStats()
- getUserMints(userId)
- batchMint(userId, contract, metadataList)
```

## Component Props

### MintNFT
- Props: None (uses hooks internally)
- Features: Image upload, metadata form, progress tracking

### AuctionSystem
- Props: None (uses hooks internally)
- Tabs: Browse, Detail, Create

### TransactionTracker
- Props: None (uses hooks internally)
- Features: History, filters, details modal

## Hooks

### useBlockchain()
```typescript
→ { provider, signer, address, chainId, balance, loading, connectWallet, sendTransaction, estimateGas, isConnected }
```

### useMintNFT()
```typescript
→ { mint, minting, progress }
```

### useBuySell()
```typescript
→ { buy, sell, loading, txHash }
```

### useBid()
```typescript
→ { placeBid, bidding, txHash }
```

### useTransactionStatus(hash)
```typescript
→ { status, details, loading }
```

## Common Tasks

### Get User's Transactions
```
GET /api/transactions/user/{userId}/blockchain?limit=50&offset=0
```

### Check TX Status
```
GET /api/transactions/{hash}/status
```

### Estimate Mint Gas
```
POST /api/minting/estimate
Body: { contractAddress }
```

### Get Auction Bids
```
GET /api/auctions/{auctionId}/bids
```

### Get Minting Stats
```
GET /api/minting/stats
```

## Error Handling

```typescript
try {
  const result = await mint(contract, metadata, signer);
} catch (error: any) {
  if (error.message.includes('insufficient')) {
    // Insufficient funds
  } else if (error.code === 'NETWORK_ERROR') {
    // Network issue
  } else {
    // Other error
  }
}
```

## Performance Tips

1. **Gas Estimation:** Call before transaction to avoid failures
2. **Transaction Polling:** Auto-polls every 5 seconds
3. **Pagination:** Use limit/offset for large datasets
4. **Cleanup:** Old pending TXs auto-cleaned after 24h
5. **Caching:** Gas estimates cached between calls

## Debugging

### Enable Logging
```typescript
// In services
logger.info('Message')
logger.error('Error', error)
```

### Check TX on BaseScan
```
https://basescan.org/tx/{hash}
```

### View Contract Events
```
https://basescan.org/address/{contractAddress}#events
```

## Integration Checklist

- [ ] Contract addresses set in .env
- [ ] RPC endpoint configured
- [ ] IPFS API key configured
- [ ] MetaMask available in test environment
- [ ] Database migrations run
- [ ] Services exported in index.ts
- [ ] Routes registered in main app
- [ ] Components added to pages
- [ ] Routes added to router

## Support Resources

- **Docs:** [BLOCKCHAIN_FEATURES.md](./BLOCKCHAIN_FEATURES.md)
- **API:** `/api-docs` (Swagger UI)
- **Spec:** `/api-docs.json` (OpenAPI)
- **Examples:** See BLOCKCHAIN_FEATURES.md integration examples

## Version Info

- Node.js: v18+
- React: 18+
- ethers.js: v6
- TypeScript: 5+
- Tailwind: 3.3+

---

**All blockchain features are production-ready! 🚀**
