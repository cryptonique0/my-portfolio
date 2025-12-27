# Multi-Chain Web3 Resume Integration Guide

## Overview

This project integrates multiple blockchain networks including **Base**, **Ethereum**, and **Stacks (Bitcoin L2)** to create a decentralized, cross-chain resume platform with achievement badges, reputation tokens, and NFT credentials.

## Supported Chains

### EVM Networks
- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia Testnet** (Chain ID: 84532)
- **Ethereum Mainnet** (Chain ID: 1)
- **Sepolia Testnet** (Chain ID: 11155111)

### Stacks (Bitcoin L2)
- **Stacks Mainnet** (Chain ID: 0)
- **Stacks Testnet** (Chain ID: 2147483648)

## Key Features

### 1. Multi-Chain Profile Management
- Deploy your resume to multiple blockchains simultaneously
- Automatic profile synchronization across chains
- Track deployed chains and earn rewards for multi-chain deployment

### 2. Achievement Badge System
- **10+ Achievement Types**:
  - Profile Architect (complete profile)
  - First Step (first credential)
  - Credential Collector (5+ credentials)
  - Verified Expert (expert verification)
  - Community Builder (contribute verifications)
  - Reputation Legend (1000+ score)
  - Skill Master (5 skills mastered)
  - Social Butterfly (50+ connections)
  - Pioneer (early adopter)
  - Multi-Chain Explorer (3+ chains)

- **Badge Tiers**: Bronze → Silver → Gold → Platinum → Diamond
- **NFT Minting**: Achievements are minted as ERC-721 NFTs
- **Rarity System**: Common → Uncommon → Rare → Epic → Legendary

### 3. Reputation System
- **6 Reputation Levels**:
  - Novice (0-99)
  - Apprentice (100-249)
  - Journeyman (250-499)
  - Expert (500-999)
  - Master (1000-4999)
  - Legend (5000+)

- **Benefits per Level**:
  - Novice: Basic visibility
  - Apprentice: Profile enhancement, verification
  - Journeyman: Mentor features
  - Expert: Leadership roles
  - Master: Governance participation
  - Legend: DAO voting, revenue sharing

### 4. Reputation Tokens
- **RRep Token** (EVM Chains): Resume Reputation on EVM networks
- **SRep Token** (Stacks): Resume Reputation on Stacks network
- Earned through:
  - Profile creation (50 tokens)
  - Credential verification (100 tokens)
  - Community contributions
  - Achievement unlocks

### 5. Verifier System
- Register as a verified expert
- Earn rewards for credential verification
- Build verifier reputation
- Track verification stats

## Configuration Files

### `/src/lib/web3-config.ts`
Main web3 configuration with support for EVM chains:
```typescript
// Access chain networks
import { NETWORKS, ChainType, EVM_NETWORKS, STACKS_NETWORKS } from '@/lib/web3-config';

// Get network by type
const baseNetwork = NETWORKS.BASE_MAINNET;
const stacksNetwork = NETWORKS.STACKS_MAINNET;
```

### `/src/lib/stacks-config.ts`
Stacks-specific configuration for Bitcoin L2:
```typescript
import {
  getStacksNetwork,
  getStacksContracts,
  STACKS_CONSTANTS,
  STACKS_FEATURES,
} from '@/lib/stacks-config';

// Get Stacks network configuration
const network = getStacksNetwork(false); // mainnet
const contracts = getStacksContracts(false);
```

### `/src/lib/chain-utils.ts`
Utilities for chain detection and switching:
```typescript
import {
  useChainDetection,
  useStacksChain,
  getChainInfo,
  getExplorerUrl,
  isStacksAddress,
  isEvmAddress,
} from '@/lib/chain-utils';
```

### `/src/lib/features.ts`
Achievement badges, reputation tiers, and feature definitions:
```typescript
import {
  ACHIEVEMENT_BADGES,
  REPUTATION_TIERS,
  REPUTATION_TOKENS,
  checkAchievementEligibility,
  generateAchievementNFTMetadata,
} from '@/lib/features';
```

### `/src/lib/multi-chain-contract.ts`
Cross-chain contract interaction layer:
```typescript
import {
  useMultiChainContract,
  stacksContractCalls,
  MultiChainContractManager,
} from '@/lib/multi-chain-contract';
```

## Smart Contracts

### EVM Contract: `OnChainResumeEnhanced.sol`
Features:
- ERC-721 NFT achievement badges
- Multi-chain profile tracking
- Reputation token integration
- Verifier registration and management
- Badge tiers (bronze-diamond)
- Cross-chain deployment tracking

**Key Functions**:
```solidity
// Profile Management
createProfile(string handle, string ipfsHash, uint256 chainId)
deployToChain(uint256 chainId, string chainName)
updateProfile(string ipfsHash)
getProfile(address user)
getDeployedChains(address user)

// Credentials
addCredential(string credentialType, string issuer, ...)
verifyCredential(address user, uint256 credentialIndex)
getCredentials(address user)

// Achievements & NFTs
unlockAchievement(string title, string description, string type, uint256 points)
mintAchievementNFT(address user, string type, string metadataUri)
redeemBadge(string badgeType)
getUserNFTs(address user)

// Reputation
getReputation(address user)
updateReputation(address user, uint256 score)

// Verifiers
registerAsVerifier(string name, string specialty)
getVerifierInfo(address verifier)

// Admin
setReputationToken(address tokenAddress)
createBadge(string badgeType, string name, ...)
```

### Stacks Contract: `OnChainResume.clar`
Features:
- Bitcoin L2 compatibility
- Native STX token integration
- Profile management on Stacks
- Credential tracking
- Achievement system
- Verifier registry

**Key Functions**:
```clarity
;; Profile Management
(create-profile (handle (string-ascii 50)) (ipfs-hash (string-ascii 100)))
(update-profile (ipfs-hash (string-ascii 100)))
(get-profile (user principal))
(get-user-by-handle (handle (string-ascii 50)))

;; Credentials
(add-credential (credential-type ...) (issuer ...) ...)
(verify-credential (user principal) (credential-id uint))
(get-credential (user principal) (credential-id uint))

;; Achievements
(unlock-achievement (title ...) (description ...) ...)
(get-achievement (user principal) (achievement-id uint))

;; Verifiers
(register-as-verifier (name ...) (specialty ...))
(get-verifier-info (verifier principal))

;; Reputation
(get-reputation (user principal))
(update-reputation (user principal) (new-score uint))

;; Helpers
(get-user-count)
(get-total-credentials)
(is-handle-available (handle ...))
```

## Hardhat Configuration

Updated `hardhat.config.js` supports:
- Base Mainnet & Sepolia
- Ethereum Mainnet & Sepolia
- Stacks Mainnet & Testnet
- Local Hardhat network
- Localhost testing

### Deploy Commands
```bash
# Deploy to Base Mainnet
npm run deploy:base

# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Deploy to Ethereum Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Stacks
npx hardhat run scripts/deploy.js --network stacks-mainnet
```

## Environment Variables

Create a `.env.local` file:

```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
MAINNET_RPC_URL=https://eth.llamarpc.com
STACKS_MAINNET_RPC_URL=https://mainnet.stacks.co:20443
STACKS_TESTNET_RPC_URL=https://testnet-api.stacks.co

# API Keys
BASESCAN_API_KEY=your_basescan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Web3Modal
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # EVM
NEXT_PUBLIC_STACKS_RESUME_CONTRACT=SP... # Stacks Mainnet
NEXT_PUBLIC_STACKS_ACHIEVEMENT_NFT=SP... # Stacks Mainnet
NEXT_PUBLIC_STACKS_VERIFIER=SP... # Stacks Mainnet

# Stacks Testnet Contracts
NEXT_PUBLIC_STACKS_RESUME_CONTRACT_TESTNET=ST...
NEXT_PUBLIC_STACKS_ACHIEVEMENT_NFT_TESTNET=ST...
NEXT_PUBLIC_STACKS_VERIFIER_TESTNET=ST...

# IPFS
NEXT_PUBLIC_IPFS_API_URL=https://api.pinata.cloud/pinning/pinFileToIPFS
IPFS_API_KEY=your_ipfs_key
IPFS_API_SECRET=your_ipfs_secret

# Optional: Gas reporter
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_coinmarketcap_key
```

## Usage Examples

### 1. Create Multi-Chain Profile

```typescript
import { useContractWrite } from 'wagmi';
import { useChainDetection } from '@/lib/chain-utils';

export function CreateProfileForm() {
  const { currentChain } = useChainDetection();
  const { write: createProfile } = useContractWrite({
    address: contractAddress,
    abi: OnChainResumeEnhanced,
    functionName: 'createProfile',
  });

  const handleCreate = (handle: string, ipfsHash: string) => {
    createProfile({
      args: [handle, ipfsHash, currentChain?.id || 8453],
    });
  };

  return (
    <button onClick={() => handleCreate('myhandle', 'QmXxxx')}>
      Create Profile
    </button>
  );
}
```

### 2. Deploy to Additional Chain

```typescript
export function DeployToChain() {
  const { write: deployToChain } = useContractWrite({
    functionName: 'deployToChain',
  });

  const handleDeploy = (chainId: number) => {
    deployToChain({
      args: [chainId, 'Base Mainnet'],
    });
  };

  return (
    <button onClick={() => handleDeploy(8453)}>
      Deploy to Base
    </button>
  );
}
```

### 3. Check Multi-Chain Reputation

```typescript
import { useMultiChainContract } from '@/lib/multi-chain-contract';

export function ReputationDashboard() {
  const { getAggregatedReputation } = useMultiChainContract(abi, stacksContracts);
  const [reputation, setReputation] = useState(null);

  const fetchReputation = async (userAddress: string) => {
    const data = await getAggregatedReputation(userAddress);
    setReputation(data);
  };

  return (
    <div>
      <h2>Total Reputation: {reputation?.totalReputation}</h2>
      <ul>
        {Object.entries(reputation?.byChain || {}).map(([chainId, score]) => (
          <li key={chainId}>Chain {chainId}: {score}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. Mint Achievement NFT

```typescript
export function MintAchievement() {
  const { write: mintNFT } = useContractWrite({
    functionName: 'mintAchievementNFT',
  });

  const handleMint = (userAddress: string) => {
    mintNFT({
      args: [userAddress, 'verified_expert', 'ipfs://Qm...'],
    });
  };

  return (
    <button onClick={() => handleMint(userAddress)}>
      Mint Expert Badge
    </button>
  );
}
```

### 5. Register as Verifier

```typescript
export function RegisterVerifier() {
  const { write: register } = useContractWrite({
    functionName: 'registerAsVerifier',
  });

  const handleRegister = () => {
    register({
      args: ['Dr. John Doe', 'Blockchain Development'],
    });
  };

  return (
    <button onClick={handleRegister}>
      Register as Verifier
    </button>
  );
}
```

## Architecture

```
src/lib/
├── web3-config.ts              # Chain configs (EVM + Stacks)
├── stacks-config.ts            # Stacks-specific setup
├── chain-utils.ts              # Chain detection & switching
├── features.ts                 # Achievement & reputation systems
├── multi-chain-contract.ts     # Cross-chain interactions
├── contract.ts                 # EVM contract ABIs
├── wallet.ts                   # Wallet utilities
├── ipfs.ts                     # IPFS integration
└── talent-protocol.ts          # Talent protocol integration

contracts/
├── OnChainResume.sol           # Original EVM contract
├── OnChainResumeEnhanced.sol   # Enhanced EVM with NFTs
└── OnChainResume.clar          # Stacks Clarity contract
```

## Next Steps

1. **Deploy Contracts**:
   - Deploy `OnChainResumeEnhanced.sol` to Base Mainnet
   - Deploy reputation tokens to EVM chains
   - Deploy `OnChainResume.clar` to Stacks network

2. **Frontend Components**:
   - Create chain selector UI
   - Build profile dashboard with chain indicators
   - Implement achievement showcase
   - Add reputation tier badges

3. **IPFS Integration**:
   - Upload profiles to IPFS
   - Store achievement metadata
   - Cache profile data

4. **Testing**:
   - Test multi-chain profile sync
   - Verify cross-chain reputation aggregation
   - Test Stacks contract interactions
   - Load testing for concurrent users

5. **Security Audit**:
   - Review smart contracts
   - Test edge cases
   - Verify authorization checks

## Troubleshooting

### Chain Switching Issues
- Ensure wallet supports the target chain
- Check RPC URL is valid
- Verify chain ID matches network configuration

### Stacks Contract Calls
- Use Hiro Wallet, Xverse, or Leather for signing
- Ensure sufficient STX for transaction fees
- Check contract address in correct format (SP... for mainnet, ST... for testnet)

### Multi-Chain Sync Problems
- Verify all contract addresses are deployed
- Check network connectivity
- Ensure sufficient gas on each chain

## References

- [Base Documentation](https://docs.base.org/)
- [Stacks Documentation](https://docs.stacks.co/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Clarity Smart Contracts](https://docs.stacks.co/clarity)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
