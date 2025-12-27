# 🎯 START HERE - Deployment Quick Guide

## Your Mission
Deploy Web3 Resume to:
- 🔵 **Base Mainnet** (EVM - Production)
- ⚪ **Stacks Testnet** (Bitcoin L2 - Testing)

---

## ⏱️ Time: ~50 Minutes

```
Setup & Config .......... 10 min
Fund Wallets ............ 10 min  
Deploy Base ............. 5 min
Verify Base ............. 5 min
Deploy Stacks ........... 10 min
Verify Stacks ........... 5 min
Test & Document ......... 5 min
─────────────────────────────
TOTAL ................... 50 min ✅
```

---

## 🚀 Quick Start (Copy & Paste)

### 1. Setup (2 minutes)
```bash
cd /home/web3joker/talent-resume-wt
npm install
npm run compile
```

### 2. Configure (2 minutes)
```bash
cp .env.local.example .env.local
# Edit .env.local with your PRIVATE_KEY and API keys
nano .env.local
```

### 3. Fund Wallet (10-15 minutes)
**Base Mainnet:**
- Go: https://bridge.base.org/
- Bridge: 0.01-0.05 ETH from Ethereum

**Stacks Testnet:**
- Go: https://faucet.testnet.stacks.co/
- Request: Free STX testnet

### 4. Deploy (5 minutes)
```bash
npm run deploy:base-mainnet
# Copy contract address from output
# Add to .env.local: NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### 5. Deploy Stacks (5-10 minutes)
**Web IDE (Easiest):**
- Go: https://www.hiro.so/remix
- New project → Copy `contracts/OnChainResume.clar`
- Deploy → Confirm in wallet

**Or CLI:**
```bash
brew install clarinet
clarinet new talent-resume
cp contracts/OnChainResume.clar talent-resume/contracts/
cd talent-resume && clarinet integrate
```

### 6. Verify (5 minutes)
```bash
# Base: https://basescan.org/ → Search your address
# Stacks: https://explorer.stacks.co/?chain=testnet → Search address
cat deployment-info/base-mainnet-deployment.json
```

### 7. Done! ✅
```bash
npm run dev
# Visit: http://localhost:3000
```

---

## 📊 Your Deployment

```
┌─────────────────────────────────────────────────┐
│           YOUR WEB3 RESUME DEPLOYED             │
├─────────────────────────────────────────────────┤
│                                                 │
│ 🔵 BASE MAINNET (EVM)                          │
│    └─ OnChainResumeEnhanced                    │
│       ├─ 35+ Functions                         │
│       ├─ 10 Achievements                       │
│       ├─ NFT System                            │
│       ├─ Reputation Tracking                   │
│       └─ LIVE at: https://basescan.org/...     │
│                                                 │
│ ⚪ STACKS TESTNET (Bitcoin L2)                  │
│    └─ OnChainResume.clar                       │
│       ├─ Profile Management                    │
│       ├─ Credential System                     │
│       ├─ Achievement Tracking                  │
│       └─ LIVE at: https://explorer.stacks...   │
│                                                 │
│ 📚 10 Achievement Types:                        │
│    ✓ Profile Architect (Bronze)                │
│    ✓ First Step (Bronze)                       │
│    ✓ Credential Collector (Silver)             │
│    ✓ Verified Expert (Gold)                    │
│    ✓ Community Contributor (Silver)            │
│    ✓ Reputation Milestone (Platinum)           │
│    ✓ Skill Master (Gold)                       │
│    ✓ Social Butterfly (Silver)                 │
│    ✓ Early Adopter (Platinum)                  │
│    ✓ Chain Explorer (Diamond)                  │
│                                                 │
│ 🏆 6 Reputation Levels:                         │
│    Novice → Apprentice → Journeyman →          │
│    Expert → Master → Legend                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📋 Checklist

### Before Starting
- [ ] Have private key ready (NOT with 0x)
- [ ] 0.01-0.05 ETH available for Base
- [ ] Can fund Stacks testnet (faucet)
- [ ] npm installed and working
- [ ] Text editor ready (nano, vim, VS Code)

### Step 1: Setup
- [ ] `npm install` completes
- [ ] `npm run compile` shows no errors
- [ ] `.env.local` created
- [ ] PRIVATE_KEY added to `.env.local`
- [ ] BASESCAN_API_KEY added (optional but recommended)

### Step 2: Funding
- [ ] 0.01-0.05 ETH on Base Mainnet
  Check: https://basescan.org/ → search address
- [ ] 0.5+ STX on Stacks Testnet
  Check: https://testnet-api.stacks.co/v2/accounts/{address}

### Step 3: Deploy Base
- [ ] `npm run deploy:base-mainnet` completes successfully
- [ ] Contract address displayed and copied
- [ ] 10 badges initialization completed
- [ ] Contract visible on https://basescan.org/

### Step 4: Deploy Stacks
- [ ] Contract deployed via Web IDE or Clarinet
- [ ] Contract address obtained
- [ ] Contract visible on https://explorer.stacks.co/?chain=testnet

### Step 5: Configuration
- [ ] Base contract address added to `.env.local`
- [ ] Stacks contract address added to `.env.local`
- [ ] No errors in terminal
- [ ] `npm run dev` starts without errors

### Step 6: Verification
- [ ] Base contract shows on Basescan
- [ ] Stacks contract shows on explorer
- [ ] Deployment info JSON files exist
- [ ] Frontend loads at localhost:3000

### Step 7: Done!
- [ ] Wallet connects in frontend
- [ ] Ready for testing and production

---

## 🎯 Network IDs to Remember

```
Base Mainnet: 8453
Stacks Testnet: 2147483648
```

Add these to code when needed:
```javascript
const BASE_MAINNET_ID = 8453;
const STACKS_TESTNET_ID = 2147483648;
```

---

## 📚 Documentation by Need

| You Want To... | Read This |
|---|---|
| Deploy in 5 minutes | This file! ✨ |
| Step-by-step guide | `DEPLOY_COMPLETE_GUIDE.md` |
| Quick reference | `DEPLOY_CHEATSHEET.md` |
| Troubleshooting | `DEPLOYMENT_BASE_STACKS.md` |
| File summary | `DEPLOYMENT_SUMMARY.md` |
| Full overview | `DEPLOY_NOW.md` |
| Automation | `setup-and-deploy.sh` |

---

## ✅ Success Indicators

After deployment, you should see:

```
✅ Base Mainnet
   • Contract visible on https://basescan.org/address/0x...
   • 10 badge initialization events
   • Gas used: 2-3 million
   • Cost: ~$5-15 in ETH

✅ Stacks Testnet
   • Contract visible on https://explorer.stacks.co/?chain=testnet
   • Deployment transaction confirmed
   • STX fee deducted
   • Ready for interactions

✅ Configuration
   • Both addresses in .env.local
   • No compilation errors
   • npm run dev works
   • Frontend accessible at localhost:3000

✅ Integration
   • Can create profiles (if UI exists)
   • Can add credentials
   • Can check reputation
   • Can view achievements
```

---

## 🆘 If Something Goes Wrong

```
"Insufficient balance" → Fund wallet (see above)
"RPC connection failed" → Check .env.local URLs
"Compile error" → npm install && npm run compile
"Deployment hangs" → Check Basescan gas prices
"Contract not found" → Wait 1-2 min, refresh

More help: See DEPLOYMENT_BASE_STACKS.md
```

---

## 🔗 Important Links

### Funding
- Bridge ETH → Base: https://bridge.base.org/
- Get testnet STX: https://faucet.testnet.stacks.co/

### Explorers
- Base: https://basescan.org/
- Stacks: https://explorer.stacks.co/?chain=testnet

### Documentation
- Base: https://docs.base.org/
- Stacks: https://docs.stacks.co/

### Deployment Tools
- Clarinet: https://github.com/hirosystems/clarinet
- Web IDE: https://www.hiro.so/remix

---

## 🎉 Ready?

```bash
# 1. Setup
npm install && npm run compile

# 2. Configure
cp .env.local.example .env.local
# Edit .env.local with your values

# 3. Deploy
npm run deploy:base-mainnet
npm run deploy:stacks-testnet

# 4. Test
npm run dev
```

**Estimated completion: 50 minutes**

---

## Next: What to Read

Pick your path:

🏃 **Fast Track** (Just deploy)
- Run commands above
- Use `DEPLOY_CHEATSHEET.md` for reference

📚 **Complete** (Understand everything)
- Read `DEPLOY_COMPLETE_GUIDE.md` (20 min)
- Then deploy
- Use `DEPLOYMENT_BASE_STACKS.md` for details

🤖 **Automated** (Let script help)
- Run `./setup-and-deploy.sh`
- Answer prompts
- Script guides you through

---

**Let's go! 🚀**

Choose one and start:

```bash
npm run deploy:base-mainnet     # Fast track
./setup-and-deploy.sh           # Guided setup
# Or read DEPLOY_COMPLETE_GUIDE.md for full details
```

**You've got this!** ✨
