# 🔧 Environment Setup Guide

**Status**: Ready for Mainnet Deployment  
**Date**: January 5, 2026

---

## 📋 Quick Setup

### 1. Copy Environment Template
```bash
cp .env.local.example .env.local
```

### 2. Fill in Contract Addresses

After deploying to Base Mainnet, update `.env.local`:

```env
# ============ CONTRACT ADDRESSES ============
# Base Mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<your-contract-address>

# Stacks Mainnet
NEXT_PUBLIC_STACKS_RESUME_CONTRACT=SP<your-stacks-address>
NEXT_PUBLIC_STACKS_ACHIEVEMENT_NFT=SP<your-stacks-address>
```

### 3. Add API Keys

```env
# ============ IPFS CONFIGURATION ============
IPFS_API_KEY=your_pinata_api_key
IPFS_API_SECRET=your_pinata_secret_key

# ============ BLOCK EXPLORER API KEYS ============
BASESCAN_API_KEY=your_basescan_api_key
```

### 4. Verify Setup
```bash
npm run dev
# Visit http://localhost:3000
# Try /verify/jane-smith - should fetch from contract
```

---

## 🚀 Deployment Addresses (After Contract Deploy)

Once contracts are deployed:

### Base Mainnet
- **OnChainResume.sol**: `0x...` (update in .env.local)
- **BaseScan Link**: https://basescan.org/address/0x...

### Stacks Mainnet
- **OnChainResume.clar**: `SP...` (update in .env.local)
- **Stacks Explorer**: https://explorer.stacks.co/address/SP...

---

## 📍 Verification Page Wiring

**Routes Enabled**:
- `GET /api/verify/[address]` - Fetch profile from contract
- `GET /verify/[handle]` - Public profile page

**Current Flow**:
1. User visits `/verify/jane-smith`
2. Component resolves handle → wallet address
3. Fetches profile data via `/api/verify/[address]`
4. Displays on-chain data with reputation breakdown
5. Shows BaseScan/Stacks Explorer links

**Data Fetched**:
- Profile (handle, owner, ipfsHash, createdAt, verified)
- Reputation score (deterministic calculation)
- Reputation breakdown (base + all bonuses)
- Credentials (via contract, extensible)

---

## ✅ Testing Checklist

Before going live:

- [ ] Deploy OnChainResume.sol to Base Mainnet
- [ ] Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in .env.local
- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:3000/verify/0x742d35Cc6634C0532925a3b844Bc2e7B1b739bcd`
- [ ] Verify profile loads from contract
- [ ] Check reputation score matches formula
- [ ] Verify BaseScan link works
- [ ] Test with different wallet addresses
- [ ] Deploy OnChainResume.clar to Stacks Mainnet
- [ ] Wire Stacks verification (in progress)

---

## 🔗 API Endpoints

### Get Profile & Reputation
```
GET /api/verify/[address]

Response:
{
  "profile": {
    "handle": "jane-smith",
    "owner": "0x742d...",
    "ipfsHash": "QmXxxx...",
    "createdAt": 1704067200,
    "verified": true,
    "credentialCount": 3
  },
  "reputation": 145,
  "breakdown": {
    "baseScore": 10,
    "verifiedProfileBonus": 25,
    "credentialScore": 15,
    "credentialBonusPerVerified": 30,
    "achievementScore": 20,
    "activityScore": 45,
    "totalScore": 145,
    "credentialCount": 3,
    "verifiedCredentialCount": 2,
    "achievementCount": 2
  }
}
```

---

## 🎯 Environment Checklist

### Required for Production
- [ ] `NEXT_PUBLIC_CONTRACT_ADDRESS` - Base contract
- [ ] `IPFS_API_KEY` - For resume storage
- [ ] `IPFS_API_SECRET` - For resume storage
- [ ] `BASESCAN_API_KEY` - For block explorer links

### Optional but Recommended
- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - For wallet connect
- [ ] `NEXT_PUBLIC_STACKS_RESUME_CONTRACT` - For Stacks integration
- [ ] `COINMARKETCAP_API_KEY` - For gas reporter

### Development Only
- [ ] `PRIVATE_KEY` - Never in production
- [ ] `REPORT_GAS` - Set to false in production

---

## 🚨 Security Reminders

1. **Never commit `.env.local`** to git
2. **Rotate keys regularly** (every 3 months)
3. **Use different keys** for dev/prod/staging
4. **Store in secrets management** (GitHub Secrets, Vercel, etc.)
5. **Never share API keys** in public repos
6. **Monitor usage** for unusual activity

---

## 📞 Troubleshooting

### "Contract address not configured"
- Check `NEXT_PUBLIC_CONTRACT_ADDRESS` is set in .env.local
- Run `npm run dev` again after updating env

### "Profile not found on-chain"
- Verify contract deployed to Base Mainnet
- Check address exists on BaseScan
- Confirm contract address matches in env

### "IPFS upload failing"
- Check `IPFS_API_KEY` is valid
- Verify Pinata API key has permissions
- Try alternative provider (NFT.Storage)

---

**Ready to deploy?** Follow these steps and your app will be production-ready! 🚀
