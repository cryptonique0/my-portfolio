# 🚀 Deployment Guide: Base Mainnet + Stacks Testnet

## Overview

This guide walks you through deploying your Web3 Resume platform to:
- **Base Mainnet** - Production EVM deployment with OnChainResumeEnhanced contract
- **Stacks Testnet** - Testnet Clarity contract for Bitcoin L2

---

## Prerequisites

### 1. Environment Variables

Copy and fill in your `.env.local`:

```bash
cp .env.local.example .env.local
```

**Required Variables:**

```env
# Your deployment private key (keep secret!)
PRIVATE_KEY=your_private_key_without_0x_prefix

# Base Network RPC
BASE_RPC_URL=https://mainnet.base.org

# Stacks Network RPC
STACKS_TESTNET_RPC_URL=https://testnet-api.stacks.co

# Block Explorer APIs
BASESCAN_API_KEY=your_basescan_api_key_from_basescan.org
```

### 2. Fund Your Wallet

**For Base Mainnet:**
- Need real ETH on Base mainnet (~0.01-0.05 ETH for deployment)
- Get Base ETH from exchanges or bridges
- Bridge from Ethereum or Coinbase using official bridges

**For Stacks Testnet:**
- Need testnet STX (free!)
- Get from Stacks Testnet Faucet: https://faucet.testnet.stacks.co/

### 3. Verify Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile
```

---

## Step-by-Step Deployment

### Step 1: Deploy to Base Mainnet

```bash
npm run deploy:base-mainnet
```

**What happens:**
1. ✅ Deploys `OnChainResumeEnhanced` smart contract
2. ✅ Initializes 10 achievement badges
3. ✅ Saves deployment info to `deployment-info/base-mainnet-deployment.json`
4. ✅ Generates Basescan link for verification

**Output Example:**
```
✅ Contract deployed to: 0x1234567890123456789012345678901234567890
✓ Created badge: Profile Architect
✓ Created badge: First Step
... (8 more badges)

📊 Deployment Summary:
  Network: Base Mainnet (8453)
  Contract: 0x1234567890123456789012345678901234567890
  Badges: 10
  Explorer: https://basescan.org/address/0x123...
```

### Step 2: Verify on Basescan

1. Go to: https://basescan.org/
2. Search your contract address
3. Verify code on Basescan:

```bash
npx hardhat verify --network base <CONTRACT_ADDRESS>
```

### Step 3: Deploy to Stacks Testnet

You have two options:

#### Option A: Use Clarinet (Recommended)

```bash
# Install Clarinet
brew install clarinet
# Or: https://github.com/hirosystems/clarinet

# Initialize project
clarinet new talent-resume
cd talent-resume

# Copy contract
cp ../contracts/OnChainResume.clar contracts/

# Get testnet STX
# Visit: https://faucet.testnet.stacks.co/

# Deploy
clarinet integrate
```

#### Option B: Use Stacks Web IDE

1. Go to: https://www.hiro.so/remix
2. Create new Clarity project
3. Copy contents of `contracts/OnChainResume.clar`
4. Get testnet STX: https://faucet.testnet.stacks.co/
5. Click "Deploy" in Web IDE
6. Confirm transaction in wallet

#### Option C: Command Line (if EVM-bridge available)

```bash
npm run deploy:stacks-testnet
```

---

## Step 4: Update Environment Variables

After deployment, update `.env.local`:

```env
# Base Mainnet (from deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Stacks Testnet (from Clarinet/Web IDE deployment)
NEXT_PUBLIC_STACKS_RESUME_CONTRACT_TESTNET=ST2PABQ3KSQSN94KH6MQQCSJS4P72TMVS3EJ7BFF8
```

---

## Step 5: Verify Deployment

### Base Mainnet

```bash
# Check contract on Basescan
curl https://api.basescan.org/api?module=contract&action=getabi&address=0x1234... | jq
```

### Stacks Testnet

```bash
# Check contract deployment
curl https://testnet-api.stacks.co/v2/contracts/source/<CONTRACT_ADDRESS>
```

---

## Testing Your Deployment

### Create a Profile

```javascript
// Using ethers.js
const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  ABI,
  signer
);

await contract.createProfile(
  'your-handle',
  'ipfs-hash-here',
  8453 // Base mainnet chain ID
);
```

### Add Credentials

```javascript
await contract.addCredential(
  'skill-name',
  'category',
  'ipfs-metadata-hash'
);
```

### Check Reputation

```javascript
const reputation = await contract.getReputation('handle');
console.log(reputation); // Should return score and level
```

---

## Deployment Checklist

```
□ Private key loaded in .env.local
□ RPC URLs configured
□ Wallet funded with ETH (Base) and STX (Stacks)
□ Contracts compiled successfully
□ npm run compile passes
□ Base Mainnet deployment completes
□ Contract verified on Basescan
□ Stacks Testnet deployment completes
□ Environment variables updated
□ Test contract interactions
□ Document contract addresses
□ Ready for frontend integration
```

---

## Troubleshooting

### "Insufficient balance" Error

**Solution:**
- Check account balance: https://basescan.org/ (Base Mainnet)
- Fund account with more ETH
- Minimum: 0.01 ETH for deployment + gas

### "Contract already exists" Error

**Solution:**
- You've already deployed to this network
- Contract address is in `deployment-info/` folder
- If re-deploying: use `npm run compile` first

### "Invalid RPC URL" Error

**Solution:**
- Check `.env.local` has correct RPC URLs
- Verify API keys are valid
- Test RPC: `curl https://mainnet.base.org -X POST`

### Stacks Deployment Fails

**Solution:**
- Ensure STX balance ≥ 0.5 STX
- Use faucet: https://faucet.testnet.stacks.co/
- Wait 2-3 blocks for confirmation
- Check transaction on: https://explorer.stacks.co/?chain=testnet

---

## Network Details

### Base Mainnet

```
Chain ID: 8453
RPC: https://mainnet.base.org
Block Explorer: https://basescan.org
Currency: ETH
Contract Type: Solidity (EVM)
```

### Stacks Testnet

```
Chain ID: 2147483648
RPC: https://testnet-api.stacks.co
Block Explorer: https://explorer.stacks.co/?chain=testnet
Currency: STX
Contract Type: Clarity
Faucet: https://faucet.testnet.stacks.co/
```

---

## Next Steps After Deployment

1. **Verify Contracts** - Use Basescan for Base mainnet
2. **Test Functions** - Create profiles, add credentials
3. **Frontend Integration** - Update React components with contract addresses
4. **Monitor Gas** - Track transaction costs
5. **User Testing** - Invite beta users to test
6. **Security Audit** - Before mainnet production
7. **Launch** - Announce deployment to community

---

## Useful Links

- **Base Mainnet Info**: https://docs.base.org/
- **Stacks Bitcoin L2**: https://docs.stacks.co/
- **Basescan Verification**: https://basescan.org/apis
- **Hardhat Deployment**: https://hardhat.org/hardhat-runner/docs/guides/deploying
- **Clarinet Docs**: https://docs.clarinet.sh/
- **Contract ABIs**: See `artifacts/` folder after compilation

---

## Support

For issues or questions:
1. Check error message in console
2. Review this troubleshooting section
3. Check contract on block explorer
4. Verify environment variables
5. Test on testnet first before mainnet

---

**Good luck with your deployment! 🚀**
