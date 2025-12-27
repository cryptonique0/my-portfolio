# 🎯 Complete Deployment Instructions

## Your Plan: Base Mainnet + Stacks Testnet

You want to deploy:
- ✅ **Base Mainnet** (Production) - EVM smart contract
- ✅ **Stacks Testnet** (Testing) - Clarity smart contract

This is the perfect setup for production + testing!

---

## PHASE 1: Preparation (10 minutes)

### Step 1: Install Dependencies

```bash
cd /home/web3joker/talent-resume-wt
npm install
```

Expected output:
```
added 300+ packages
```

### Step 2: Configure Environment

```bash
# Copy template
cp .env.local.example .env.local

# Edit with your values
nano .env.local
```

**Minimum required values:**

```env
PRIVATE_KEY=your_private_key_without_0x_prefix

# Base Mainnet
BASE_RPC_URL=https://mainnet.base.org

# Stacks Testnet  
STACKS_TESTNET_RPC_URL=https://testnet-api.stacks.co

# Block Explorer APIs (get from Basescan.org)
BASESCAN_API_KEY=your_api_key_here
```

**💡 Getting your private key:**
- From MetaMask: Settings → Account Details → Export Private Key
- ⚠️ Keep this secret! Never commit to git

### Step 3: Verify Setup

```bash
npm run compile
```

Expected output:
```
✓ 27 contracts compiled successfully
```

If you see errors, check that Solidity is properly installed.

---

## PHASE 2: Fund Your Wallets (5-15 minutes)

### For Base Mainnet Deployment

You need **real ETH** on Base mainnet:

**Option A: Bridge from Ethereum (if you have ETH)**
1. Go to: https://bridge.base.org/
2. Connect wallet
3. Deposit ETH amount (0.01-0.05 ETH minimum)
4. Confirm bridge transaction
5. Wait 1-5 minutes for funds to appear

**Option B: Get ETH from an exchange**
1. Buy ETH on Coinbase, Kraken, etc.
2. Withdraw to Base mainnet directly (some exchanges support this)
3. Minimum: 0.01 ETH

**Option C: Use faucet (limited funds)**
- Alchemy faucet: https://www.alchemy.com/faucets/base
- Get small amount of Base ETH

### For Stacks Testnet Deployment

You need **testnet STX** (free!):

1. Get your wallet address from MetaMask (it shows as 0x...)
2. Go to: https://faucet.testnet.stacks.co/
3. Paste your address
4. Click "Request STX"
5. Wait 1-2 minutes
6. Check balance on: https://testnet-api.stacks.co/v2/accounts/{address}

---

## PHASE 3: Deploy to Base Mainnet (5 minutes)

### Execute Deployment

```bash
npm run deploy:base-mainnet
```

**During deployment, you'll see:**

```
============================================================
🚀 DEPLOYING TO BASE MAINNET
============================================================

📝 Deployer Address: 0x1234...
⛓️  Network: Base Mainnet (Chain ID: 8453)
⛽ Current Gas Price: 0.52 Gwei
💰 Account Balance: 0.045 ETH

📦 Deploying OnChainResumeEnhanced...
✅ Contract deployed to: 0x9876543210987654321098765432109876543210

🎖️  Initializing Achievement Badges...
  ✓ Created badge: Profile Architect
  ✓ Created badge: First Step
  ✓ Created badge: Credential Collector
  ✓ Created badge: Verified Expert
  ✓ Created badge: Community Contributor
  ✓ Created badge: Reputation Milestone
  ✓ Created badge: Skill Master
  ✓ Created badge: Social Butterfly
  ✓ Created badge: Early Adopter
  ✓ Created badge: Chain Explorer
✅ All badges initialized

📋 Deployment Summary:
  Network: Base Mainnet (8453)
  Contract: 0x9876543210987654321098765432109876543210
  Badges: 10
  Explorer: https://basescan.org/address/0x987654...

============================================================
✅ DEPLOYMENT COMPLETE
============================================================
```

### Save This Contract Address!

```
📌 Base Mainnet Contract Address:
   0x9876543210987654321098765432109876543210

   Copy this to your .env.local:
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x9876543210987654321098765432109876543210
```

The deployment info is also saved to:
```
cat deployment-info/base-mainnet-deployment.json
```

---

## PHASE 4: Verify on Basescan (5 minutes)

### Check Your Contract

1. Go to: https://basescan.org/
2. Search for your contract address: `0x987654...`
3. You should see:
   - ✅ Contract name: `OnChainResumeEnhanced`
   - ✅ 10 created badge events
   - ✅ Transaction hash from deployment
   - ✅ Gas used

### Verify Source Code (Optional)

```bash
npx hardhat verify --network base 0x9876543210987654321098765432109876543210
```

This allows anyone to see and audit your contract code on Basescan.

---

## PHASE 5: Deploy to Stacks Testnet (5-10 minutes)

Stacks uses a different contract language (Clarity) and requires a different deployment process.

### Option A: Use Stacks Web IDE (Easiest)

1. Open: https://www.hiro.so/remix
2. Create new project
3. Copy the entire contents of: `contracts/OnChainResume.clar`
4. Paste into Web IDE
5. Click "Deploy"
6. Confirm transaction in your Stacks wallet (Hiro/Xverse/Leather)
7. Wait for confirmation
8. Copy contract address (format: `ST...`)

### Option B: Use Clarinet (Recommended for developers)

```bash
# Install Clarinet (if not installed)
# macOS:
brew install clarinet

# Or build from source:
git clone https://github.com/hirosystems/clarinet.git
cd clarinet && cargo install --path .

# Create Clarinet project
clarinet new talent-resume
cd talent-resume

# Copy contract
cp ../contracts/OnChainResume.clar contracts/OnChainResume.clar

# Deploy to testnet
clarinet integrate

# Follow prompts to connect wallet and deploy
```

### Option C: Command-line deployment

```bash
npm run deploy:stacks-testnet
```

---

## PHASE 6: Save Contract Addresses (5 minutes)

After both deployments, update your `.env.local`:

```bash
nano .env.local
```

Add/Update these lines:

```env
# From Base Mainnet deployment
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9876543210987654321098765432109876543210

# From Stacks Testnet deployment
NEXT_PUBLIC_STACKS_RESUME_CONTRACT_TESTNET=ST2PABQ3KSQSN94KH6MQQCSJS4P72TMVS3EJ7BFF8
```

Save and close (nano: Ctrl+O → Enter → Ctrl+X)

---

## PHASE 7: Verify Both Deployments (10 minutes)

### Check Base Mainnet

```bash
# View deployment info
cat deployment-info/base-mainnet-deployment.json
```

Visit: https://basescan.org/address/0x9876543210987654321098765432109876543210

You should see:
- Contract code visible ✓
- 10 badge creation events ✓
- Gas used: ~2-3 million ✓

### Check Stacks Testnet

Visit: https://explorer.stacks.co/?chain=testnet

Search for your contract address (ST2PAB...)

You should see:
- Contract deployment transaction ✓
- Block confirmation ✓
- STX fees used ✓

---

## PHASE 8: Test Deployments (Optional but recommended)

### Create a Test Profile (Base Mainnet)

```javascript
// In browser console or Node.js:
const contract = new ethers.Contract(
  '0x9876543210987654321098765432109876543210',
  ABI,
  signer
);

// Create profile
const tx = await contract.createProfile(
  'test-user',
  'QmTestIPFSHash',
  8453  // Base mainnet chain ID
);

// Wait for confirmation
await tx.wait();
console.log('Profile created!');
```

### Check Reputation (Base Mainnet)

```javascript
const rep = await contract.getReputation('test-user');
console.log('Score:', rep.score.toString());
console.log('Level:', rep.level.toString());
```

---

## Summary Table

| Phase | Action | Time | Success |
|-------|--------|------|---------|
| 1 | Install & configure | 10 min | npm install works |
| 2 | Fund wallets | 5-15 min | Balance visible in explorer |
| 3 | Deploy Base | 5 min | Contract address returned |
| 4 | Verify Base | 5 min | Contract visible on Basescan |
| 5 | Deploy Stacks | 5-10 min | Contract address returned |
| 6 | Update config | 5 min | .env.local has both addresses |
| 7 | Verify Stacks | 5 min | Contract visible on explorer |
| 8 | Test (optional) | 10 min | Transaction confirmed |
| **TOTAL** | | **45-65 min** | ✅ Ready for production |

---

## Deployment Architecture

```
Your Wallet
├── Base Mainnet (8453)
│   ├── ETH balance: 0.045
│   ├── OnChainResumeEnhanced: 0x987654...
│   ├── 10 Badges: Initialized
│   └── Status: ✅ LIVE
│
└── Stacks Testnet (2147483648)
    ├── STX balance: 5.0 STX
    ├── OnChainResume.clar: ST2PAB...
    ├── Profile/Achievement maps: Ready
    └── Status: ✅ LIVE
```

---

## What You Now Have

✅ **Base Mainnet (Production)**
- Smart contract deployed with all functions active
- 10 achievement badges initialized
- Ready to accept user profiles and credentials
- Public on Basescan for verification

✅ **Stacks Testnet (Testing)**
- Clarity contract deployed on Bitcoin L2
- Ready for integration testing
- Can test cross-chain functionality
- Bitcoin settlement available

✅ **Environment Configured**
- Contract addresses in `.env.local`
- RPC endpoints configured
- Ready for frontend integration

---

## Next Steps

### Immediately After

1. ✅ Test profile creation (see Phase 8)
2. ✅ Share contract addresses with team
3. ✅ Add contracts to frontend (see `src/lib/web3-config.ts`)

### Before Production

1. Security audit of contracts
2. Load testing with multiple users
3. Test cross-chain profile syncing
4. Set up monitoring and alerts

### Going Live

1. Announce deployment
2. Onboard beta users
3. Monitor gas costs and transaction success
4. Gather community feedback

---

## Troubleshooting

### "Insufficient balance"

```bash
# Check balance
# Base: https://basescan.org/ → search your address
# Stacks: https://testnet-api.stacks.co/v2/accounts/{address}

# Need more ETH? Use bridge:
# https://bridge.base.org/

# Need more STX? Use faucet:
# https://faucet.testnet.stacks.co/
```

### "RPC connection failed"

```bash
# Test RPC endpoint
curl -X POST https://mainnet.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'

# If fails, check .env.local for correct URLs
```

### "Deployment failed - gas issues"

```bash
# Check current gas price
# Use https://basescan.org/gastracker

# If very high, wait and retry deployment
# Usually takes 1-2 hours for prices to drop
```

### "Can't find contract on explorer"

```bash
# Wait 1-2 minutes after deployment
# Then refresh explorer
# Check you're on correct network (Base Mainnet vs Sepolia)
```

---

## Support Resources

- 📚 Base Docs: https://docs.base.org/
- 📚 Stacks Docs: https://docs.stacks.co/
- 🔍 Basescan: https://basescan.org/
- 🔍 Stacks Explorer: https://explorer.stacks.co/?chain=testnet
- 💬 Base Discord: https://discord.gg/base
- 💬 Stacks Discord: https://discord.gg/stacks

---

## Deployment Checklist

```
BEFORE DEPLOYMENT
□ npm install completed
□ .env.local created and filled
□ PRIVATE_KEY is set
□ RPC URLs are correct
□ npm run compile passes
□ Wallet has ETH for Base (0.01-0.05)
□ Wallet has STX for Stacks (0.5+)

BASE MAINNET DEPLOYMENT
□ npm run deploy:base-mainnet executed
□ Contract address received and saved
□ Deployment info in deployment-info/
□ Contract visible on Basescan.org
□ 10 badges initialized

STACKS TESTNET DEPLOYMENT
□ Contract deployed (Web IDE or Clarinet)
□ Contract address received
□ Contract visible on explorer.stacks.co
□ Deployment info saved

CONFIGURATION
□ .env.local updated with Base address
□ .env.local updated with Stacks address
□ Web3 config file updated (if needed)
□ No secrets in git repository

TESTING
□ Can create test profile
□ Can fetch profile data
□ Can check reputation
□ Both chains responding

DOCUMENTATION
□ Deployment addresses documented
□ RPC endpoints saved
□ Contract ABIs backed up
□ Deployment date recorded

PRODUCTION READY
□ Contracts verified on explorers
□ Security audit scheduled (if needed)
□ Team notified of addresses
□ Monitoring set up
```

---

**You're ready to deploy! Start with:**

```bash
npm run compile
npm run deploy:base+stacks
```

**Timeline: ~50 minutes from now to fully deployed and verified** ⏱️

Good luck! 🚀
