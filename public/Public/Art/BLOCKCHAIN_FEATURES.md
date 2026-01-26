# Enhanced Blockchain Features Documentation

## Overview

BitArt Market now includes comprehensive blockchain integration with support for:
- **NFT Minting** - Create and mint new NFTs directly from the platform
- **Auction System** - Create and participate in NFT auctions with real-time bidding
- **Buy/Sell Flow** - Complete marketplace transactions with wallet integration
- **Transaction Tracking** - Monitor all blockchain transactions with real-time status updates
- **Smart Contract Event Listeners** - Real-time notifications for contract events

## Architecture

### Backend Services

#### 1. BlockchainService (`backend/src/services/blockchain.service.ts`)

Core service for blockchain interactions using ethers.js v6.

**Key Methods:**

```typescript
// Initialize provider and signer
async initialize()

// Gas estimation
async estimateGas(to: string, value: string, data?: string): Promise<string>

// Signature verification
async verifySignature(message: string, signature: string): Promise<string>

// Transaction status
async getTransactionStatus(hash: string): Promise<'pending' | 'confirmed' | 'failed'>

// NFT Metadata
async getNFTMetadata(metadataURI: string): Promise<any>
async uploadMetadataToIPFS(metadata: any): Promise<string>

// Utility methods
isValidAddress(address: string): boolean
parseEther(value: string): bigint
formatEther(value: bigint): string
getNetworkInfo(): Promise<NetworkInfo>
checkTokenAllowance(token: string, owner: string, spender: string): Promise<string>
getBalance(address: string): Promise<string>
```

#### 2. TransactionTrackerService (`backend/src/services/transaction-tracker.service.ts`)

Monitors and tracks blockchain transactions with polling and promise-based watching.

**Key Methods:**

```typescript
// Create transaction record
async createTransaction(data: {
  hash: string;
  userId: string;
  type: 'mint' | 'bid' | 'buy' | 'sell' | 'list';
  relatedId?: string;
  amount?: string;
  status: TransactionStatus;
}): Promise<Transaction>

// Fetch transaction
async getTransaction(hash: string): Promise<Transaction | null>

// User transactions (paginated)
async getUserTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]>

// Poll transaction status on-chain
async pollTransactionStatus(hash: string): Promise<Transaction>

// Promise-based transaction watching (5s intervals, 5min timeout)
async watchTransaction(hash: string): Promise<void>

// Mark transaction as failed
async failTransaction(hash: string, error: string): Promise<void>

// User transaction summary
async getTransactionSummary(userId: string): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  failed: number;
}>

// Cleanup old transactions (>24h pending)
async cleanupOldTransactions(): Promise<void>
```

#### 3. NFTMintingService (`backend/src/services/minting.service.ts`)

Handles NFT creation and minting lifecycle.

**Key Methods:**

```typescript
// Prepare metadata and upload to IPFS
async prepareMint(
  metadata: NFTMetadata,
  contractAddress: string
): Promise<{ metadataIPFS: string }>

// Create NFT record in database
async createNFTRecord(
  userId: string,
  contractAddress: string,
  name: string,
  description: string,
  metadataIPFS: string
): Promise<NFT>

// Update NFT status after minting
async updateNFTStatus(
  nftId: string,
  status: 'minting' | 'minted' | 'failed',
  txHash?: string,
  tokenId?: string,
  error?: string
): Promise<NFT>

// Estimate gas cost for minting
async estimateMintGas(contractAddress: string): Promise<{
  gasEstimate: string;
  gasCost: string;
}>

// Minting statistics
async getMintingStats(): Promise<{
  total: number;
  minted: number;
  failed: number;
  inProgress: number;
}>

// User's minting history
async getUserMints(userId: string): Promise<NFT[]>

// Batch mint multiple NFTs
async batchMint(
  userId: string,
  contractAddress: string,
  metadataList: NFTMetadata[]
): Promise<NFT[]>
```

#### 4. Extended AuctionService (`backend/src/services/auction.service.ts`)

Includes blockchain-aware auction management.

**Key Methods (new):**

```typescript
// Settle auction with blockchain transaction
async settleAuctionWithBlockchain(
  auctionId: string,
  settlementTxHash: string
): Promise<Auction>

// Auction statistics
async getAuctionStats(): Promise<{
  active: number;
  total: number;
  totalBids: number;
  settlementRate: number;
}>
```

### Frontend Integration

#### 1. Blockchain Hooks (`frontend/src/hooks/useBlockchain.ts`)

**Available Hooks:**

```typescript
// Core blockchain interactions
useBlockchain() → {
  provider: BrowserProvider | null
  signer: Signer | null
  address: string | null
  chainId: number | null
  balance: string
  loading: boolean
  connectWallet: () => Promise<{address, signer, provider}>
  sendTransaction: (to, value, data?) => Promise<hash>
  estimateGas: (to, value, data?) => Promise<estimate>
  isConnected: boolean
}

// NFT Minting
useMintNFT() → {
  mint: (contractAddress, metadata, signer) => Promise<{hash, metadataIPFS}>
  minting: boolean
  progress: {
    step: 'preparing' | 'uploading' | 'minting' | 'confirming' | 'complete'
    message: string
    hash?: string
  } | null
}

// Buy/Sell Operations
useBuySell() → {
  buy: (listingId, price, signer) => Promise<txHash>
  sell: (nftAddress, tokenId, price, signer) => Promise<txHash>
  loading: boolean
  txHash: string | null
}

// Auction Bidding
useBid() → {
  placeBid: (auctionId, bidAmount, signer) => Promise<txHash>
  bidding: boolean
  txHash: string | null
}

// Transaction Status
useTransactionStatus(hash: string | null) → {
  status: 'pending' | 'confirmed' | 'failed'
  details: TransactionDetails | null
  loading: boolean
}
```

### Frontend Components

#### 1. MintNFT Component (`frontend/src/components/MintNFT.tsx`)

Complete NFT minting UI with:
- Image upload with preview
- Metadata form (name, description, attributes)
- Royalty percentage setting
- Gas estimation display
- Multi-step progress tracking
- Success confirmation with IPFS link
- Block explorer link

**Usage:**

```tsx
import { MintNFT } from './components/MintNFT';

function App() {
  return <MintNFT />;
}
```

#### 2. AuctionSystem Component (`frontend/src/components/AuctionSystem.tsx`)

Full-featured auction marketplace with:
- Browse active auctions
- Auction detail view with bid history
- Real-time bid updates
- Countdown timer
- Bid placement form
- Create auction form (scaffolded)
- Transaction tracking

**Usage:**

```tsx
import { AuctionSystem } from './components/AuctionSystem';

function App() {
  return <AuctionSystem />;
}
```

#### 3. TransactionTracker Component (`frontend/src/components/TransactionTracker.tsx`)

Transaction monitoring dashboard with:
- User transaction history (paginated)
- Status badges (pending, confirmed, failed)
- Transaction type indicators
- Gas usage details
- Block number and confirmations
- Real-time polling (10s refresh)
- Modal for detailed transaction info
- BaseScan explorer links
- Summary statistics

**Usage:**

```tsx
import { TransactionTracker } from './components/TransactionTracker';

function App() {
  return <TransactionTracker />;
}
```

## API Endpoints

### Minting Routes

```
POST   /api/minting/prepare        - Prepare metadata for minting
POST   /api/minting/confirm        - Confirm NFT after on-chain tx
GET    /api/minting/stats          - Get minting statistics
GET    /api/minting/user/:userId   - Get user's minting history
POST   /api/minting/estimate       - Estimate gas cost
```

### Transaction Routes

```
POST   /api/transactions/track                    - Track new blockchain tx
GET    /api/transactions/:hash/status             - Get tx status
GET    /api/transactions/user/:userId/blockchain  - Get user's blockchain txs
GET    /api/transactions/user/:userId/summary     - Get tx summary
```

### Auction Routes

```
GET    /api/auctions/active              - Get active auctions
GET    /api/auctions/:id                 - Get auction details
GET    /api/auctions/:id/bids            - Get auction bid history
POST   /api/auctions/:id/bid             - Place a bid
```

## Frontend Routes

```
/mint              - NFT Minting page
/auctions          - Auction Marketplace
/transactions      - Transaction Tracker
```

## Database Schema

### transactions table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  hash TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- mint, bid, buy, sell, list
  status TEXT NOT NULL, -- pending, confirmed, failed
  amount NUMERIC,
  gas_used TEXT,
  block_number BIGINT,
  confirmations INTEGER,
  error TEXT,
  related_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### nfts table (extended)

```sql
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS (
  metadata_ipfs TEXT,
  mint_tx_hash TEXT,
  mint_status TEXT DEFAULT 'draft', -- draft, minting, minted, failed
  token_id TEXT,
  royalty_percentage NUMERIC
);
```

## Configuration

### Environment Variables

```env
# Blockchain Network
NEXT_PUBLIC_NETWORK=base
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532

# Contract Addresses
REACT_APP_NFT_CONTRACT=0x...
REACT_APP_MARKETPLACE_CONTRACT=0x...
REACT_APP_AUCTION_CONTRACT=0x...

# IPFS Configuration
IPFS_API_KEY=your_api_key
IPFS_GATEWAY=https://gateway.pinata.cloud
```

## Integration Examples

### Example 1: Complete Minting Flow

```typescript
// Component
import { useBlockchain, useMintNFT } from './hooks/useBlockchain';

function MintExample() {
  const { signer, isConnected } = useBlockchain();
  const { mint, progress } = useMintNFT();

  const handleMint = async () => {
    const metadata = {
      name: 'My NFT',
      description: 'A great NFT',
      imageUrl: 'ipfs://...',
    };

    try {
      const result = await mint(
        process.env.REACT_APP_NFT_CONTRACT!,
        metadata,
        signer!
      );
      console.log('Minted:', result.hash);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  if (!isConnected) return <p>Connect wallet</p>;

  return (
    <div>
      <button onClick={handleMint}>Mint NFT</button>
      {progress && <p>{progress.message}</p>}
    </div>
  );
}
```

### Example 2: Transaction Status Polling

```typescript
import { useTransactionStatus } from './hooks/useBlockchain';

function TxStatus({ txHash }: { txHash: string }) {
  const { status, details, loading } = useTransactionStatus(txHash);

  return (
    <div>
      <p>Status: {status}</p>
      {details && (
        <>
          <p>Gas: {details.gasUsed}</p>
          <p>Block: {details.blockNumber}</p>
        </>
      )}
    </div>
  );
}
```

### Example 3: Auction Bidding

```typescript
import { useBlockchain, useBid } from './hooks/useBlockchain';

function BidForm({ auctionId }: { auctionId: string }) {
  const { signer, isConnected } = useBlockchain();
  const { placeBid, bidding } = useBid();
  const [amount, setAmount] = useState('');

  const handleBid = async () => {
    try {
      const hash = await placeBid(auctionId, amount, signer!);
      console.log('Bid placed:', hash);
    } catch (error) {
      console.error('Bid failed:', error);
    }
  };

  return (
    <div>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Bid amount in ETH"
      />
      <button onClick={handleBid} disabled={bidding || !isConnected}>
        {bidding ? 'Placing...' : 'Place Bid'}
      </button>
    </div>
  );
}
```

## Features Roadmap

### Phase 1: Complete (✅)
- [x] NFT Minting UI and backend service
- [x] Auction System UI and backend service
- [x] Buy/Sell flow infrastructure
- [x] Transaction tracking and monitoring
- [x] Frontend blockchain hooks
- [x] Transaction history and status page

### Phase 2: In Progress
- [ ] WebSocket service for real-time contract events
- [ ] Contract event listener subscriptions
- [ ] Real-time notification system
- [ ] Advanced gas optimization

### Phase 3: Future
- [ ] Multi-chain support
- [ ] Cross-chain bridges
- [ ] Advanced portfolio analytics
- [ ] AI-powered recommendations

## Testing

### Manual Testing Checklist

- [ ] Connect MetaMask wallet
- [ ] View account balance and chain
- [ ] Mint NFT with metadata
- [ ] Verify IPFS upload
- [ ] Confirm transaction on BaseScan
- [ ] View minting progress
- [ ] Place auction bid
- [ ] View bid history
- [ ] Check transaction tracker
- [ ] Poll transaction status
- [ ] View transaction details

### Unit Tests

```typescript
// Example test
import { BlockchainService } from '../services/blockchain.service';

describe('BlockchainService', () => {
  it('should verify valid address', () => {
    const service = new BlockchainService();
    expect(service.isValidAddress('0x...')).toBe(true);
  });
});
```

## Performance Optimization

- Transaction polling with 5-second intervals
- 5-minute timeout for automatic cleanup
- Automatic old transaction cleanup (>24h)
- Paginated transaction history
- Cached gas estimates
- Background transaction watching

## Error Handling

All blockchain operations include comprehensive error handling:

```typescript
try {
  const result = await mint(...);
} catch (error: any) {
  if (error.message.includes('insufficient')) {
    // Handle insufficient funds
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network errors
  } else {
    // Generic error
  }
}
```

## Security Considerations

1. **Wallet Connection**: MetaMask signature verification via ethers.js
2. **Transaction Signing**: User-initiated signing only
3. **Gas Limits**: Estimated with buffer for safety
4. **Rate Limiting**: Applied to all API endpoints
5. **IPFS Integration**: Pinata gateway for reliable access
6. **Environment Variables**: Sensitive config via .env

## Support & Troubleshooting

### Common Issues

**Q: Transaction stuck pending**
A: Check network status, increase gas price, or wait for network confirmation

**Q: MetaMask not connecting**
A: Ensure MetaMask is installed, try refreshing page, check RPC endpoint

**Q: IPFS upload failing**
A: Verify image size (<10MB), check Pinata API key, check internet connection

**Q: Auction bid failed**
A: Ensure sufficient ETH for gas, check bid amount exceeds current bid, verify network

## API Documentation

Full interactive API documentation available at `/api-docs` (Swagger UI)

See [API_DOCS.md](./API_DOCS.md) for detailed endpoint documentation.
