# Quick Start Guide - Multi-Chain Web3 Resume

## 🚀 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

Fill in the required variables:
```env
# Wallet
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io

# API Keys
BASESCAN_API_KEY=your_key
ETHERSCAN_API_KEY=your_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract Addresses (add after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### 3. Compile Contracts
```bash
npm run compile
```

## 🧪 Testing on Testnet

### Deploy to Base Sepolia
```bash
npm run deploy:base-sepolia
```

### Deploy to Ethereum Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Get Test Funds
- **Base Sepolia**: https://faucet.circle.com/
- **Ethereum Sepolia**: https://www.sepoliafaucet.com/

## 📦 Production Deployment

### Deploy to Base Mainnet
```bash
npm run deploy:base
```

### Deploy to Ethereum Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### Deploy to Stacks
```bash
# Use Clarity IDE or CLI
# Update NEXT_PUBLIC_STACKS_RESUME_CONTRACT in .env.local
```

## 🔗 Supported Chains

| Chain | Network | Status | RPC URL |
|-------|---------|--------|---------|
| Base | Mainnet | ✅ Active | https://mainnet.base.org |
| Base | Sepolia | ✅ Testnet | https://sepolia.base.org |
| Ethereum | Mainnet | ✅ Active | https://eth.llamarpc.com |
| Ethereum | Sepolia | ✅ Testnet | https://eth-sepolia.public.blastapi.io |
| Stacks | Mainnet | ✅ Active | https://mainnet.stacks.co:20443 |
| Stacks | Testnet | ✅ Testnet | https://testnet-api.stacks.co |

## 🎯 Key Features Implemented

### 1. Multi-Chain Support
- Deploy to Base, Ethereum, and Stacks
- Automatic chain detection
- Seamless chain switching

### 2. Achievement System
- 10+ achievement types
- NFT badge minting
- Tiered rarity system
- Auto-validation

### 3. Reputation System
- 6 progression levels
- Point-based advancement
- Cross-chain aggregation
- Level benefits

### 4. Verifier System
- Register as expert
- Earn verification rewards
- Track credentials verified
- Build reputation

### 5. NFT Integration
- ERC-721 achievement badges
- Metadata on IPFS
- Chainable achievements
- Tradeable badges

## 📚 File References

### Configuration Files
- `src/lib/web3-config.ts` - Chain configuration
- `src/lib/stacks-config.ts` - Stacks setup
- `src/lib/chain-utils.ts` - Chain utilities
- `src/lib/features.ts` - Achievement definitions
- `src/lib/multi-chain-contract.ts` - Contract interaction

### Smart Contracts
- `contracts/OnChainResumeEnhanced.sol` - EVM contract
- `contracts/OnChainResume.clar` - Stacks contract

### Components
- `src/components/ChainSelector.tsx` - Chain switching UI
- `src/components/AchievementBadges.tsx` - Badge display

### Documentation
- `MULTICHAIN_INTEGRATION_GUIDE.md` - Complete guide
- `IMPLEMENTATION_SUMMARY.md` - What was built

## 🔧 Common Tasks

### Create a Profile
```typescript
import { useContractWrite } from 'wagmi';

const { write } = useContractWrite({
  functionName: 'createProfile',
});

write({
  args: ['myhandle', 'QmIPFSHash', 8453]
});
```

### Deploy to New Chain
```typescript
const { write } = useContractWrite({
  functionName: 'deployToChain',
});

write({
  args: [8453, 'Base Mainnet']
});
```

### Check Multi-Chain Reputation
```typescript
import { useMultiChainContract } from '@/lib/multi-chain-contract';

const { getAggregatedReputation } = useMultiChainContract(abi, contracts);
const reputation = await getAggregatedReputation(userAddress);
```

### Register as Verifier
```typescript
const { write } = useContractWrite({
  functionName: 'registerAsVerifier',
});

write({
  args: ['Dr. John Doe', 'Blockchain Development']
});
```

## 🐛 Troubleshooting

### Chain Switching Not Working
- Ensure wallet supports the chain
- Check RPC URL is accessible
- Verify chain ID in configuration

### Contract Deployment Failed
- Check gas settings
- Verify private key has funds
- Check RPC URL connectivity

### Stacks Integration Issues
- Ensure Hiro/Xverse wallet is connected
- Check contract addresses format (SP... vs ST...)
- Verify sufficient STX for fees

## 📊 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Compile contracts
npm run compile

# Deploy to Base Mainnet
npm run deploy:base

# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Deploy to Ethereum Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to local hardhat
npm run deploy:local
```

## 🔐 Security Considerations

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use testnet first** - Test on sepolia before mainnet
3. **Verify contracts** - Verify on block explorers
4. **Audit smart contracts** - Have contracts reviewed
5. **Test thoroughly** - Test all chain combinations

## 📈 Next Steps

1. **Deploy to testnet** - Test with real networks
2. **Create frontend UI** - Build user interface
3. **Integrate IPFS** - Store profiles on IPFS
4. **Add analytics** - Track user engagement
5. **Community launch** - Promote to users

## 🆘 Support

- **Documentation**: See `MULTICHAIN_INTEGRATION_GUIDE.md`
- **Block Explorers**:
  - Base: https://basescan.org/
  - Ethereum: https://etherscan.io/
  - Stacks: https://explorer.stacks.co/

- **Communities**:
  - Base Discord: https://discord.gg/buildonbase
  - Stacks Discord: https://discord.gg/stacks
  - Ethereum Discord: https://discord.gg/ethereum

## 📝 License

MIT License - See LICENSE file for details
