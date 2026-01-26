# Smart Contract Event Listeners - Implementation Guide

## Overview
The Event Listener system provides real-time blockchain event monitoring via WebSocket connections. It listens to smart contract events (NFT minting, transfers, marketplace listings, auction bids) and broadcasts them to connected clients.

## Architecture

### Backend Components

#### 1. Event Listener Service (`event-listener.service.ts`)
**Purpose**: Core service for blockchain event monitoring using ethers.js WebSocket provider and Socket.IO

**Features**:
- WebSocket provider for Base network
- Contract event subscriptions (NFT, Marketplace, Auction)
- Event storage in Supabase database
- Real-time broadcasting via Socket.IO
- Event history retrieval

**Key Methods**:
```typescript
// Initialize service
initialize(io: SocketServer): Promise<boolean>

// Contract listeners
listenToNFTContract(contractAddress: string, abi: any[]): Promise<void>
listenToMarketplaceContract(contractAddress: string, abi: any[]): Promise<void>
listenToAuctionContract(contractAddress: string, abi: any[]): Promise<void>

// Event history
getEventHistory(filters: EventHistoryFilters): Promise<EventRecord[]>

// Cleanup
cleanup(): Promise<void>
```

**Monitored Events**:

**NFT Contract**:
- `Transfer` → Detects minting (from zero address) and transfers
- `Approval` → Detects NFT approvals

**Marketplace Contract**:
- `ItemListed` → New marketplace listing
- `ItemSold` → NFT sold on marketplace

**Auction Contract**:
- `AuctionCreated` → New auction created
- `BidPlaced` → New bid on auction
- `AuctionEnded` → Auction settled

#### 2. Event Routes (`events.ts`)
**Purpose**: REST API endpoints for event management

**Endpoints**:

```typescript
GET /api/events/history
// Query params: eventType, contractAddress, limit, offset
// Returns: Event history from database

POST /api/events/nft/:contractAddress
// Body: { abi: ContractABI[] }
// Starts listening to NFT contract events

POST /api/events/marketplace/:contractAddress
// Body: { abi: ContractABI[] }
// Starts listening to Marketplace contract events

POST /api/events/auction/:contractAddress
// Body: { abi: ContractABI[] }
// Starts listening to Auction contract events
```

### Frontend Components

#### 1. Event Listener Hooks (`useEventListener.ts`)

**Main Hook: `useEventListener(options)`**
```typescript
const {
  socket,           // Socket.IO instance
  isConnected,      // Connection status
  events,           // Real-time events array (max 100)
  loading,          // Loading state
  connect,          // Manual connect function
  disconnect,       // Disconnect function
  subscribe,        // Subscribe to event type
  unsubscribe,      // Unsubscribe from event type
  clearEvents,      // Clear stored events
} = useEventListener({
  autoConnect: true,
  onEvent: (event) => console.log(event),
  onError: (error) => console.error(error),
});
```

**Specialized Hooks**:

```typescript
// NFT events
const { nftEvents, isConnected } = useNFTEvents(contractAddress);

// Auction events
const { auctionEvents, isConnected } = useAuctionEvents(auctionId);

// Marketplace events
const { marketplaceEvents, isConnected } = useMarketplaceEvents();

// Event history from API
const { history, loading, error, fetchHistory } = useEventHistory();
```

#### 2. EventFeed Component (`EventFeed.tsx`)
**Purpose**: Full-featured UI for viewing real-time blockchain events

**Features**:
- Real-time event feed with WebSocket connection
- Event history from database
- Event filtering by type
- Color-coded event badges
- BaseScan transaction links
- Timestamp formatting
- Connection status indicator
- Manual refresh and clear functions

**Event Types**:
- NFT Minted 🎨
- NFT Transferred ↗️
- NFT Approved ✅
- Item Listed 🏷️
- Item Sold 💰
- Auction Created 🔨
- Bid Placed 💵
- Auction Ended 🏆

## Database Schema

### `blockchain_events` Table
```sql
CREATE TABLE blockchain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_event_type ON blockchain_events(event_type),
  INDEX idx_contract_address ON blockchain_events(contract_address),
  INDEX idx_created_at ON blockchain_events(created_at DESC)
);
```

## Setup Instructions

### 1. Environment Variables

**Backend** (`.env`):
```bash
# WebSocket RPC URL for Base network
BASE_WS_RPC_URL=wss://sepolia.base.org

# For mainnet
# BASE_WS_RPC_URL=wss://mainnet.base.org
```

**Frontend** (`.env`):
```bash
# API URL (for REST and WebSocket)
VITE_API_URL=http://localhost:3001
```

### 2. Install Dependencies

**Backend**:
```bash
cd backend
npm install socket.io
```

**Frontend**:
```bash
cd frontend
npm install socket.io-client
```

### 3. Database Migration

Run the following SQL to create the events table:

```sql
-- Create blockchain_events table
CREATE TABLE IF NOT EXISTS blockchain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_type ON blockchain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_contract_address ON blockchain_events(contract_address);
CREATE INDEX IF NOT EXISTS idx_created_at ON blockchain_events(created_at DESC);

-- Enable RLS
ALTER TABLE blockchain_events ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to blockchain events"
  ON blockchain_events FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert from service role
CREATE POLICY "Allow insert from service"
  ON blockchain_events FOR INSERT
  TO service_role
  WITH CHECK (true);
```

### 4. Start Listening to Contracts

**Option A: Programmatically** (in backend startup or admin endpoint):
```typescript
import { eventListenerService } from './services/event-listener.service';

// Start listening to NFT contract
await eventListenerService.listenToNFTContract(
  '0x123...', // Contract address
  NFT_ABI      // Contract ABI
);

// Start listening to Marketplace
await eventListenerService.listenToMarketplaceContract(
  '0x456...',
  MARKETPLACE_ABI
);

// Start listening to Auction
await eventListenerService.listenToAuctionContract(
  '0x789...',
  AUCTION_ABI
);
```

**Option B: Via API** (requires authentication):
```bash
# Start NFT listener
curl -X POST http://localhost:3001/api/events/nft/0x123... \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"abi": [...]}'

# Start Marketplace listener
curl -X POST http://localhost:3001/api/events/marketplace/0x456... \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"abi": [...]}'
```

## Usage Examples

### Frontend Integration

#### Basic Event Feed
```tsx
import { EventFeed } from './components/EventFeed';

function App() {
  return (
    <div>
      <EventFeed />
    </div>
  );
}
```

#### Custom Event Handling
```tsx
import { useEventListener } from './hooks/useEventListener';

function MyComponent() {
  const { events, isConnected, subscribe } = useEventListener({
    onEvent: (event) => {
      if (event.type === 'nft_minted') {
        console.log('New NFT minted!', event.data);
        // Show notification, update UI, etc.
      }
    },
  });

  useEffect(() => {
    if (isConnected) {
      subscribe('nft_minted');
    }
  }, [isConnected]);

  return (
    <div>
      {events.map((event, i) => (
        <div key={i}>{event.type}: {JSON.stringify(event.data)}</div>
      ))}
    </div>
  );
}
```

#### NFT-Specific Events
```tsx
import { useNFTEvents } from './hooks/useEventListener';

function NFTPage({ contractAddress }) {
  const { nftEvents, isConnected } = useNFTEvents(contractAddress);

  return (
    <div>
      <h2>NFT Events</h2>
      {nftEvents.map((event, i) => (
        <div key={i}>
          {event.type}: Token #{event.data.tokenId}
        </div>
      ))}
    </div>
  );
}
```

#### Auction Live Updates
```tsx
import { useAuctionEvents } from './hooks/useEventListener';

function AuctionPage({ auctionId }) {
  const { auctionEvents } = useAuctionEvents(auctionId);

  const latestBid = auctionEvents
    .filter(e => e.type === 'bid_placed')
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];

  return (
    <div>
      {latestBid && (
        <div>
          Latest Bid: {latestBid.data.amount} ETH
          by {latestBid.data.bidder}
        </div>
      )}
    </div>
  );
}
```

## WebSocket Protocol

### Client → Server Messages

**Subscribe to Events**:
```json
{
  "event": "subscribe",
  "data": {
    "userId": "user-123",
    "eventType": "nft_minted",
    "contractAddress": "0x123...",
    "nftId": "token-456",
    "auctionId": "auction-789"
  }
}
```

**Unsubscribe from Events**:
```json
{
  "event": "unsubscribe",
  "data": {
    "userId": "user-123",
    "eventType": "nft_minted"
  }
}
```

### Server → Client Messages

**Connection Confirmed**:
```json
{
  "event": "subscribed",
  "data": {
    "eventType": "nft_minted"
  }
}
```

**Blockchain Event**:
```json
{
  "event": "blockchain_event",
  "data": {
    "type": "nft_minted",
    "data": {
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0x123...",
      "tokenId": "42",
      "contractAddress": "0xNFT...",
      "transactionHash": "0xTX...",
      "blockNumber": 12345
    },
    "timestamp": 1704931200000
  }
}
```

## Performance Considerations

### Backend
- **Connection Limits**: WebSocket provider maintains persistent connection
- **Memory Usage**: Events stored in-memory (max 100 per client) + database
- **Database Writes**: Every event written to `blockchain_events` table
- **Broadcasting**: All connected clients receive all events

### Frontend
- **Auto-Reconnection**: Enabled with 5 attempts, 1s delay
- **Event Limit**: Stores max 100 recent events in memory
- **Polling Fallback**: Falls back to HTTP polling if WebSocket fails

### Optimization Tips
1. **Filter Early**: Subscribe only to needed event types
2. **Cleanup**: Unsubscribe when component unmounts
3. **Batch Updates**: Use `useMemo` for filtered event lists
4. **Database Indexes**: Ensure indexes on `event_type`, `contract_address`, `created_at`

## Security

### Authentication
- Event history endpoint requires JWT authentication
- Admin endpoints require `admin` role
- WebSocket connections accept authenticated users only (can be enforced)

### Rate Limiting
- REST endpoints: 100 requests/15 minutes
- WebSocket: Connection throttling (5 max retries)

### Input Validation
- Contract addresses validated before listening
- ABIs sanitized before use
- Event data JSON-validated

## Monitoring & Debugging

### Backend Logs
```bash
# Check event listener initialization
grep "Event listener service initialized" logs/app.log

# Check contract listeners
grep "Listening to" logs/app.log

# Check broadcasted events
grep "Broadcasted event" logs/app.log
```

### Frontend Console
```javascript
// Enable Socket.IO debug logs
localStorage.debug = 'socket.io-client:*';

// Check connection status
console.log(socket.connected);

// View received events
socket.on('blockchain_event', (event) => {
  console.log('Event received:', event);
});
```

### Health Check
```bash
# Check if WebSocket server is running
curl http://localhost:3001/api/health
```

## Troubleshooting

### WebSocket Connection Fails
1. Check `BASE_WS_RPC_URL` environment variable
2. Verify network connectivity to Base RPC
3. Check CORS configuration
4. Verify firewall allows WebSocket connections

### Events Not Received
1. Confirm contract listener is started
2. Check contract address is correct
3. Verify ABI matches deployed contract
4. Check subscription to correct event type
5. Verify transaction actually happened on-chain

### Database Issues
1. Ensure `blockchain_events` table exists
2. Check RLS policies allow inserts
3. Verify service role has write access
4. Check database connection pool

## Testing

### Manual Testing

**1. Start Backend**:
```bash
cd backend
npm run dev
```

**2. Check WebSocket Initialized**:
Look for: "Event listener service initialized"

**3. Start Contract Listeners** (via API or code):
```bash
curl -X POST http://localhost:3001/api/events/nft/0xYourNFTContract \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"abi": [...]}'
```

**4. Open Frontend**:
```bash
cd frontend
npm run dev
# Navigate to http://localhost:5173/events
```

**5. Trigger On-Chain Event**:
- Mint an NFT
- List on marketplace
- Place a bid

**6. Verify**:
- Event appears in EventFeed component
- Event stored in database
- BaseScan link works

### Automated Testing
```typescript
// Example test
import { eventListenerService } from './event-listener.service';

describe('Event Listener Service', () => {
  it('should listen to NFT contract', async () => {
    await eventListenerService.listenToNFTContract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI
    );
    
    // Mint NFT on-chain (in test environment)
    const tx = await nftContract.mint(recipient, tokenURI);
    await tx.wait();
    
    // Wait for event
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check database
    const events = await eventListenerService.getEventHistory({
      eventType: 'nft_minted',
    });
    
    expect(events.length).toBeGreaterThan(0);
  });
});
```

## Production Deployment

### Requirements
- Base mainnet WebSocket RPC URL
- Supabase production database
- SSL/TLS for WebSocket (wss://)
- Load balancer with WebSocket support
- Monitoring/alerting for connection drops

### Checklist
- [ ] Update `BASE_WS_RPC_URL` to mainnet
- [ ] Configure production CORS origins
- [ ] Enable WebSocket SSL (wss://)
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Test reconnection logic
- [ ] Load test with multiple clients
- [ ] Document contract addresses
- [ ] Set up alerts for connection failures

## API Reference Summary

### REST Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/history` | ✅ | Get event history |
| POST | `/api/events/nft/:address` | ✅ | Start NFT listener |
| POST | `/api/events/marketplace/:address` | ✅ | Start Marketplace listener |
| POST | `/api/events/auction/:address` | ✅ | Start Auction listener |

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Server → Client | Connection established |
| `disconnect` | Server → Client | Connection closed |
| `subscribe` | Client → Server | Subscribe to event type |
| `subscribed` | Server → Client | Subscription confirmed |
| `unsubscribe` | Client → Server | Unsubscribe from event type |
| `unsubscribed` | Server → Client | Unsubscription confirmed |
| `blockchain_event` | Server → Client | Real-time blockchain event |

## Next Steps

1. **Deploy Database Migration** - Create `blockchain_events` table
2. **Configure RPC URLs** - Set WebSocket endpoints
3. **Start Contract Listeners** - Listen to deployed contracts
4. **Test Real-Time Updates** - Trigger on-chain events
5. **Monitor Performance** - Check connection stability
6. **Optimize Queries** - Add database indexes if needed
7. **Scale** - Add load balancing for high traffic

## Support

For issues or questions:
- Check logs: `backend/logs/app.log`
- Database queries: Supabase Dashboard
- Network status: https://status.base.org
- BaseScan: https://basescan.org (mainnet) or https://sepolia.basescan.org (testnet)
