# On-Chain Resume Platform

A multi-chain decentralized professional profile platform for creating, verifying, and showcasing credentials across **Base** (EVM) and **Stacks** (Bitcoin L2).

## Features

### Core Features ✅
- **Multi-Chain Support**: Deploy profiles on Base Mainnet, Base Sepolia, Stacks Mainnet, and Stacks Testnet
- **Web3 Integration**: Connect wallet via Wagmi (EVM) with support for MetaMask, Injected, and WalletConnect
- **Verified Credentials**: Store tamper-proof credentials on-chain with verification system
- **Profile Handles**: Claim your unique username and build a public profile
- **Reputation System**: Automatic reputation scoring based on profile completeness and community engagement

### Phase 2 Features ✅
- **IPFS Resume Storage**: Structured resume JSON stored on IPFS with Pinata pinning
- **Animated Resume Timeline**: Vertical timeline with category grouping and credential verification highlights
- **Credential Verification**: Multi-signature verification system for credentials
- **Leaderboard System**: Paginated ranking view sorted by reputation score

### Phase 3 Features ✅ NEW
- **NFT Achievement Badges**: ERC1155 multi-token badges with reputation-based unlocking
- **Badge Tiers**: 9 badge levels from Verified Professional to Hall of Fame (0-10,000 reputation)
- **Batch Minting**: Gas-efficient batch operations for awarding multiple badges
- **Badge UI Library**: Complete component library with gallery, showcase, and detail views
- **Responsive Design**: Mobile-first UI with dark theme and glass-morphism effects

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Web3**: Wagmi 1.4.0, Viem 1.21.0, @wagmi/connectors
- **Smart Contracts**: Solidity (Base) + Clarity (Stacks), Hardhat
- **Blockchain**: Base (Coinbase L2), Stacks (Bitcoin L2)
- **Storage**: IPFS
- **Database**: On-chain (smart contracts)

## 🚀 Public Launch (Phase 3) - Ready for Deployment

**Status**: ✅ Complete | **Version**: 0.2.0 | **Delivery**: 4,300+ lines

### Quick Start Guide

🚀 **For Developers**: Start with [BADGE_QUICK_REFERENCE.md](BADGE_QUICK_REFERENCE.md) (5-min setup)  
📋 **For Deployment**: Follow [PHASE_3_CHECKLIST.md](PHASE_3_CHECKLIST.md) (step-by-step)  
📚 **For Complete Docs**: Read [BADGE_SYSTEM.md](BADGE_SYSTEM.md) (600+ lines)  
🎯 **For Integration**: See [ProfileWithBadges.tsx](src/components/ProfileWithBadges.tsx) (real examples)

### What's New in Phase 3

**NFT Achievement Badges System** 🏅
- ERC1155 multi-token badges linked to reputation milestones
- 9 badge tiers from Verified Professional (0 rep) to Hall of Fame (10,000 rep)
- Automatic badge minting on reputation thresholds
- Full UI component library with Framer Motion animations
- Batch minting for gas efficiency (~30% savings)

**Documentation & Resources**
- [PUBLIC_LAUNCH_GUIDE.md](PUBLIC_LAUNCH_GUIDE.md) - Comprehensive launch guide
  - Gas optimization techniques and cost breakdown
  - Security audit checklist and best practices
  - Development roadmap (v0.2.0 → v2.0+)
  - Contribution guidelines and development workflow
  
- [BADGE_SYSTEM.md](BADGE_SYSTEM.md) - Complete badge system documentation
  - Smart contract architecture and API reference
  - Frontend integration guide with code examples
  - Testing and deployment instructions
  - Badge tier progression system

- [FEATURE_IMPLEMENTATION.md](FEATURE_IMPLEMENTATION.md) - Phase 2 feature guide
  - IPFS resume storage system
  - Animated resume timeline
  - Credential verification system
  - Leaderboard ranking system

### Gas Efficiency

Optimized contract design ensures affordable transactions:

| Operation | Gas Cost | Est. Cost (Base) |
|-----------|----------|------------------|
| Create Profile | 45,000 | ~$0.018 |
| Add Credential | 32,000 | ~$0.013 |
| Unlock Achievement | 28,000 | ~$0.011 |
| Mint Single Badge | 35,000 | ~$0.014 |
| Batch Mint (10 badges) | 120,000 | ~$0.048 |
| Verify Credential | 24,000 | ~$0.010 |

See [PUBLIC_LAUNCH_GUIDE.md](PUBLIC_LAUNCH_GUIDE.md#gas-optimization) for detailed optimization strategies.

### Security & Audits

✅ Contract security features:
- OpenZeppelin battle-tested standards (ERC721, ERC1155, Ownable)
- Reentrancy protection
- Access control with admin/minter roles
- Pause/unpause circuit breaker
- Integer overflow protection (Solidity 0.8+)
- Supply tracking and limits

⚠️ Pre-deployment checklist: See [PUBLIC_LAUNCH_GUIDE.md](PUBLIC_LAUNCH_GUIDE.md#security-considerations)

### Roadmap

**Current: v0.2.0** (Phase 3 Complete) ✅
- ✅ IPFS Resume Storage
- ✅ Animated Timeline
- ✅ Credential Verification
- ✅ Leaderboard System
- ✅ NFT Achievement Badges (ERC1155)
- ✅ Badge UI Components
- ✅ Reputation-based Unlocking
- ✅ Comprehensive Documentation

**Upcoming: v0.3.0** (Phase 4) 🔄
- 🔄 ENS/Lens Integration
- 🔄 Governance Token ($RESUME)
- 🔄 Community DAO
- 🔄 Mobile App (React Native)
- 🔄 AI-powered Recommendations

See full roadmap in [PUBLIC_LAUNCH_GUIDE.md](PUBLIC_LAUNCH_GUIDE.md#roadmap-updates).

### Contributing

We welcome contributions! See [CONTRIBUTING.md](PUBLIC_LAUNCH_GUIDE.md#contribution-guidelines) for:
- Code of conduct
- Development workflow
- Testing requirements
- Documentation standards
- Pull request process

## Smart Contracts

### OnChainResume.sol (EVM - Base)
Complete contract with profile, credential, and achievement management.

**Features:**
- Profile creation with IPFS hash for resume
- Credential verification with multi-signature support
- Achievement unlocking with automatic reputation updates
- Top profiles ranking by reputation score
- Handle-based user lookup

**Core Functions:**
- `createProfile(handle, ipfsHash)` - Create a verified profile
- `updateProfile(ipfsHash)` - Update profile content
- `addCredential(type, issuer, issuedDate, expiryDate, proofUrl)` - Add verified credential
- `unlockAchievement(title, description)` - Unlock achievement badge
- `verifyCredential(user, credentialIndex)` - Verify a credential
- `getProfile(address)` - Get profile data
- `getCredentials(address)` - Get all credentials
- `getAchievements(address)` - Get all achievements
- `getReputation(address)` - Get reputation score
- `getTopProfiles(limit)` - Get top profiles by reputation
- `getUserByHandle(handle)` - Lookup user by handle

### AchievementBadges.sol (EVM - Base) 🆕
ERC1155 NFT badge contract for achievement recognition.

**Features:**
- ERC1155 multi-token standard for gas efficiency
- Reputation-based badge requirements
- Batch minting capability
- Supply tracking and limits
- Admin controls (pause/unpause, deactivation)
- Integration with OnChainResume for reputation verification

**Core Functions:**
- `createBadge(id, name, description, requiredRep, maxSupply, imageURI)` - Create badge type
- `mintBadge(to, badgeId, amount, data)` - Mint badge to user
- `mintBadgesBatch(recipients, badgeIds, amounts)` - Batch mint badges
- `getBadgeMetadata(badgeId)` - Get badge details
- `getUserBadges(user)` - Get user's badges
- `hasBadge(user, badgeId)` - Check badge ownership
- `setRequiredReputation(badgeId, newRep)` - Update requirements

**Gas Costs:**
- Single Mint: ~35,000 gas (~$0.014)
- Batch Mint (10): ~120,000 gas (~$0.048)
- Transfer: ~1,500 gas (~$0.001)

See [BADGE_SYSTEM.md](BADGE_SYSTEM.md) for complete API reference.

### OnChainResume.clar (Stacks - Bitcoin L2)
Clarity smart contract for Stacks blockchain deployment with equivalent functionality.

## Supported Networks

### EVM Chains (Wagmi + Viem)

| Network | Chain ID | Currency | Status | Explorer |
|---------|----------|----------|--------|----------|
| **Base Mainnet** | 8453 | ETH | 🟢 Production | [BaseScan](https://basescan.org) |
| **Base Sepolia** | 84532 | ETH | 🟡 Testnet | [BaseScan Sepolia](https://sepolia.basescan.org) |
| **Ethereum Mainnet** | 1 | ETH | 🟢 Production | [Etherscan](https://etherscan.io) |
| **Ethereum Sepolia** | 11155111 | ETH | 🟡 Testnet | [Etherscan Sepolia](https://sepolia.etherscan.io) |

### Stacks Chains (Bitcoin L2)

| Network | Type | Currency | Status | Explorer |
|---------|------|----------|--------|----------|
| **Stacks Mainnet** | Bitcoin L2 | STX | 🟢 Production | [Stacks Explorer](https://explorer.stacks.co) |
| **Stacks Testnet** | Bitcoin L2 | STX | 🟡 Testnet | [Testnet Explorer](https://testnet-explorer.stacks.co) |

## Deployed Contract Addresses

See [CONTRACT_ADDRESS.md](CONTRACT_ADDRESS.md) for latest deployment information.

### Base Mainnet
- **Chain ID**: 8453
- **Status**: ✅ Live
- **Deploy**: `npm run deploy:base-mainnet`

### Base Sepolia (Testnet)
- **Chain ID**: 84532
- **Status**: ✅ Live
- **Deploy**: `npm run deploy:base-sepolia`

### Stacks Mainnet
- **Type**: Bitcoin L2
- **Status**: Ready for deployment
- **Deploy**: `npm run deploy:base+stacks`

### Stacks Testnet
- **Type**: Bitcoin L2
- **Status**: Ready for deployment
- **Deploy**: `npm run deploy:stacks-testnet`

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A wallet with ETH for gas fees (or test tokens from faucet)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cryptonique0/talent-resume-wt.git
cd talent-resume-wt
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Wallet (for deployment)
PRIVATE_KEY=your_wallet_private_key_here

# Web3 Connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Contract Addresses (auto-populated after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=base
NEXT_PUBLIC_CHAIN_ID=8453

# Verification (optional)
BASESCAN_API_KEY=your_basescan_api_key

# IPFS (optional, uses Pinata by default)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud
```

### Compilation

Compile the smart contracts:
```bash
npm run compile
```

### Deployment

#### Deploy to Base Mainnet (Production)
```bash
npm run deploy:base-mainnet
```

#### Deploy to Base Sepolia (Testnet)
```bash
npm run deploy:base-sepolia
```

#### Deploy to Stacks (via wrapper script)
```bash
npm run deploy:base+stacks
```

#### Deploy to Stacks Testnet Only
```bash
npm run deploy:stacks-testnet
```

The deployment script will:
1. Compile the contracts
2. Deploy to the selected network(s)
3. Save deployment info to `deployments/` directory
4. Update `.env.local` with the contract address

### Development

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

Build the Next.js app:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
├── contracts/
│   ├── OnChainResume.sol           # EVM contract (Base)
│   ├── AchievementBadges.sol       # ERC1155 badge contract 🆕
│   └── OnChainResume.clar          # Stacks contract (Bitcoin L2)
├── scripts/
│   ├── deploy.js                   # Base deployment script
│   ├── deploy-badges.js            # Badge contract deployment 🆕
│   └── deploy-base-mainnet-stacks-testnet.js
├── src/
│   ├── app/
│   │   ├── page.tsx                # Home page
│   │   ├── layout.tsx              # Root layout with Wagmi provider
│   │   ├── providers.tsx           # Web3 providers setup
│   │   ├── top-nav.tsx             # Navigation header
│   │   ├── dashboard/page.tsx       # User dashboard
│   │   ├── profile/
│   │   │   ├── create/page.tsx      # Create profile page
│   │   │   └── [handle]/page.tsx    # View profile page
│   │   ├── credentials/page.tsx     # Manage credentials
│   │   ├── achievements/page.tsx    # View achievements & badges
│   │   └── api/
│   │       ├── ipfs/               # IPFS storage endpoints
│   │       │   ├── upload/         # Resume upload to IPFS
│   │       │   ├── fetch/          # Fetch resume from IPFS
│   │       │   └── pin/            # Pinata management
│   │       ├── credentials/        # Credential endpoints
│   │       │   └── verify/         # Credential verification
│   │       ├── leaderboard/        # Leaderboard endpoints
│   │       └── talent/             # Talent Protocol API routes
│   ├── components/
│   │   ├── WalletConnectButton.tsx  # Wallet connection component
│   │   ├── ChainSelector.tsx        # Multi-chain selector
│   │   ├── AchievementBadges.tsx    # Badge components
│   │   ├── AchievementBadgesNFT.tsx # NFT achievement display
│   │   ├── BadgeDisplay.tsx         # Badge UI library 🆕
│   │   ├── ProfileWithBadges.tsx    # Profile integration 🆕
│   │   ├── AnimatedTimeline.tsx     # Timeline with grouping & verification
│   │   ├── Leaderboard.tsx          # Top profiles leaderboard
│   │   ├── ResumeUploadComponent.tsx # Resume builder & IPFS uploader
│   │   ├── NetworkStatusBanner.tsx  # Network status display
│   │   └── ...
│   ├── hooks/
│   │   ├── useIPFSResume.ts         # IPFS upload, verification, leaderboard
│   │   ├── useBadges.ts             # Badge operations & state 🆕
│   │   ├── useContractProfile.ts    # Contract profile interactions
│   │   ├── useWalletSession.ts      # Wallet session management
│   │   └── ...
│   ├── lib/
│   │   ├── contract.ts             # Contract ABI & address
│   │   ├── web3-config.ts          # Wagmi + chain configuration
│   │   ├── chain-utils.ts          # Multi-chain utilities
│   │   ├── features.ts             # Achievement & reputation definitions
│   │   ├── ipfs.ts                 # IPFS client & utilities
│   │   ├── stacks-config.ts        # Stacks/Bitcoin L2 config
│   │   ├── talent-protocol.ts      # Talent Protocol API client
│   │   └── wallet.ts               # Wallet utilities
│   ├── styles/
│   │   └── globals.css             # Global styles & animations
│   └── providers/                   # React context providers
├── .env.example                     # Environment template
├── .env.local                       # Your config (git ignored)
├── hardhat.config.js               # Hardhat configuration
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── package.json                    # Dependencies
├── FEATURE_IMPLEMENTATION.md        # Feature implementation guide
└── README.md                       # This file
```

## API Routes

### IPFS Storage
- `POST /api/ipfs/upload` - Upload resume JSON to IPFS with Pinata pinning
- `GET /api/ipfs/fetch/[hash]` - Fetch resume from IPFS (multiple gateways)
- `POST /api/ipfs/pin` - Pin existing content to Pinata

### Credential Management
- `POST /api/credentials/verify` - Verify a credential (multi-signature support)
- `GET /api/credentials/verify` - Check credential verification status

### Badge Management 🆕
- `GET /api/badges/all` - List all available badge types
- `GET /api/badges/user/[address]` - Get user's earned badges
- `POST /api/badges/mint` - Mint single badge (admin/automated)
- `POST /api/badges/batch-mint` - Batch mint badges for gas efficiency
- `POST /api/badges/burn` - Burn badge
- `POST /api/badges/create` - Create new badge type (admin)
- `PUT /api/badges/[id]/update` - Update badge metadata (admin)
- `POST /api/badges/[id]/deactivate` - Deactivate badge (admin)

### Leaderboard & Rankings
- `GET /api/leaderboard` - Fetch top profiles by reputation
- `GET /api/leaderboard?page=1&limit=10&sortBy=reputation` - Paginated leaderboard
- `GET /api/leaderboard?sortBy=achievements` - Sort by achievements instead

### Talent Protocol
- `GET /api/talent/profile/[handle]` - Fetch user profile
- `GET /api/talent/achievements/[handle]` - Fetch achievements
- `GET /api/talent/credentials/[handle]` - Fetch credentials

## Environment Variables

### Required (for deployment)
- `PRIVATE_KEY` - Your wallet private key (for contract deployment only)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect](https://cloud.walletconnect.com)

### Recommended
- `BASESCAN_API_KEY` - Get from [BaseScan](https://basescan.org/apis) for contract verification
- `NEXT_PUBLIC_IPFS_GATEWAY` - IPFS gateway URL (defaults to Pinata gateway)

### Auto-Generated (after deployment)
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed contract address
- `NEXT_PUBLIC_NETWORK` - Active network nameImprove test coverage:
- Add contract unit tests for edge cases
- Add frontend integration tests
- Ensure Base Sepolia compatibility


## Wallet Support

### EVM Chains
- **MetaMask** - Full support
- **Injected** - Any EIP-6902 compatible wallet
- **WalletConnect** - Multi-wallet support

### Stacks (Bitcoin L2)
- **Hiro Wallet** - Primary Stacks wallet
- **Xverse** - Bitcoin + Stacks support
- **Leather** - Stacks support

## Testing

### Network Faucets
- **Base Sepolia**: [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- **Ethereum Sepolia**: [Alchemy Faucet](https://sepoliafaucet.com)
- **Stacks Testnet**: Use the Stacks web wallet built-in faucet

### Test with Local Hardhat
```bash
npm run deploy:local
npm run dev
```
This will deploy to a local hardhat instance for testing without using real funds.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

## Security Notes

⚠️ **Important**: 
- **Never commit `.env.local`** - It contains your private key
- **Never share your private key** - It controls all your funds
- **Test on testnet first** - Always deploy to Base Sepolia or Stacks Testnet before mainnet
- **Verify contracts** - Use BaseScan API key to verify contract source code after deployment

## License

This project is licensed under the MIT License - see LICENSE for details.

## Support & Resources

- **GitHub Issues**: [Create an issue](https://github.com/cryptonique0/talent-resume-wt/issues)
- **Deployment Docs**: See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup steps
- **Contract Info**: See [CONTRACT_ADDRESS.md](CONTRACT_ADDRESS.md) for deployed addresses

### External Resources
- [Base Documentation](https://docs.base.org)
- [Stacks Documentation](https://docs.stacks.co)
- [Wagmi Documentation](https://wagmi.sh)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

## Roadmap

### Current (v0.1.0)
- ✅ Multi-chain contract architecture (Base + Stacks)
- ✅ Web3 wallet integration (Wagmi)
- ✅ Profile creation and management
- ✅ Credential verification system
- ✅ Achievement badge system
- ✅ Reputation scoring
- ✅ Dashboard UI components

### Completed (v0.2.0) ✅
- ✅ NFT achievement badges (ERC1155)
- ✅ Badge minting system
- ✅ Leaderboard filtering and sorting
- ✅ Enhanced IPFS resume storage
- ✅ Comprehensive documentation (2,300+ lines)
- ✅ Badge UI component library

### In Progress (v0.3.0) 🔄
- [ ] Profile search and discovery
- [ ] Social sharing with verification links
- [ ] Credential issuer verification
- [ ] ENS/Lens Protocol integration

#### Profile & Identity
- [ ] Skill endorsements from other users
- [ ] Work experience verification via employer signatures
- [ ] Education credentials from verified institutions
- [ ] Professional certifications (AWS, Google, etc.)
- [ ] Profile privacy controls (public/private fields)
- [ ] Custom profile themes/templates
- [ ] Portfolio showcase (link projects, GitHub repos)

#### Social & Networking
- [ ] Follow system for users
- [ ] Profile recommendations based on skills
- [ ] Referral system with rewards

#### Technical Improvements
- [ ] Multi-signature credential verification (require 2+ verifiers)
- [ ] Credential expiry notifications
- [ ] Profile activity feed
- [ ] Real-time notifications (new credential, badge unlocked)

### Future (v0.3.0)
- [ ] ENS/Lens Protocol integration
- [ ] Governance token ($RESUME)
- [ ] DAO for profile verification
- [ ] Mobile app
- [ ] AI-powered profile recommendations
- [ ] Cross-chain profile aggregation

#### Social & Community
- [ ] Direct messaging between verified profiles
- [ ] Job posting board for employers
- [ ] Community forums by industry/skill

#### Monetization & Value
- [ ] Premium profiles with additional features
- [ ] Pay-to-verify for high-trust credentials
- [ ] Sponsored badge programs
- [ ] Profile analytics (who viewed, skill trends)
- [ ] Resume export as PDF/JSON
- [ ] API access for recruiters

#### Advanced Features
- [ ] ZK Proofs for privacy-preserving verification
- [ ] Soulbound tokens for non-transferable credentials
- [ ] DID integration (Decentralized Identifiers)
- [ ] On-chain resume templates with customization
- [ ] Reputation decay (inactive profiles lose score over time)
- [ ] Cross-chain credential bridging
- [ ] Token-gated communities based on achievements
- [ ] Profile NFTs as unique identifiers
- [ ] Webhooks for profile updates
- [ ] GraphQL API for better querying

### Long-term Vision (v0.4.0+)
- [ ] AI resume optimization suggestions
- [ ] Skill gap analysis vs. job requirements
- [ ] Automated credential verification via APIs (LinkedIn, GitHub)
- [ ] Decentralized recruitment marketplace
- [ ] Resume versioning with diff tracking
- [ ] Multi-language support
- [ ] Video profile introductions (stored on IPFS)
- [ ] Professional network graph visualization

---

**Repository**: [cryptonique0/talent-resume-wt](https://github.com/cryptonique0/talent-resume-wt)  
**Status**: 🚀 Phase 3 Complete - Ready for Deployment  
**Version**: v0.2.0  
**Last Updated**: January 5, 2026

## 📚 Documentation Resources

- **Quick Start**: [BADGE_QUICK_REFERENCE.md](BADGE_QUICK_REFERENCE.md) - 5-minute setup guide
- **Complete Guide**: [BADGE_SYSTEM.md](BADGE_SYSTEM.md) - 600+ line comprehensive documentation
- **Deployment**: [PHASE_3_CHECKLIST.md](PHASE_3_CHECKLIST.md) - Step-by-step deployment tasks
- **Launch Prep**: [PUBLIC_LAUNCH_GUIDE.md](PUBLIC_LAUNCH_GUIDE.md) - Gas, security, roadmap
- **Project Status**: [DELIVERY_SUMMARY.md](DELIVERY_SUMMARY.md) - What was delivered
- **All Docs**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Complete documentation index
