# On-Chain Resume Platform

A multi-chain decentralized professional profile platform for creating, verifying, and showcasing credentials across **Base** (EVM) and **Stacks** (Bitcoin L2).

## Features

- **Multi-Chain Support**: Deploy profiles on Base Mainnet, Base Sepolia, Stacks Mainnet, and Stacks Testnet
- **Web3 Integration**: Connect wallet via Wagmi (EVM) with support for MetaMask, Injected, and WalletConnect
- **Verified Credentials**: Store tamper-proof credentials on-chain with verification system
- **Achievement Badges**: Earn and mint NFT badges as you build your profile
- **Reputation System**: Automatic reputation scoring based on profile completeness and community engagement
- **IPFS Storage**: Decentralized content storage for resumes and documents
- **Profile Handles**: Claim your unique username and build a public profile
- **Leaderboard**: Track top profiles by reputation across chains
- **Animated Timeline**: Display professional history with smooth animations
- **Responsive Design**: Mobile-first UI with dark theme and glass-morphism effects

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Web3**: Wagmi 1.4.0, Viem 1.21.0, @wagmi/connectors
- **Smart Contracts**: Solidity (Base) + Clarity (Stacks), Hardhat
- **Blockchain**: Base (Coinbase L2), Stacks (Bitcoin L2)
- **Storage**: IPFS
- **Database**: On-chain (smart contracts)

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
│   └── OnChainResume.clar          # Stacks contract (Bitcoin L2)
├── scripts/
│   ├── deploy.js                   # Base deployment script
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
│   │       ├── ipfs/               # IPFS upload/fetch endpoints
│   │       └── talent/             # Talent Protocol API routes
│   ├── components/
│   │   ├── WalletConnectButton.tsx  # Wallet connection component
│   │   ├── ChainSelector.tsx        # Multi-chain selector
│   │   ├── AchievementBadges.tsx    # Badge components
│   │   ├── AchievementBadgesNFT.tsx # NFT achievement display
│   │   ├── AnimatedTimeline.tsx     # Timeline with animations
│   │   └── Leaderboard.tsx          # Top profiles leaderboard
│   ├── lib/
│   │   ├── contract.ts             # Contract ABI & address
│   │   ├── web3-config.ts          # Wagmi + chain configuration
│   │   ├── chain-utils.ts          # Multi-chain utilities
│   │   ├── features.ts             # Achievement & reputation definitions
│   │   ├── stacks-config.ts        # Stacks/Bitcoin L2 config
│   │   ├── ipfs.ts                 # IPFS client & utilities
│   │   ├── talent-protocol.ts      # Talent Protocol API client
│   │   └── wallet.ts               # Wallet utilities
│   ├── styles/
│   │   └── globals.css             # Global styles & animations
│   └── providers/                   # React context providers (if used)
├── .env.example                     # Environment template
├── .env.local                       # Your config (git ignored)
├── hardhat.config.js               # Hardhat configuration
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## API Routes

### Talent Protocol
- `GET /api/talent/profile/[handle]` - Fetch user profile
- `GET /api/talent/achievements/[handle]` - Fetch achievements
- `GET /api/talent/credentials/[handle]` - Fetch credentials

### IPFS
- `POST /api/ipfs/upload` - Upload resume to IPFS
- `GET /api/ipfs/fetch/[hash]` - Fetch resume from IPFS

## Environment Variables

### Required (for deployment)
- `PRIVATE_KEY` - Your wallet private key (for contract deployment only)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect](https://cloud.walletconnect.com)

### Recommended
- `BASESCAN_API_KEY` - Get from [BaseScan](https://basescan.org/apis) for contract verification
- `NEXT_PUBLIC_IPFS_GATEWAY` - IPFS gateway URL (defaults to Pinata gateway)

### Auto-Generated (after deployment)
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed contract address
- `NEXT_PUBLIC_NETWORK` - Active network name
- `NEXT_PUBLIC_CHAIN_ID` - Active chain ID

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

### Planned (v0.2.0)
- [ ] NFT achievement badges minting
- [ ] Leaderboard filtering and sorting
- [ ] Profile search and discovery
- [ ] Social sharing with verification links
- [ ] Enhanced IPFS resume storage
- [ ] Credential issuer verification

### Future (v0.3.0+)
- [ ] ENS/Lens Protocol integration
- [ ] Governance token ($RESUME)
- [ ] DAO for profile verification
- [ ] Mobile app
- [ ] AI-powered profile recommendations
- [ ] Cross-chain profile aggregation

---

**Repository**: [cryptonique0/talent-resume-wt](https://github.com/cryptonique0/talent-resume-wt)  
**Status**: 🚀 In Active Development  
**Last Updated**: January 2026
