# Multi-Wallet Tracking System Documentation

## Overview

The Multi-Wallet Tracking System is a comprehensive solution for monitoring and managing multiple cryptocurrency wallets across various blockchain networks. It provides real-time metrics, comparative analysis, portfolio snapshots, and intelligent watchlist management.

## Architecture

### System Components

#### 1. Smart Contract Layer (`MultiWalletTracker.sol`)
- **Purpose**: On-chain wallet profile and campaign data management
- **Key Features**:
  - Wallet profile creation and management
  - Watchlist management (up to 50 wallets per user)
  - Campaign allocation and claim tracking
  - Portfolio snapshots for historical analysis
  - Batch metrics retrieval for efficiency
  - Wallet comparison functionality

#### 2. Backend Service Layer (`multiWalletTrackingService.ts`)
- **Purpose**: Off-chain abstraction layer for blockchain interaction
- **Key Features**:
  - Smart contract communication via ethers.js
  - 5-minute cache for metrics and campaign data
  - Event-driven architecture with EventEmitter
  - Batch operations support
  - Auto-update functionality with configurable intervals
  - Comprehensive error handling and logging

#### 3. Frontend Components
- **MultiWalletDashboard.tsx**: Main dashboard for viewing multiple wallets
- **WalletComparison.tsx**: Side-by-side wallet comparison interface
- **WatchlistManager.tsx**: Watchlist management and organization

#### 4. API Routes (`walletRoutes.ts`)
- RESTful API endpoints for all wallet operations
- Request validation and error handling
- Response standardization

## Smart Contract Reference

### MultiWalletTracker Contract

#### Data Structures

```solidity
struct WalletProfile {
  address address;
  string name;
  uint256 createdAt;
  bool isActive;
  uint256 numCampaigns;
  uint256 totalClaimed;
}

struct WalletMetrics {
  address address;
  string name;
  uint256 totalAllocated;
  uint256 totalClaimed;
  uint256 totalPending;
  uint256 numCampaigns;
  uint256 numChains;
  uint256 claimPercentage;
}

struct CampaignAllocation {
  bytes32 campaignId;
  address token;
  uint256 allocated;
  uint256 claimed;
  uint256 chainId;
}

struct PortfolioSnapshot {
  uint256 timestamp;
  uint256 totalAllocated;
  uint256 totalClaimed;
  uint256 snapshotCount;
}

struct WalletComparison {
  address wallet1;
  address wallet2;
  uint256 wallet1Allocated;
  uint256 wallet2Allocated;
  uint256 wallet1Claimed;
  uint256 wallet2Claimed;
  uint256 wallet1Pending;
  uint256 wallet2Pending;
}
```

#### Key Functions

##### Profile Management

```solidity
function createProfile(
  address walletAddress,
  string memory name
) external
```
- Creates or updates a wallet profile
- Emits `ProfileCreated` event
- Validates wallet address

```solidity
function getProfile(address walletAddress) external view returns (WalletProfile)
```
- Retrieves wallet profile information
- Returns profile details
- Reverts if profile doesn't exist

##### Watchlist Operations

```solidity
function addToWatchlist(address wallet) external
```
- Adds wallet to user's watchlist
- Maximum 50 wallets per user
- Prevents duplicate entries
- Emits `AddedToWatchlist` event

```solidity
function removeFromWatchlist(address wallet) external
```
- Removes wallet from user's watchlist
- Emits `RemovedFromWatchlist` event

```solidity
function getWatchlist(address user) external view returns (address[])
```
- Retrieves user's watchlist
- Returns array of wallet addresses

##### Campaign Tracking

```solidity
function trackCampaignData(
  address wallet,
  CampaignAllocation memory campaign
) external
```
- Records campaign allocation data
- Supports multiple chains
- Emits `CampaignDataTracked` event

```solidity
function recordClaim(
  address wallet,
  bytes32 campaignId,
  uint256 claimAmount,
  uint256 chainId
) external
```
- Records claim event for campaign
- Updates portfolio metrics
- Emits `ClaimRecorded` event

```solidity
function getWalletCampaigns(address wallet) external view returns (CampaignAllocation[])
```
- Retrieves all campaigns for wallet
- Returns campaign data array

##### Portfolio Management

```solidity
function getPortfolio(address wallet) external view returns (WalletMetrics)
```
- Comprehensive portfolio overview
- Calculates aggregate metrics
- Includes all campaigns and chains

```solidity
function createSnapshot(address wallet) external
```
- Creates portfolio state snapshot
- Stores historical data
- Emits `SnapshotCreated` event

```solidity
function getPortfolioHistory(address wallet) external view returns (PortfolioSnapshot[])
```
- Retrieves historical snapshots
- Returns time-series data

##### Batch Operations

```solidity
function batchGetMetrics(address[] calldata wallets) external view returns (WalletMetrics[])
```
- Efficient batch metric retrieval
- Handles errors gracefully
- Returns metrics for all provided wallets

##### Wallet Comparison

```solidity
function compareWallets(
  address wallet1,
  address wallet2
) external view returns (WalletComparison)
```
- Compares metrics between two wallets
- Returns comparative data
- Identifies differences

## Backend Service Reference

### MultiWalletTrackingService Class

#### Initialization

```typescript
const service = new MultiWalletTrackingService(
  contractAddress,
  providerUrl,
  abiPath
);
```

#### Event Handling

```typescript
// Subscribe to events
service.on('profileCreated', (data) => {
  console.log('Profile created:', data);
});

service.on('walletAdded', (data) => {
  console.log('Wallet added to watchlist:', data);
});

service.on('metricsUpdated', (data) => {
  console.log('Metrics updated:', data);
});
```

#### Key Methods

##### Wallet Profile

```typescript
async createProfile(walletAddress: string, name: string): Promise<string>
```
- Creates wallet profile
- Returns transaction hash
- Validates address format

##### Watchlist Management

```typescript
async addToWatchlist(userAddress: string, wallet: string): Promise<string>
async removeFromWatchlist(userAddress: string, wallet: string): Promise<string>
async getWatchlist(userAddress: string): Promise<string[]>
async getWatchlistMetrics(userAddress: string): Promise<WalletMetrics[]>
```

##### Metrics Retrieval

```typescript
async getWalletMetrics(wallet: string): Promise<WalletMetrics>
async getWalletCampaigns(wallet: string): Promise<CampaignAllocation[]>
async batchGetMetrics(wallets: string[]): Promise<WalletMetrics[]>
```

##### Portfolio Analysis

```typescript
async compareWallets(wallet1: string, wallet2: string): Promise<PortfolioComparison>
async getPortfolioHistory(wallet: string): Promise<WalletSnapshot[]>
async createPortfolioSnapshot(wallet: string): Promise<string>
```

##### Cache Management

```typescript
clearCache(): void
getCacheStatus(): CacheStatus
```

##### Auto-Update Functionality

```typescript
startAutoUpdate(userAddress: string, intervalSeconds: number = 300): void
stopAutoUpdate(userAddress: string): void
```

## API Endpoints

### Wallet Profile

#### Create Profile
```
POST /api/wallets/profile/create
Content-Type: application/json

{
  "walletAddress": "0x...",
  "name": "My Wallet"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "transactionHash": "0x..."
}
```

#### Get Profile
```
GET /api/wallets/profile/:address
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "address": "0x...",
    "name": "My Wallet",
    "totalAllocated": "1000000000000000000",
    "totalClaimed": "500000000000000000",
    "claimPercentage": 50
  }
}
```

### Watchlist Management

#### Add to Watchlist
```
POST /api/wallets/watchlist/add
Content-Type: application/json

{
  "userAddress": "0x...",
  "wallet": "0x..."
}
```

#### Remove from Watchlist
```
POST /api/wallets/watchlist/remove
Content-Type: application/json

{
  "userAddress": "0x...",
  "wallet": "0x..."
}
```

#### Get Watchlist
```
GET /api/wallets/watchlist/:userAddress
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "address": "0x...",
      "name": "Wallet 1",
      "totalAllocated": "1000000000000000000",
      "totalClaimed": "500000000000000000",
      "claimPercentage": 50
    }
  ]
}
```

### Wallet Comparison

#### Compare Wallets
```
POST /api/wallets/compare
Content-Type: application/json

{
  "wallet1": "0x...",
  "wallet2": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet1": {
      "address": "0x...",
      "name": "Wallet 1",
      "totalAllocated": "1000000000000000000"
    },
    "wallet2": {
      "address": "0x...",
      "name": "Wallet 2",
      "totalAllocated": "2000000000000000000"
    },
    "percentDifference": {
      "allocated": 100,
      "claimed": 140
    }
  }
}
```

### Metrics

#### Get Wallet Metrics
```
GET /api/wallets/metrics/:address
```

#### Get Batch Metrics
```
POST /api/wallets/batch-metrics
Content-Type: application/json

{
  "wallets": ["0x...", "0x..."]
}
```

### Campaigns

#### Get Wallet Campaigns
```
GET /api/wallets/campaigns/:address
```

### Portfolio

#### Get Portfolio History
```
GET /api/wallets/history/:address
```

#### Create Portfolio Snapshot
```
POST /api/wallets/snapshot/create
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

### Cache Management

#### Get Cache Status
```
GET /api/wallets/cache-status
```

#### Clear Cache
```
POST /api/wallets/cache/clear
```

### Auto-Update

#### Start Auto-Update
```
POST /api/wallets/auto-update/start
Content-Type: application/json

{
  "userAddress": "0x...",
  "intervalSeconds": 300
}
```

#### Stop Auto-Update
```
POST /api/wallets/auto-update/stop
Content-Type: application/json

{
  "userAddress": "0x..."
}
```

## Frontend Components

### MultiWalletDashboard

**Features:**
- Display all watched wallets in a grid
- Real-time metrics (allocated, claimed, pending)
- Claim progress visualization
- Network distribution display
- Wallet search and filtering
- Add/remove watchlist functionality
- Auto-refresh with configurable interval
- Sort by allocated, claimed, or name

**Props:** None (uses internal state)

**Events:**
- onWalletAdded: When wallet is added to watchlist
- onWalletRemoved: When wallet is removed from watchlist
- onMetricsUpdated: When metrics are refreshed

### WalletComparison

**Features:**
- Side-by-side wallet comparison
- Allocation comparison with percentage difference
- Claim metrics comparison
- Winner indicators
- Key insights panel
- Swap functionality for quick reordering
- Detailed comparison breakdown

**Props:** None (uses internal state)

**Input Fields:**
- First wallet address
- Second wallet address

### WatchlistManager

**Features:**
- Searchable watchlist table
- Bulk operations (select/remove multiple)
- Edit wallet names inline
- Sort by added date, updated date, or name
- Status indicators
- Timestamps (added date)
- Quick statistics

**Props:** None (uses internal state)

**Actions:**
- Add wallet
- Remove wallet (individual)
- Bulk remove selected wallets
- Edit wallet name
- Search and filter

## Deployment Guide

### Smart Contract Deployment

```bash
# Compile contract
npx hardhat compile

# Deploy to network
npx hardhat run scripts/deploy.ts --network <network-name>

# Verify on Etherscan (if supported)
npx hardhat verify <contract-address> --network <network-name>
```

### Backend Service Setup

```bash
# Install dependencies
npm install ethers dotenv

# Create .env file
PROVIDER_URL=https://rpc.example.com
TRACKER_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...

# Start service
npm run start:backend
```

### Frontend Deployment

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to hosting (Vercel, Netlify, etc.)
npm run deploy
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/MultiWalletTracker.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage

- Profile Management (8 tests)
- Watchlist Management (8 tests)
- Campaign Tracking (5 tests)
- Portfolio Management (4 tests)
- Batch Operations (3 tests)
- Wallet Comparison (4 tests)
- Access Control (3 tests)
- Gas Optimization (3 tests)
- Event Tracking (3 tests)

**Total: 43+ Test Cases**

## Security Considerations

### Smart Contract Security

1. **ReentrancyGuard**: Protects against reentrancy attacks
2. **Ownable Pattern**: Admin access control
3. **Input Validation**: Address and data validation
4. **Access Modifiers**: Function-level access control
5. **Event Logging**: Complete operation tracking

### Backend Security

1. **Request Validation**: Input validation on all endpoints
2. **Error Handling**: Comprehensive error catching
3. **Rate Limiting**: (Recommended to implement)
4. **CORS Configuration**: (Configure appropriately)
5. **API Authentication**: (Recommended to implement)

### Frontend Security

1. **Input Sanitization**: Address validation before submission
2. **XSS Prevention**: React's built-in XSS protection
3. **CSRF Protection**: Implement CSRF tokens
4. **Secure Storage**: LocalStorage vs SessionStorage considerations

## Performance Optimization

### Caching Strategy

- **5-minute TTL**: Wallet metrics and campaign data
- **Manual Clear**: Clear cache when needed
- **Memory Management**: Automatic cache expiration

### Batch Operations

- **Batch Metrics**: Retrieve up to 50+ wallet metrics simultaneously
- **Error Resilience**: Individual wallet failures don't block batch
- **Performance**: Gas-efficient batch contract calls

### Frontend Optimization

- **Component Memoization**: Prevent unnecessary re-renders
- **Virtual Scrolling**: Handle large watchlists
- **Lazy Loading**: Load components on-demand
- **Image Optimization**: Compress and optimize assets

## Troubleshooting

### Common Issues

**Issue: "Profile does not exist"**
- Solution: Create profile first using `createProfile()` endpoint

**Issue: "Watchlist full"**
- Solution: Remove wallets from watchlist (max 50 wallets)

**Issue: "Invalid wallet address"**
- Solution: Ensure wallet is valid Ethereum address (0x...)

**Issue: Cache stale data**
- Solution: Call `clearCache()` endpoint or wait for 5-minute expiration

**Issue: Auto-update not working**
- Solution: Ensure watchlist is not empty, check network connection

## Future Enhancements

1. **Price Oracle Integration**: Real-time token prices
2. **Multi-Chain Support**: Enhanced cross-chain tracking
3. **Advanced Analytics**: Predictive analytics and trend analysis
4. **Notifications**: Real-time alerts for claim milestones
5. **Custom Dashboards**: User-customizable dashboard layouts
6. **Export Features**: CSV/JSON export for portfolio data
7. **API Rate Limiting**: Implement rate limits
8. **Database Integration**: Persistent off-chain storage
9. **WebSocket Support**: Real-time updates via WebSocket
10. **Mobile App**: Native mobile application

## Support and Resources

- **Documentation**: This file and inline code comments
- **Tests**: See `tests/MultiWalletTracker.test.ts` for usage examples
- **GitHub**: Repository with all source code
- **Issues**: Report bugs and feature requests

## License

This project is licensed under the MIT License - see LICENSE file for details.
