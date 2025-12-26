# On-Chain Resume / CV Platform

A decentralized professional profile platform where users connect their wallet and display verified accomplishments.

## Features

- **Web3 Integration**: Connect wallet via wagmi and Web3Modal
- **Base Mainnet Support**: Deploy and interact with smart contracts on Base (Coinbase's Layer 2)
- **Talent Protocol**: Pull reputation, achievements, and credentials
- **IPFS Storage**: Decentralized storage for user-generated content
- **Animated Timeline**: Display professional history with animations
- **Verified Credentials**: Tamper-proof resumes for freelancers, students, and job seekers
- **Smart Contract**: On-chain profile management with reputation scoring

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: Wagmi, Web3Modal, Viem
- **Blockchain**: Solidity, Hardhat, Base Mainnet
- **Storage**: IPFS
- **Animations**: Framer Motion

## Smart Contract

### Contract Features
- Create and manage professional profiles
- Store credentials with verification
- Track achievements and reputation scores
- Top profiles ranking by reputation
- Profile verification system

### Deployed Contract Addresses

#### Base Mainnet (Production)
```
Address: [To be deployed]
Chain ID: 8453
Explorer: https://basescan.org
```

#### Base Sepolia (Testnet)
```
Address: [To be deployed]
Chain ID: 84532
Explorer: https://sepolia.basescan.org
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A wallet with ETH for gas fees (or testnet ETH for Sepolia)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cryptonique0/my-portfolio.git
cd my-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `PRIVATE_KEY`: Your wallet private key (for deployment only)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Get from [WalletConnect](https://cloud.walletconnect.com)
- `BASESCAN_API_KEY`: Get from [BaseScan](https://basescan.org/apis)

### Compilation

Compile the smart contract:
```bash
npm run compile
```

### Deployment

Deploy to Base Mainnet:
```bash
npm run deploy:base
```

Deploy to Base Sepolia (testnet):
```bash
npm run deploy:base-sepolia
```

Deploy to local hardhat network:
```bash
npm run deploy:local
```

The deployment script will:
1. Compile the contract
2. Deploy to the selected network
3. Save deployment info to `deployments/` directory
4. Update `.env.local` with contract address and network info

### Development

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building

Build for production:
```bash
npm build
```

Start production server:
```bash
npm start
```

## Environment Variables

See `.env.example` for all available options.

### Required Variables
- `NEXT_PUBLIC_TALENT_PROTOCOL_API`: Talent Protocol API key
- `PRIVATE_KEY`: Wallet private key for contract deployment
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID

### Optional Variables
- `BASESCAN_API_KEY`: For contract verification
- `NEXT_PUBLIC_IPFS_GATEWAY`: IPFS gateway URL (defaults to Pinata)

## Project Structure

```
├── contracts/              # Solidity smart contracts
│   └── OnChainResume.sol  # Main contract
├── scripts/               # Deployment scripts
│   └── deploy.js         # Hardhat deployment script
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   │   ├── ipfs/    # IPFS endpoints
│   │   │   └── talent/  # Talent Protocol endpoints
│   │   └── ...
│   ├── components/       # React components
│   ├── lib/
│   │   ├── contract.ts   # Contract ABI & address
│   │   ├── ipfs.ts       # IPFS utilities
│   │   ├── talent-protocol.ts  # Talent Protocol client
│   │   ├── wallet.ts     # Wallet utilities
│   │   └── web3-config.ts  # Wagmi configuration
│   ├── providers/        # React providers
│   └── styles/          # Global styles
├── hardhat.config.js    # Hardhat configuration
├── next.config.js       # Next.js configuration
└── package.json
```

## API Routes

### Talent Protocol
- `GET /api/talent/profile/[handle]` - Fetch user profile
- `GET /api/talent/achievements/[handle]` - Fetch achievements
- `GET /api/talent/credentials/[handle]` - Fetch credentials

### IPFS
- `POST /api/ipfs/upload` - Upload resume to IPFS
- `GET /api/ipfs/fetch/[hash]` - Fetch resume from IPFS

## Smart Contract Functions

### User Functions
- `createProfile(handle, ipfsHash)` - Create profile
- `updateProfile(ipfsHash)` - Update profile
- `addCredential(type, issuer, issuedDate, expiryDate, proofUrl)` - Add credential
- `unlockAchievement(title, description)` - Unlock achievement

### View Functions
- `getProfile(address)` - Get user profile
- `getCredentials(address)` - Get user credentials
- `getAchievements(address)` - Get user achievements
- `getReputation(address)` - Get reputation score
- `getTopProfiles(limit)` - Get top profiles by reputation
- `getUserByHandle(handle)` - Get user address by handle

## Supported Networks

- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia** (Chain ID: 84532)
- **Ethereum Mainnet** (Chain ID: 1)
- **Ethereum Sepolia** (Chain ID: 11155111)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -am 'Add feature'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE for details.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/cryptonique0/my-portfolio/issues)
- Email: [Your email]

## Roadmap

- [ ] ENS/Lens integration
- [ ] NFT achievement badges
- [ ] Governance token ($RESUME)
- [ ] DAO for profile verification
- [ ] Multi-signature contract upgrades
- [ ] Mobile app

