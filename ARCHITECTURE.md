# Multi-Chain Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                                  │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │ Chain Selector │  │ Achievement    │  │ Reputation     │                 │
│  │ Component      │  │ Badges Comp.   │  │ Level Display  │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                 │
└──────────────────────────────┬────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────────────────┐
│                    CONFIGURATION LAYER                                        │
│                                                                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐         │
│  │ web3-config.ts  │  │ stacks-config.ts │  │ chain-utils.ts     │         │
│  │ (6 networks)    │  │ (STX setup)      │  │ (detection/switch) │         │
│  └─────────────────┘  └──────────────────┘  └────────────────────┘         │
│                                                                              │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐         │
│  │ features.ts                 │  │ multi-chain-contract.ts      │         │
│  │ (10 achievements, 6 levels) │  │ (cross-chain interactions)   │         │
│  └─────────────────────────────┘  └──────────────────────────────┘         │
└──────────────────┬──────────────────────────────────┬───────────────────────┘
                   │                                  │
        ┌──────────▼──────────┐            ┌─────────▼────────────┐
        │ EVM Chains Layer    │            │ Stacks (Bitcoin L2)  │
        └──────────┬──────────┘            └─────────┬────────────┘
                   │                                  │
    ┌──────────────┼──────────────────┐              │
    │              │                  │              │
┌───▼──┐      ┌────▼────┐        ┌────▼────┐        │
│ Base │      │ Ethereum│        │ Sepolia │        │
│ 8453 │      │    1    │        │ 11155111        │
└───┬──┘      └────┬────┘        └────┬────┘        │
    │              │                  │              │
    │         ┌────▼──────────────────▼─┐           │
    │         │                          │           │
    │    ┌────▼──────────────────────┐  │           │
    │    │ OnChainResumeEnhanced.sol │  │           │
    │    │ - ERC-721 NFTs           │  │           │
    │    │ - Multi-chain tracking   │  │           │
    │    │ - Reputation tokens      │  │           │
    │    │ - Verifier system        │  │           │
    │    │ - Badge redemption       │  │           │
    │    └────────┬──────────────────┘  │           │
    │             │                     │           │
    └─────────────┴─────────────────────┘           │
                  │                                  │
                  │              ┌───────────────────▼──┐
                  │              │  OnChainResume.clar  │
                  │              │  - Clarity contract  │
                  │              │  - Bitcoin L2        │
                  │              │  - STX tokens        │
                  │              │  - Profiles          │
                  │              │  - Achievements      │
                  │              └───────────┬──────────┘
                  │                          │
                  │         ┌────────────────┼────────────────┐
                  │         │                │                │
            ┌─────▼──┐  ┌───▼────┐      ┌───▼────┐          │
            │ Base   │  │ Ethereum       │ Stacks │          │
            │Sepolia │  │ Sepolia        │Testnet │          │
            │ 84532  │  │ 11155111       │2147..  │          │
            └────────┘  └────────┘       └────────┘          │
                                                              │
                                    ┌─────────────────────────▼────┐
                                    │ Off-Chain Services           │
                                    │ - IPFS (profile storage)     │
                                    │ - Index/Query (subgraph)     │
                                    │ - Analytics                  │
                                    └──────────────────────────────┘
```

---

## Data Flow Diagram

```
USER CREATES PROFILE
        │
        ▼
┌─────────────────────────────────────────┐
│ ChainSelector determines target network │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │  EVM or Stacks? │
        └────────┬────────┘
        ┌────────┴────────┐
        │                 │
    ┌───▼────┐        ┌───▼────────┐
    │  EVM   │        │   Stacks   │
    └───┬────┘        └───┬────────┘
        │                 │
    ┌───▼──────────────┐  │
    │ useContractWrite │  │
    │ with wagmi       │  │
    └───┬──────────────┘  │
        │                 │
    ┌───▼──────────────┐  │   ┌──────────────────┐
    │ Tx to contract   │  │   │ Stacks auth &    │
    │ createProfile()  │  │   │ transactions     │
    │                  │  │   │ library          │
    └───┬──────────────┘  │   └──────────┬───────┘
        │                 │              │
        │         ┌───────▼──────────────▼───┐
        │         │ Upload Profile to IPFS   │
        │         │ Get IPFS hash            │
        │         └───────┬──────────────────┘
        │                 │
        │         ┌───────▼──────────────┐
        │         │ Update contract with │
        │         │ IPFS hash            │
        │         └───────┬──────────────┘
        │                 │
        └─────────┬───────┘
                  │
         ┌────────▼────────────┐
         │ Profile Deployed!   │
         │ User can now:       │
         │ - Add credentials   │
         │ - Unlock badges     │
         │ - Deploy to chains  │
         │ - Earn reputation   │
         └─────────────────────┘
```

---

## Achievement Unlock Flow

```
USER PERFORMS ACTION
        │
        ├─────────────────┬──────────────┬─────────────┐
        │                 │              │             │
    ┌───▼────┐        ┌───▼────┐    ┌───▼────┐   ┌───▼───┐
    │ Adds   │        │ Gets   │    │Deploys │   │Earns  │
    │Cred.   │        │Verified│    │ to     │   │tokens │
    │        │        │        │    │ chain  │   │       │
    └───┬────┘        └───┬────┘    └───┬────┘   └───┬───┘
        │                 │              │             │
        ▼                 ▼              ▼             ▼
    ┌────────────────────────────────────────────────────┐
    │ checkAchievementEligibility()                      │
    │ Validates user stats against achievement rules    │
    └────────────┬─────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │ Eligible?       │
        └────────┬────────┘
        ┌────────┴────────┐
        │                 │
    ┌───▼────┐        ┌───▼────┐
    │  YES   │        │   NO   │
    └───┬────┘        └────────┘
        │
    ┌───▼──────────────────────────┐
    │ unlockAchievement()           │
    │ - Award points               │
    │ - Update reputation          │
    │ - Mint NFT badge (optional)  │
    └───┬──────────────────────────┘
        │
    ┌───▼─────────────────┐
    │ ACHIEVEMENT UNLOCKED│
    │ NFT Minted (if set) │
    │ Points awarded      │
    │ Reputation updated  │
    └─────────────────────┘
```

---

## Cross-Chain Profile Sync

```
MULTI-CHAIN DEPLOYMENT REQUEST
        │
        ▼
┌──────────────────────────────┐
│ Get user's deployed chains   │
│ Get profile data from IPFS   │
└────────┬─────────────────────┘
         │
         ▼
    ┌─────────────────────┐
    │ For each new chain: │
    └────────┬────────────┘
             │
    ┌────────▼──────────────────┐
    │ deployToChain()            │
    │ - Record deployment        │
    │ - Award bonus reputation   │
    │ - Check multi-chain badge  │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────┐
    │ User now on 3+ chains?     │
    │ If YES:                    │
    │ - Unlock Chain Explorer    │
    │ - Award Diamond badge NFT  │
    │ - Extra reputation points  │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ SYNC COMPLETE                  │
    │ Profile now on multiple chains │
    │ Reputation aggregated          │
    └────────────────────────────────┘
```

---

## Reputation Aggregation

```
GET AGGREGATED REPUTATION
        │
        ▼
┌────────────────────────────────┐
│ useMultiChainContract()         │
│ getAggregatedReputation()       │
└────────┬───────────────────────┘
         │
    ┌────┴────┬────────┬─────────┬──────────┬──────────┐
    │ Base    │ Base   │Ethereum │Ethereum  │ Stacks  │
    │Mainnet  │Sepolia │Mainnet  │ Sepolia  │ Mainnet │
    │ 8453    │ 84532  │   1     │ 11155111 │    0    │
    └────┬────┴────┬───┴──┬──────┴──┬───────┴──┬──────┘
         │         │     │         │          │
    ┌────▼────┬────▼──┐  │     ┌───▼──┐       │
    │ Score:  │Score: │  │     │Score:│       │
    │  250    │  150  │  │     │ 300  │       │
    └────┬────┴────┬──┘  │     └───┬──┘       │
         │         │     │         │          │
         │    ┌────▼─────▼─────────▼──────────▼────┐
         │    │ Sum all scores across chains      │
         │    │ Total = 250 + 150 + 300 + ... = 700
         │    └────┬──────────────────────────────┘
         │         │
         │    ┌────▼───────────────────────────┐
         │    │ Find Reputation Level          │
         │    │ 700 = Journeyman level         │
         │    └────┬───────────────────────────┘
         │         │
         └─────────▼────────────────────────────┐
                   │ Return aggregated data:    │
                   │ - Total reputation: 700    │
                   │ - Current level: Journeyman│
                   │ - Breakdown by chain       │
                   │ - Benefits unlocked        │
                   └────────────────────────────┘
```

---

## Smart Contract Interaction Flow

```
EVM SIDE (Base, Ethereum)
┌────────────────────────────────────────┐
│ OnChainResumeEnhanced.sol              │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ createProfile()                  │   │
│ │ - Create profile struct          │   │
│ │ - Record chain deployment        │   │
│ │ - Award initial reputation       │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ deployToChain()                  │   │
│ │ - Add chain to deployment list   │   │
│ │ - Increase reputation            │   │
│ │ - Check badge eligibility        │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ addCredential()                  │   │
│ │ - Store credential details       │   │
│ │ - Initialize verification count  │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ verifyCredential()               │   │
│ │ - Increment verification count   │   │
│ │ - Mark as verified (2+ verifies) │   │
│ │ - Reward verifier & user         │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ mintAchievementNFT()             │   │
│ │ - Create ERC-721 token           │   │
│ │ - Store metadata URI             │   │
│ │ - Track NFT ownership            │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ registerAsVerifier()             │   │
│ │ - Create verifier profile        │   │
│ │ - Track verification count       │   │
│ │ - Award verifier status          │   │
│ └──────────────────────────────────┘   │
└────────────────────────────────────────┘

STACKS SIDE (Bitcoin L2)
┌────────────────────────────────────────┐
│ OnChainResume.clar                     │
│ (Clarity Smart Contract)               │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ (create-profile)                 │   │
│ │ - Store profile on Bitcoin       │   │
│ │ - Native STX integration         │   │
│ │ - Secure by Bitcoin consensus    │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ (add-credential)                 │   │
│ │ - Store on Stacks blockchain     │   │
│ │ - Bitcoin-settled transactions   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ (verify-credential)              │   │
│ │ - Secure verification on Bitcoin │   │
│ │ - Immutable record               │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ (register-as-verifier)           │   │
│ │ - Verifier registry on Bitcoin   │   │
│ └──────────────────────────────────┘   │
└────────────────────────────────────────┘
```

---

## Technology Stack

```
Frontend Layer
├── React 18
├── Next.js 14
├── TypeScript
├── Tailwind CSS
└── Wagmi (Web3)

Web3 Layer
├── Wagmi (EVM interactions)
├── Viem (Ethereum client)
├── Ethers.js (contract interaction)
├── Web3Modal (wallet connection)
├── @stacks/auth (Stacks auth)
├── @stacks/transactions (Stacks tx)
└── @stacks/network (Stacks network)

Storage Layer
├── IPFS (profile storage)
├── On-chain state (smart contracts)
└── Event logs (contract events)

Smart Contract Layer
├── Solidity (EVM)
├── OpenZeppelin (ERC standards)
├── Clarity (Stacks)
└── Hardhat (development)

Infrastructure
├── Base RPC
├── Ethereum RPC
├── Stacks RPC
├── Block Explorers
└── Wallet Integration
```

---

## Achievement Badge Progression

```
┌─────────────────────────────────────────────────────────┐
│                  ACHIEVEMENT BADGES                      │
│                                                          │
│  TIER 1 - BRONZE (Entry Level)                         │
│  ├─ 🏗️  Profile Architect - Complete profile           │
│  └─ 🎓  First Step - Add first credential              │
│                                                          │
│  TIER 2 - SILVER (Intermediate)                        │
│  ├─ 📚  Credential Collector - 5+ credentials          │
│  ├─ 🤝  Community Builder - Verify others              │
│  ├─ 🦋  Social Butterfly - 50+ connections            │
│                                                          │
│  TIER 3 - GOLD (Advanced)                              │
│  ├─ ✨  Verified Expert - Expert verification          │
│  └─ 🎯  Skill Master - 5 skills mastered               │
│                                                          │
│  TIER 4 - PLATINUM (Elite)                             │
│  ├─ 👑  Reputation Legend - 1000+ reputation           │
│  └─ 🚀  Pioneer - Early adopter                        │
│                                                          │
│  TIER 5 - DIAMOND (Legendary)                          │
│  └─ 🗺️  Chain Explorer - Deploy to 3+ chains          │
│                                                          │
│  RARITY LEVELS:                                        │
│  Common → Uncommon → Rare → Epic → Legendary           │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides a robust, scalable foundation for a multi-chain Web3 resume platform with cross-chain capabilities, achievement tracking, and reputation management.
