# BitArt Market - Base-First NFT Marketplace 🔵

[![Test](https://github.com/cryptonique0/BitArt-Market/actions/workflows/test.yml/badge.svg)](https://github.com/cryptonique0/BitArt-Market/actions/workflows/test.yml)
[![Build](https://github.com/cryptonique0/BitArt-Market/actions/workflows/build.yml/badge.svg)](https://github.com/cryptonique0/BitArt-Market/actions/workflows/build.yml)
[![E2E Tests](https://github.com/cryptonique0/BitArt-Market/actions/workflows/e2e.yml/badge.svg)](https://github.com/cryptonique0/BitArt-Market/actions/workflows/e2e.yml)
[![Deploy](https://github.com/cryptonique0/BitArt-Market/actions/workflows/deploy.yml/badge.svg)](https://github.com/cryptonique0/BitArt-Market/actions/workflows/deploy.yml)

A **Base-native**, production-ready NFT marketplace optimized for **Base Mainnet** with seamless wallet integration, transparent fees, and creator-first features. Also supports **Stacks blockchain** with Solidity/Clarity smart contracts, React frontend, and Node.js backend.

## 🎉 **Live on Base Mainnet!**

All smart contracts deployed and verified on Base Mainnet with base-first UX:
- **BitArtNFT**: `0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682`
- **BitArtMarketplace**: `0x7d28443e3571faB3821d669537E45484E4A06AC9`
- **BitArtAuction**: `0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2`

🔗 [View on BaseScan](https://basescan.org)

## � Feature Highlights

### 🏆 Engagement & Growth Pack (Days 15-17)
- **Collector XP + Badges + Leaderboard** — XP from buys/sells/mints/listings, streak multipliers, tiered badges, and a combined XP + volume leaderboard to fuel “top 10” competition.
- **Referral & Invite Links** — Per-user invite codes with tracked clicks, signups, referred volume, ETH kickbacks, and a “top referrers” widget.
- **Drop Calendar + Allowlist Engine** — Scheduled drops with allowlist windows, countdowns, featured drops, and notify-by-email/webhook hooks.
- **AI-Powered Recommendations** — “Because you collected X” carousel using tag overlap + popularity fallback.
- **Safety & Trust Pack** — Provenance and verified-creator badges, suspicious-collection warnings, and transaction preflight trust signals.

### 🔍 Latest: Advanced Search & Discovery (Days 8-9)
- **Advanced Filtering** - Price range, creator, rarity, verification status, listed status
- **Smart Sorting** - Popularity, price (asc/desc), trending, newest/oldest
- **Search Ranking** - Relevance-based ranking with popularity tiebreaker
- **Trending NFTs** - Real-time trending collections with popularity metrics
- **Category Browse** - Explore by rarity (common, uncommon, rare, legendary)
- **Autocomplete** - Search suggestions with instant results
- **Marketplace Stats** - Floor price, average price, volume, sales count

### 🎨 Royalty Analytics Dashboard (Day 6)
- **Royalty Tracking** - Real-time secondary sale earnings per NFT and creator
- **30-Day Revenue Charts** - Interactive visual earnings trends with daily breakdown
- **Creator Dashboard** - Comprehensive analytics with revenue summaries
- **Top Earner NFTs** - Identify highest-performing collections by royalties
- **Revenue Summaries** - At-a-glance metrics with 7-day vs 7-day trend analysis
- **Royalty History** - Detailed payment records with BaseScan transaction links
- **Visual Charts** - Custom line and bar charts with dark mode support

### 📊 Creator Economy Tools (Days 4-5)
- **Creator Profiles** - Dedicated pages showing NFTs created, total earnings, and sales history
- **Marketplace Analytics** - 7 key metrics (volume, sales, users, listings, floor price, avg price, revenue)
- **Revenue Charts** - 30-day visual earning trends with peak/average statistics
- **Earnings Aggregation** - Track primary sales and royalty distributions
- **Most Sold NFT** - Highlight best-performing pieces per creator
- **Recent Sales Table** - Transaction history with prices and buyer addresses

### 🎯 Extended Wallet & Transaction UX (Day 3)
- **Transaction Status Components** - Loading states, success/error toasts, history tracking
- **Wallet Error Handling** - Disconnect banners, reconnection flows, error display
- **Transaction Service** - RPC polling, status updates, confirmation tracking
- **Session Persistence** - 7-day localStorage with automatic cleanup
- **Disconnect Handling** - Graceful error recovery and state management

## 🚀 Base-Native Features

✨ **Production-ready features built specifically for Base Mainnet:**

### ⚡ Network Intelligence
- **Auto-detection & auto-switch** to Base Mainnet (seamless UX)
- **Chain change listeners** for real-time wallet updates
- **Graceful fallback** if not on Base with prominent banner

### 💰 Gas Optimization
- **Real-time gas estimation** from Base RPC
- **Transparent fee breakdown** (item price, platform fee, royalty, gas)
- **"Cheap Gas" badges** when transactions < 0.01 ETH
- **Savings indicator** showing advantage vs Ethereum mainnet
- **Live gas price updates** in Gwei and ETH

### 🔗 Explorer Integration
- **BaseScan deep links** on every transaction
- **Address & contract links** with copy-to-clipboard
- **Transaction status display** with explorer navigation
- **Shortened hashes** for readable UI while keeping full links

### 🏷️ Badge System
- **"Built on Base"** badge on all marketplace NFTs
- **Base OG** badge for early supporters
- **Verified creator** badges
- **Trending & Featured** badges
- **New listing** indicators (< 7 days)
- **Customizable badge sizes** (sm, md, lg)

### 💳 Coinbase Wallet Optimization
- **Automatic Coinbase Wallet detection**
- **Smart Wallet capability detection** (account abstraction)
- **Feature indicators** (EIP-1559, batch transactions)
- **Optimized connect button** with Coinbase branding
- **Smart Wallet gasless hints**

### ⚙️ Gasless Transactions (Optional)
- **Paymaster integration framework** (Pimlico-ready)
- **ERC-4337 account abstraction** support
- **Eligibility detection** for gasless users
- **Graceful fallback** to normal transactions
- **Savings estimation** (up to 95% gas reduction)
- **Promotional banners** for gasless benefits

## 🚀 Features

### Smart Contracts
- **ERC721 NFTs** (Base) with metadata storage and royalties (EIP-2981)
- **SFT-based NFTs** (Stacks) with metadata storage
- **Royalty system** for creator earnings on resales
- **Marketplace listing** with price management and automatic royalty distribution
- **Auction system** with bidding, reserve prices, and bid increments
- **Post-conditions** for transaction security (Stacks)
- **Admin role** for platform management
- **ReentrancyGuard** protection (Base)

### Frontend
- **Responsive design** (mobile, tablet, desktop) with Tailwind CSS
- **Dark/Light mode** support with persistent theme storage
- **Real-time blockchain data** display with Base RPC integration
- **Wallet integration** (MetaMask, Coinbase Wallet, Leather, Hiro)
- **NFT discovery** with advanced filters and search
- **Creator Studio** for artists to manage collections and view analytics
- **Analytics Dashboard** - Marketplace-wide metrics with trend indicators
- **Creator Profiles** - Dedicated pages for artist portfolios
- **Royalty Dashboard** - Revenue tracking with visual charts
- **Transaction Tracking** - Real-time status updates and history
- **Smooth animations** and transitions with loading states

### Backend
- **REST API** with 20+ endpoints for marketplace operations
- **IPFS integration** for decentralized storage (Pinata)
- **User profile management** with creator stats
- **Transaction history tracking** with blockchain sync
- **Analytics service** - Volume, sales, revenue, user metrics
- **Royalty tracking service** - Secondary sale earnings and distributions
- **Creator service** - Earnings aggregation and profile data
- **Search and filtering** engine with pagination and ranking
- **Consolidated marketplace service** - Unified listing, buying, fee calculations
- **Service barrel exports** - Simplified and organized API

### Multi-Chain Support
- **Base Mainnet (Primary)**: EVM-compatible L2 with low fees and fast transactions
  - ERC721 NFT contract with royalty support
  - Marketplace with automatic royalty distribution
  - Auction contract with bidding mechanism
## 📋 Project Structure

```
/contracts
  /solidity       → Solidity contracts for Base (ERC721, Marketplace, Auction)
  /clarity        → Clarity smart contracts for Stacks
/frontend         → React UI application with multi-chain support
/backend          → Node.js/Express API with Base RPC integration
/config           → Network & environment configuration
/utils            → Web3 helpers and utilities
/docs             → Documentation and deployment guides
```nfig           → Network & environment configuration
/utils            → Web3 helpers and utilities
/docs             → Documentation
## ⚙️ Prerequisites

- Node.js 18+
- MetaMask wallet (for Base network)
- Leather/Hiro wallet (for Stacks network)
- Remix IDE (for Solidity deployment) or Hardhat
- Clarinet (for Clarity contract development)
- IPFS node or Pinata account (for image storage)
- Clarinet (for contract development)
- IPFS node or Pinata account (for image storage)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bitart-market.git
cd bitart-market

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspace backend
npm install --workspace frontend

# Install contracts dependencies
cd contracts && npm install && cd ..
```

## 🚀 Getting Started

### 1. Configure Environment Variables

**Backend** (`backend/.env.local`):
```env
PORT=3001
NETWORK=testnet
STACKS_API_URL=https://api.testnet.stacks.co
IPFS_GATEWAY=https://gateway.pinata.cloud
PINATA_JWT=your_pinata_jwt_token
BASE_RPC_URL=https://mainnet.base.org
```

**Frontend** (`frontend/.env.local`):
```env
VITE_NETWORK=testnet
VITE_API_URL=http://localhost:3001/api

# Stacks Contracts (Testnet)
VITE_NFT_CONTRACT=ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.colorful-lime-guan
VITE_MARKETPLACE_CONTRACT=ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.partial-harlequin-tahr
VITE_AUCTION_CONTRACT=ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.better-copper-lemming

# Base Contracts (Mainnet)
VITE_BASE_NFT_CONTRACT=0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682
VITE_BASE_MARKETPLACE_CONTRACT=0x7d28443e3571faB3821d669537E45484E4A06AC9
VITE_BASE_AUCTION_CONTRACT=0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2
### 2. Smart Contracts

**Base Contracts (Already Deployed)**
✅ All contracts are live on Base Mainnet. See [contracts/solidity/README.md](./contracts/solidity/README.md) for details.

**Stacks Contracts (Optional)**
```bash
cd contracts

# Test Clarity contracts
npm run test

# Deploy to Stacks testnet
npm run deploy:testnet
```

See [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) for full deployment details.
# Test contracts
npm run test

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet (after testing)
npm run deploy:mainnet
```

See [CONTRACTS.md](./docs/CONTRACTS.md) for detailed contract documentation.

### 3. Start Backend

```bash
npm run dev --workspace backend
```

The API will be available at `http://localhost:3001`

### 4. Start Frontend

```bash
npm run dev --workspace frontend
```

The app will be available at `http://localhost:5173`

### 5. Create Your First NFT

1. Connect your wallet (Leather or Hiro)
2. Navigate to "Create" → "New NFT"
3. Upload artwork and fill metadata
4. Set royalty percentage (0-25%)
5. Click "Mint NFT"
6. Approve transaction in wallet

## 📚 Documentation

- **[Smart Contracts](./docs/CONTRACTS.md)** - Clarity contract details, functions, and safety
- **[API Reference](./docs/API.md)** - Backend endpoints and data models
- **[Wallet Integration](./docs/WALLET.md)** - Stacks.js setup and wallet connection
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment steps
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and data flow

## 🔐 Security Features

- **Post-conditions** on all marketplace transactions
- **Admin verification** for sensitive operations
- **Input validation** on all contract functions
- **Rate limiting** on API endpoints
- **Image hash verification** to prevent duplicates
- **Secure wallet connection** with signing validation

## 📊 API Endpoints

### Base Blockchain
- `GET /api/base/health` - Base network health check
- `GET /api/base/account/:address` - Get Base wallet balance and info

### NFTs
- `GET /api/nfts` - List all NFTs with filters and pagination
- `GET /api/nfts/:id` - Get NFT details with metadata
- `POST /api/nfts` - Create NFT (authenticated)
- `GET /api/nfts/:id/history` - Transaction history

### Marketplace
- `GET /api/marketplace/listings` - Active listings with filters
- `POST /api/marketplace/listings` - Create listing
- `PUT /api/marketplace/listings/:id` - Update listing price
- `DELETE /api/marketplace/listings/:id` - Cancel listing

### Users
- `GET /api/users/:address` - User profile with stats
- `GET /api/users/:address/nfts` - User's NFT collection
- `GET /api/users/:address/collections` - User's created collections
- `POST /api/users/:address/avatar` - Upload avatar

### Analytics
- `GET /api/analytics/stats` - Marketplace statistics (volume, sales, users)
- `GET /api/analytics/trends` - 7-day trend indicators
- `GET /api/analytics/top-creators` - Top creators by volume
- `GET /api/analytics/top-buyers` - Top buyers by spending

### Creator Profiles
- `GET /api/creators/:address` - Creator profile and earnings
- `GET /api/creators/:address/stats` - Detailed creator statistics
- `GET /api/creators/:address/sales` - Sales history

### Royalties
- `GET /api/royalties/creator/:address` - Creator royalty summary
- `GET /api/royalties/creator/:address/history?days=30` - Royalty chart data
- `GET /api/royalties/nft/:nftId` - NFT-specific royalty stats
- `GET /api/royalties/top?limit=20` - Top earning NFTs by royalties
- `POST /api/royalties/calculate` - Calculate royalties for a sale

### Search & Discovery
- `GET /api/search?q=query&sort=popularity&page=1&limit=20` - Advanced search with filters
- `GET /api/search/trending?limit=10` - Trending NFTs
- `GET /api/search/suggestions?q=query` - Search autocomplete
- `GET /api/search/category/:category?page=1&limit=20` - Browse by category

## 🎨 UI/UX Components

### Pages
- **Homepage** - Trending, newest, featured NFTs
- **Discover** - Search, filters, categories
- **Create** - Minting interface
- **NFT Detail** - Full NFT information with history
- **Profile** - User portfolio and owned NFTs
- **Creator Studio** - Sales tracking and collection management
- **Marketplace** - All active listings with advanced filters

### Features
- Dark/Light mode toggle
- Real-time notifications
- Responsive design
- Favorite/bookmark system
- Advanced search with autocomplete
- Category and tag filters
- Price range slider
- Sorting options (price, date, popularity)

## 🧪 Testing

```bash
# Test contracts
cd contracts && npm run test

# Test backend
npm run test --workspace backend

# Test frontend
npm run test --workspace frontend
```

## 🚢 Deployment

### Quick Start Deployment

We provide deployment configurations for Render (backend) and Vercel (frontend).

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.**

#### Backend (Node.js/Express on Render)
```bash
# Verify build
npm run build --workspace backend

# Push to GitHub
git push origin main

# On Render.com:
# 1. Connect GitHub repository
# 2. Deploy script: npm run build --workspace backend
# 3. Start command: node backend/dist/index.js
# 4. Set environment variables (see .env.production.backend)
```

#### Frontend (React/Vite on Vercel)
```bash
# Verify build
npm run build --workspace frontend

# Option 1: Vercel CLI
npm install -g vercel
vercel --prod

# Option 2: GitHub integration on Vercel.com
# Connect repository and auto-deploy on push
```

### Environment Variables

**Backend (.env.production.backend)**
```env
NODE_ENV=production
PORT=3001
STACKS_API_URL=https://api.mainnet.stacks.co
STACKS_NETWORK=mainnet
BASE_RPC_URL=https://mainnet.base.org
PINATA_API_KEY=your_key
PINATA_SECRET_API_KEY=your_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend (.env.production.frontend)**
```env
VITE_API_URL=https://your-backend-api.com
VITE_STACKS_API_URL=https://api.mainnet.stacks.co
VITE_STACKS_NETWORK=mainnet
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_BASE_CHAIN_ID=0x2105
VITE_BASE_NFT_CONTRACT=0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682
VITE_BASE_MARKETPLACE_CONTRACT=0x7d28443e3571faB3821d669537E45484E4A06AC9
VITE_BASE_AUCTION_CONTRACT=0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2
```

### Production URLs (After Deployment)
- **Frontend**: https://bitart-market.vercel.app (example)
- **Backend API**: https://bitart-market-api.onrender.com (example)

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:**
- Setting up Render for backend
- Configuring Vercel for frontend
- Environment variable management
- Monitoring and maintenance
- Alternative hosting options

## 🔧 Troubleshooting

### Common Issues

**1. Wallet Won't Connect**
- Ensure MetaMask/Coinbase Wallet is installed
- Check you're on the correct network (Base Mainnet)
- Clear browser cache and reload
- Try switching to Base manually in wallet settings

**2. Transaction Fails**
- Verify sufficient ETH balance for gas fees
- Check contract addresses in environment variables
- Ensure wallet is connected to Base Mainnet (Chain ID: 8453)
- Review BaseScan for transaction details

**3. NFT Images Not Loading**
- Check Pinata JWT token is valid
- Verify IPFS gateway is accessible
- Ensure image URLs use `https://` protocol
- Try alternative IPFS gateways (ipfs.io, cloudflare-ipfs.com)

**4. API Returns 500 Error**
- Check backend environment variables
- Verify Base RPC URL is responding
- Review backend logs for specific errors
- Ensure database/cache is running

**5. Dark Mode Issues**
- Clear localStorage: `localStorage.clear()`
- Check theme toggle component
- Verify Tailwind dark mode configuration

**6. Charts Not Displaying**
- Check royalty service is returning data
- Verify API endpoints are accessible
- Review browser console for JavaScript errors
- Ensure data arrays are not empty

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/bitart-market/issues)
- **Documentation**: Check [docs/](./docs) folder for detailed guides
- **Community**: Join our Discord for support

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🔗 Resources

- **[Base Documentation](https://docs.base.org/)** - Base blockchain guides and references
- **[BaseScan](https://basescan.org/)** - Base blockchain explorer
- **[Coinbase Wallet](https://www.coinbase.com/wallet)** - Recommended wallet for Base
- **[Stacks Documentation](https://docs.stacks.co/)** - Stacks blockchain guides
- **[Clarity Language](https://clarity-lang.org/)** - Smart contract language
- **[ethers.js](https://docs.ethers.org/)** - Ethereum JavaScript library
- **[IPFS](https://ipfs.io/)** - Decentralized storage protocol
- **[Pinata](https://pinata.cloud/)** - IPFS pinning service

## 📈 Project Stats

- **15+ API Endpoints** across 6 service categories
- **3 Smart Contracts** deployed on Base Mainnet
- **10+ React Components** with dark mode support
- **7-Day Development Roadmap** completed
- **Production-Ready** with full error handling
- [Pinata](https://www.pinata.cloud/)

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Join the [Stacks Discord](https://discord.com/invite/stacks)
- Check the [documentation](./docs/)

---

**Built with ❤️ for the Stacks community**
