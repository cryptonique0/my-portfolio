# 🚀 BitArt Market - Smart Contract Deployment Guide

## Overview

This guide walks you through deploying your BitArt Market smart contracts to the Stacks blockchain. You have three Clarity contracts ready:

1. **nft.clar** - NFT creation, ownership, and metadata management
2. **marketplace.clar** - Listing, pricing, and purchase handling
3. **auction.clar** - Bidding system and auction management

## Prerequisites

Before deploying, ensure you have:

✅ Stacks CLI installed (`clarinet` or `stacks-cli`)  
✅ A Stacks wallet with STX for transaction fees  
✅ Contracts ready in `/contracts` directory  
✅ Network chosen: testnet or mainnet  

---

## Step 1: Choose Your Deployment Network

### Option A: Testnet (Recommended for First Deployment)
- **Network**: Stacks Testnet
- **API**: https://api.testnet.stacks.co
- **Chain ID**: 0x80000000
- **Use When**: Testing before mainnet
- **Cost**: Free (testnet STX)
- **Risk**: Low (testnet only)

### Option B: Mainnet (Production)
- **Network**: Stacks Mainnet
- **API**: https://api.mainnet.stacks.co
- **Chain ID**: 0x00000001
- **Use When**: Going live
- **Cost**: Real STX required
- **Risk**: High (real assets)

**Recommendation**: Deploy to testnet first, test thoroughly, then deploy to mainnet.

---

## Step 2: Set Up Your Wallet

### Create/Import a Stacks Wallet

**Option 1: Hiro Wallet** (Browser Extension - Recommended)
```
1. Install: https://www.hiro.so/wallet
2. Create new wallet or import existing
3. Switch to testnet for testing
4. Note your Stacks address (starts with 'SP')
5. Request testnet STX from: https://testnet-faucet.stacks.org/
```

**Option 2: Using CLI**
```bash
# Install Stacks CLI
npm install -g @stacks/cli

# Create new account
stacks new-account

# This generates:
# - Private key (keep safe!)
# - Stacks address (SP...)
# - Seed phrase (backup!)
```

### Get Testnet STX
Visit: https://testnet-faucet.stacks.org/
- Enter your Stacks address
- Receive 500 testnet STX
- Takes 5-10 minutes to appear

---

## Step 3: Prepare Your Contracts

### Verify Contract Syntax

```bash
cd /home/web3joker/BitArt\ Market/contracts

# Check if clarinet is installed
clarinet --version

# If not, install:
npm install -g @stacks/clarinet

# Verify contracts
clarinet check

# Expected output: No syntax errors
```

### Contract Deployment Order

Deploy contracts in this order (dependencies):

1. **nft.clar** (No dependencies - deploy first)
2. **marketplace.clar** (Depends on nft.clar)
3. **auction.clar** (Depends on nft.clar)

---

## Step 4: Deploy Contracts

### Method 1: Using Hiro Wallet + Web Interface (Easiest)

**Step A: Prepare Contract Code**
```bash
# Read your contract
cat contracts/nft.clar
```

**Step B: Deploy via Hiro**
1. Go to: https://clarityrepl.io/
2. Connect Hiro Wallet
3. Select Network: Testnet
4. Paste contract code into editor
5. Click "Deploy"
6. Approve transaction in wallet
7. Wait for confirmation (1-2 blocks)

### Method 2: Using Stacks CLI (Recommended for Automation)

**Step A: Create Deployment Configuration**

Create file: `/home/web3joker/BitArt Market/contracts/deploy.json`

```json
{
  "testnet": {
    "network": "testnet",
    "apiUrl": "https://api.testnet.stacks.co",
    "contracts": [
      {
        "name": "bitart-nft",
        "file": "contracts/nft.clar"
      },
      {
        "name": "bitart-marketplace",
        "file": "contracts/marketplace.clar"
      },
      {
        "name": "bitart-auction",
        "file": "contracts/auction.clar"
      }
    ]
  },
  "mainnet": {
    "network": "mainnet",
    "apiUrl": "https://api.mainnet.stacks.co",
    "contracts": [
      {
        "name": "bitart-nft",
        "file": "contracts/nft.clar"
      },
      {
        "name": "bitart-marketplace",
        "file": "contracts/marketplace.clar"
      },
      {
        "name": "bitart-auction",
        "file": "contracts/auction.clar"
      }
    ]
  }
}
```

**Step B: Deploy Using Stacks CLI**

```bash
# Deploy NFT contract to testnet
stx deploy \
  --network testnet \
  --private-key YOUR_PRIVATE_KEY \
  --contract-name bitart-nft \
  --clarity-file contracts/nft.clar

# Expected output:
# Contract ID: SP.../bitart-nft
# Block height: xxxxx
# Transaction ID: 0x...
```

### Method 3: Using Clarinet (Development-Focused)

```bash
cd /home/web3joker/BitArt\ Market

# Start Clarinet environment
clarinet integrate

# Deploy contracts
clarinet deploy --network testnet

# Test contracts
clarinet test

# Generate TypeScript bindings
clarinet generate types
```

---

## Step 5: Verify Deployment

### Check Deployment on Stacks Explorer

**Testnet Explorer**: https://explorer.stacks.co/

1. Visit the explorer
2. Search for your contract ID (SP.../bitart-nft)
3. Verify:
   - ✅ Contract code is visible
   - ✅ Deployment transaction confirmed
   - ✅ No error messages

### Verify Contract Functions

```bash
# Using Stacks API
curl https://api.testnet.stacks.co/v2/contracts/read/<contract-id>/<contract-name>/<function-name> \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "YOUR_ADDRESS",
    "arguments": []
  }'
```

---

## Step 6: Test Your Contracts

### Test NFT Creation

```bash
# Call mint-nft function
stx call \
  --network testnet \
  --private-key YOUR_PRIVATE_KEY \
  --contract-address SP.../bitart-nft \
  --function-name mint-nft \
  --arguments '"My First NFT"' '"Beautiful artwork"' '"ipfs://..."' '"art"' 'u10'
```

### Test Marketplace Listing

```bash
# List NFT for sale
stx call \
  --network testnet \
  --private-key YOUR_PRIVATE_KEY \
  --contract-address SP.../bitart-marketplace \
  --function-name list-nft \
  --arguments 'u1' 'u1000000' 'u1' 'u5000'
```

---

## Step 7: Deployment Checklist

Before going live on mainnet:

- [ ] Testnet contracts deployed successfully
- [ ] All functions tested and working
- [ ] Contract code reviewed for security
- [ ] No errors in Stacks Explorer
- [ ] Wallet has sufficient STX for mainnet fees
- [ ] Mainnet contract addresses documented
- [ ] Frontend updated with mainnet contract IDs
- [ ] Backend API updated with mainnet addresses

---

## Step 8: Deploy to Mainnet

### WARNING: Mainnet Deployment is Permanent!

Before deploying to mainnet:
1. ✅ Test thoroughly on testnet
2. ✅ Verify contract logic with team
3. ✅ Ensure wallet security
4. ✅ Have sufficient STX for gas fees

### Mainnet Deployment Commands

```bash
# Deploy NFT contract to mainnet
stx deploy \
  --network mainnet \
  --private-key YOUR_PRIVATE_KEY \
  --contract-name bitart-nft \
  --clarity-file contracts/nft.clar

# Wait for transaction confirmation
# Takes 5-15 minutes on mainnet

# Then deploy marketplace
stx deploy \
  --network mainnet \
  --private-key YOUR_PRIVATE_KEY \
  --contract-name bitart-marketplace \
  --clarity-file contracts/marketplace.clar

# Then deploy auction
stx deploy \
  --network mainnet \
  --private-key YOUR_PRIVATE_KEY \
  --contract-name bitart-auction \
  --clarity-file contracts/auction.clar
```

---

## Step 9: Update Your Application

After contracts are deployed, update:

### Frontend Configuration

File: `frontend/src/services/wallet.ts`

```typescript
// Add after successful deployment
export const CONTRACT_IDS = {
  testnet: {
    nft: 'SP...bitart-nft',
    marketplace: 'SP...bitart-marketplace',
    auction: 'SP...bitart-auction'
  },
  mainnet: {
    nft: 'SP...bitart-nft',
    marketplace: 'SP...bitart-marketplace',
    auction: 'SP...bitart-auction'
  }
};

// Set based on network
const NETWORK = process.env.VITE_STACKS_NETWORK || 'testnet';
const CONTRACTS = CONTRACT_IDS[NETWORK];
```

### Backend Configuration

File: `backend/src/config/contracts.ts`

```typescript
export const STACKS_CONTRACTS = {
  testnet: {
    nft: 'SP...bitart-nft',
    marketplace: 'SP...bitart-marketplace',
    auction: 'SP...bitart-auction'
  },
  mainnet: {
    nft: 'SP...bitart-nft',
    marketplace: 'SP...bitart-marketplace',
    auction: 'SP...bitart-auction'
  }
};
```

---

## Troubleshooting

### Problem: "Insufficient Balance"
**Solution**: Get more testnet STX from faucet or check wallet balance

### Problem: "Contract Already Exists"
**Solution**: Contracts are already deployed at that address; use a different name

### Problem: "Invalid Syntax"
**Solution**: 
```bash
clarinet check
# Review error messages
# Fix syntax in .clar files
# Re-deploy
```

### Problem: "Transaction Timeout"
**Solution**: 
- Wait longer (testnet can be slow)
- Check network status
- Retry deployment

---

## Gas Fees & Costs

### Testnet
- No real cost
- Use for testing
- Unlimited transactions

### Mainnet
- NFT contract: ~50-100 STX
- Marketplace contract: ~40-80 STX
- Auction contract: ~40-80 STX
- **Total**: ~150-250 STX (~$5-20 USD depending on STX price)

---

## Security Best Practices

✅ **Never share private keys**
✅ **Use environment variables** for sensitive data
✅ **Test on testnet first**
✅ **Verify contract code** before mainnet deployment
✅ **Use hardware wallet** for mainnet deployment
✅ **Keep contract addresses documented**
✅ **Monitor deployed contracts** for activity

---

## Next Steps

After successful deployment:

1. ✅ Verify contracts on explorer
2. ✅ Test all functions thoroughly
3. ✅ Update frontend with contract IDs
4. ✅ Deploy backend API
5. ✅ Deploy frontend application
6. ✅ Test end-to-end (create NFT → list → buy)
7. ✅ Monitor contract events
8. ✅ Set up analytics

---

## Useful Resources

- **Stacks Docs**: https://docs.stacks.co/smart-contracts
- **Clarity Language**: https://clarity-lang.org/
- **Stacks Explorer Testnet**: https://explorer.stacks.co/?chain=testnet
- **Stacks Explorer Mainnet**: https://explorer.stacks.co/
- **Testnet Faucet**: https://testnet-faucet.stacks.org/
- **Hiro Wallet**: https://www.hiro.so/wallet

---

## Contact & Support

- GitHub: https://github.com/cryptonique0/BitArt-Market
- Issues: https://github.com/cryptonique0/BitArt-Market/issues
- Stacks Discord: https://discord.gg/stacks

---

**Ready to deploy? Start with testnet first! 🚀**
