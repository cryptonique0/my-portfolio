# BaseChess - On-Chain Chess Game Platform

A decentralized chess gaming platform built on Base with blockchain integration, AI-powered move suggestions, and smart contract-based wagering.

## Overview

BaseChess is a comprehensive chess gaming ecosystem that combines traditional chess gameplay with Web3 capabilities. Players can compete in on-chain chess games with wager support, train with AI-powered coaching, solve tactical puzzles, and participate in tournaments—all while leveraging blockchain technology for transparency and trustless transactions.

**Built with:** Next.js, React, TypeScript, Solidity, Viem, Wagmi, OnchainKit, Genkit AI, and Hardhat

## Features

### Core Gameplay
- **On-Chain Chess Games**: Play chess with full move validation on the blockchain
- **Wager System**: Support for in-game wagering and rewards
- **Real-Time Multiplayer**: Play against other users with live game state synchronization
- **AI Opponent**: Play against Gemini AI-powered chess engine for single-player mode
- **Move Validation**: Complete chess rule enforcement including castling, en passant, and promotion

### Learning & Development
- **Chess Puzzles**: Solve tactical puzzles with difficulty levels
- **AI-Powered Coaching**: Get real-time move suggestions and strategic analysis
- **Learning Dashboard**: Track progress, skill levels, and achievements
- **Coach Marketplace**: Browse and book professional chess coaches
- **Training Modes**: Specialized training for different chess strategies

### Social & Community
- **Leaderboards**: Daily, weekly, and all-time rankings
- **Player Profiles**: View detailed player statistics and match history
- **Game History**: Complete match records with move annotations
- **Tournament System**: Organized tournaments with brackets and rankings

## Prerequisites

Before getting started, ensure you have:

- **Node.js** 18+ and npm/yarn installed
- **Git** for version control
- **Base chain** understanding (L2 blockchain on Ethereum)
- **MetaMask** or compatible Web3 wallet (for mainnet deployment)
- **Coinbase Developer Platform** account for API keys (optional, for advanced features)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd base_chess
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Farcaster & OnchainKit
NEXT_PUBLIC_PROJECT_NAME="BaseChess"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<your-cdp-api-key>
NEXT_PUBLIC_URL=http://localhost:3000

# Blockchain (Optional)
NEXT_PUBLIC_CHAIN_ID=8453  # Base mainnet

# AI Configuration (Gemini API)
GENKIT_API_KEY=<your-genkit-api-key>
NEXT_PUBLIC_GENKIT_ENABLED=true

# Contract Addresses (after deployment)
NEXT_PUBLIC_CHESS_CONTRACT_ADDRESS=<deployed-contract-address>
```

Copy `.example.env` for reference:

```bash
cp .example.env .env.local
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app auto-reloads on code changes.

## Smart Contract Development

### Compile Contracts

```bash
npm run compile
```

### Deploy to Base Sepolia (Testnet)

```bash
npm run deploy:baseSepolia
```

### Deploy to Base Mainnet

```bash
npm run deploy:base
```

### Run Contract Tests

```bash
npm run test
```

### Start Local Hardhat Node

```bash
npm run node
```

## AI Integration

### Start Genkit Development Server

```bash
npm run genkit:dev
```

The Genkit server provides AI-powered chess analysis and move suggestions using Google's Generative AI.

### Production Genkit Server

```bash
npm run genkit
```

## Project Structure
```
app/                   # Next.js application
├── components/        # React components
│   ├── ChessBoard.tsx
│   ├── GameControls.tsx
│   ├── GameInfo.tsx
│   ├── MoveHistory.tsx
│   └── ...
├── (pages)/          # Page routes
│   ├── play/         # Main game interface
│   ├── puzzles/      # Puzzle training
│   ├── training/     # Learning dashboard
│   ├── coaches/      # Coach marketplace
│   └── ...
├── api/              # API routes
│   ├── ai-move/      # AI move generation endpoint
│   └── auth/         # Authentication
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── styles/           # CSS modules and global styles

contracts/           # Solidity smart contracts
├── Chess.sol         # Core chess game logic
├── ChessAcademy.sol  # Learning/coaching contracts
├── ChessCoach.sol    # Coach marketplace
├── ChessPuzzles.sol  # Puzzle system
└── ChessFactory.sol  # Factory pattern implementation

scripts/             # Deployment and utility scripts
├── deploy.js        # Main deployment script
└── deployAdvanced.js

test/                # Smart contract tests
└── Chess.test.js

public/              # Static assets
genkit.config.ts     # Genkit AI configuration
minikit.config.ts    # Farcaster Mini App configuration
hardhat.config.js    # Hardhat network configuration
next.config.ts       # Next.js configuration
tsconfig.json        # TypeScript configuration
```

## Deployment

### Production Deployment to Vercel

#### 1. Prepare for Deployment

```bash
npm run build
```

#### 2. Deploy to Vercel

```bash
vercel --prod
```

You'll get a deployment URL: `https://your-project-name.vercel.app/`

#### 3. Update Environment Variables in Vercel

Go to Vercel dashboard and add production environment variables:

```bash
NEXT_PUBLIC_PROJECT_NAME=BaseChess
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<your-production-api-key>
NEXT_PUBLIC_URL=https://your-project-name.vercel.app
NEXT_PUBLIC_CHAIN_ID=8453
GENKIT_API_KEY=<your-genkit-api-key>
NEXT_PUBLIC_CHESS_CONTRACT_ADDRESS=<mainnet-contract-address>
```

### Smart Contract Deployment to Base Mainnet

#### 1. Create Deployer Wallet

Set up a wallet with Base ETH for gas fees.

#### 2. Configure Private Key

Add to `.env.local`:

```bash
PRIVATE_KEY=<your-private-key>
```

#### 3. Deploy

```bash
npm run deploy:base
```

#### 4. Verify Contract (Optional)

```bash
hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Development Workflow

### Local Development

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Genkit AI server (optional)
npm run genkit:dev

# Terminal 3: Hardhat node (for local contract testing)
npm run node
```

### Testing

```bash
# Run all smart contract tests
npm run test

# Run tests with coverage
npx hardhat coverage
```

### Linting & Code Quality

```bash
npm run lint
```

## API Endpoints

### AI Move Generation

**POST** `/api/ai-move`

Generate AI-suggested chess moves using Gemini AI.

**Request:**
```json
{
  "position": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 2
}
```

**Response:**
```json
{
  "move": "e2e4",
  "evaluation": 0.5,
  "analysis": "Strong opening move, controls center"
}
```

## Tech Stack

### Frontend
- **Next.js 15.3.8** - React framework with server components
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Viem** - Ethereum Web3 library
- **Wagmi** - React hooks for Web3
- **OnchainKit** - Coinbase Web3 SDK
- **TanStack Query** - Data fetching and caching

### Backend & Blockchain
- **Solidity** - Smart contracts
- **Hardhat** - Ethereum development environment
- **Base Chain** - Ethereum L2 scaling solution

### AI & ML
- **Genkit** - Google's generative AI framework
- **Google Generative AI** - Gemini AI models
- **OpenAI API** (optional alternative)

### Tools & Utilities
- **ESLint** - Code quality and linting
- **Prettier** - Code formatting
- **Zod** - Runtime type validation

## Smart Contracts Overview

### Chess.sol
Core chess game engine with:
- Complete move validation
- Game state management
- Wager and reward system
- Game history tracking

### ChessAcademy.sol
Learning platform features:
- Skill level tracking
- Achievement system
- Progress tracking
- Leaderboard management

### ChessCoach.sol
Coach marketplace:
- Coach registration and profiles
- Booking and scheduling
- Payment handling
- Review system

### ChessPuzzles.sol
Puzzle system:
- Puzzle creation and curation
- Difficulty levels
- Solution tracking
- Achievement rewards

## Configuration Files

### `minikit.config.ts`
Farcaster Mini App configuration with manifest, frame settings, and metadata.

### `genkit.config.ts`
Genkit AI configuration for Gemini model integration and API setup.

### `hardhat.config.js`
Network configuration for Base Sepolia and Base Mainnet deployment.

### `next.config.ts`
Next.js optimization settings and webpack configuration.

## Common Tasks

### Deploy to New Network

Edit `hardhat.config.js` to add network configuration, then:

```bash
hardhat run scripts/deploy.js --network <network-name>
```

### Generate New Puzzle

Create puzzle data and upload to ChessPuzzles contract:

```bash
node scripts/createPuzzle.js
```

### View Contract State

```bash
npm run genkit:dev
# Then use Genkit UI to query contract state
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Contract Deployment Fails

- Ensure wallet has sufficient gas (Base ETH)
- Check network configuration in `hardhat.config.js`
- Verify `PRIVATE_KEY` in `.env.local`

### AI Moves Not Generating

- Check Genkit server is running: `npm run genkit:dev`
- Verify `GENKIT_API_KEY` is set
- Check API rate limits

### Wallet Connection Issues

- Ensure MetaMask is installed and configured
- Verify correct network is selected (Base Sepolia/Mainnet)
- Clear browser cache and cookies

## Security Considerations

- **Private Keys**: Never commit `.env.local` or private keys
- **API Keys**: Keep API keys confidential and rotate regularly
- **Smart Contracts**: Audit contracts before mainnet deployment
- **User Funds**: Implement proper access controls for wager system
- **Data Validation**: Always validate move legality on-chain

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Resources

### Documentation
- [Base Documentation](https://docs.base.org)
- [Farcaster Mini Apps](https://docs.farcaster.xyz/developers/mini-apps)
- [OnchainKit Documentation](https://onchainkit.xyz)
- [Solidity Documentation](https://docs.soliditylang.org)
- [Hardhat Documentation](https://hardhat.org/docs)

### Learning
- [Ethereum Development](https://ethereum.org/developers)
- [Chess Rules & Notation](https://www.chess.com/terms/chess-rules)
- [Web3 Development Guide](https://web3.foundation)

### Tools
- [Base Sepolia Faucet](https://docs.base.org/docs/tutorials/hardhat-local-testnet)
- [Hardhat Documentation](https://hardhat.org)
- [MetaMask](https://metamask.io)

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an [Issue](../../issues) on GitHub
- Reach out on [Farcaster](https://farcaster.xyz/)
- Check [Base Discord Community](https://discord.gg/base)

---

## Disclaimer

This is an educational and demonstration project. Always:
- Conduct thorough security audits before mainnet deployment
- Test extensively on testnet (Base Sepolia) first
- Never deploy with real funds until confident
- Comply with all applicable laws and regulations
- Verify all smart contract code before interaction

**BaseChess** is not affiliated with professional chess organizations or platforms. Use responsibly and at your own risk.
