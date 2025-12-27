# ⚡ Quick Deploy Cheatsheet

## One-Liners

```bash
# Compile contracts
npm run compile

# Deploy to Base Mainnet (EVM)
npm run deploy:base-mainnet

# Deploy to Stacks Testnet (Clarity)
npm run deploy:stacks-testnet

# Deploy both at once
npm run deploy:base+stacks
```

---

## Environment Setup (5 min)

```bash
# 1. Copy template
cp .env.local.example .env.local

# 2. Edit .env.local
nano .env.local

# 3. Add these values:
PRIVATE_KEY=your_key_here
BASE_RPC_URL=https://mainnet.base.org
STACKS_TESTNET_RPC_URL=https://testnet-api.stacks.co
BASESCAN_API_KEY=your_key_here

# 4. Verify
npm run compile
```

---

## Funding Your Wallet

### Base Mainnet
- Need: Real ETH on Base (0.01-0.05 ETH)
- Get from: Exchanges or bridges
- Bridge: Official Base bridge at https://bridge.base.org/

### Stacks Testnet
- Need: Testnet STX (free)
- Get from: https://faucet.testnet.stacks.co/
- Copy & paste your address, click "Request STX"

---

## Deployment Flow

```
┌─────────────────────────────────────────┐
│  1. npm run compile                     │
│     ✓ Verify contracts compile         │
└─────────────────────────────────────────┘
                  ⬇
┌─────────────────────────────────────────┐
│  2. npm run deploy:base-mainnet         │
│     ✓ EVM contract → Base mainnet      │
│     ✓ Init 10 badges                    │
│     ✓ Get contract address              │
└─────────────────────────────────────────┘
                  ⬇
┌─────────────────────────────────────────┐
│  3. npm run deploy:stacks-testnet       │
│     ✓ Clarity contract → Stacks testnet│
│     ✓ Get contract address              │
└─────────────────────────────────────────┘
                  ⬇
┌─────────────────────────────────────────┐
│  4. Update .env.local                   │
│     NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  │
│     NEXT_PUBLIC_STACKS_..._TESTNET=ST..│
└─────────────────────────────────────────┘
                  ⬇
┌─────────────────────────────────────────┐
│  5. npm run build && npm start          │
│     ✓ Test on localhost:3000            │
└─────────────────────────────────────────┘
```

---

## After Deployment

| Action | Link/Command |
|--------|------------|
| **Verify Base Contract** | https://basescan.org/ (paste address) |
| **View Deployment Info** | `cat deployment-info/base-mainnet-deployment.json` |
| **Get Stacks STX** | https://faucet.testnet.stacks.co/ |
| **Deploy Clarity** | https://www.hiro.so/remix (paste .clar code) |
| **Check Stacks Tx** | https://explorer.stacks.co/?chain=testnet |
| **Update Contract** | Edit `src/lib/web3-config.ts` |

---

## Verify Deployments

```bash
# Check Base contract
curl https://basescan.org/api?module=contract&action=getcode&address=0x...

# Check Stacks contract
curl https://testnet-api.stacks.co/v2/contracts/source/ST...

# View deployment metadata
ls -la deployment-info/
cat deployment-info/*.json
```

---

## If Something Goes Wrong

```bash
# Start fresh - recompile
npm run compile

# Check your balance
# Base: https://basescan.org/ → search your address
# Stacks: https://testnet-api.stacks.co/v2/accounts/{address}

# Check RPC is working
curl -X POST https://mainnet.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'

# View error logs
tail -f ~/.pm2/logs/* # if using pm2
```

---

## Contract Addresses Format

```
Base Mainnet (EVM)
├─ Starts with: 0x
├─ Length: 42 characters (0x + 40 hex)
├─ Example: 0x1234567890123456789012345678901234567890
└─ Explorer: https://basescan.org/address/0x...

Stacks Testnet (Clarity)
├─ Account format: ST... (testnet)
├─ Contract format: ST....contract-name
├─ Example: ST2PABQ3KSQSN94KH6MQQCSJS4P72TMVS3EJ7BFF8
└─ Explorer: https://explorer.stacks.co/?chain=testnet
```

---

## Network IDs

```
Base Mainnet ................. 8453
Ethereum Mainnet ............. 1
Stacks Testnet ............... 2147483648
Stacks Mainnet ............... 0
```

---

## Common Commands

```bash
# Compile only
hardhat compile

# Deploy to Base (manual)
hardhat run scripts/deploy.js --network base

# Deploy to Base Sepolia (testnet)
hardhat run scripts/deploy.js --network base-sepolia

# Verify contract on Basescan
hardhat verify --network base 0x...

# Get accounts
hardhat accounts

# Check gas prices
hardhat gas-reporter
```

---

## Emergency: Undo/Redeploy

```bash
# Remove deployment info
rm deployment-info/base-mainnet-deployment.json

# Recompile
npm run compile

# Redeploy (creates new contract)
npm run deploy:base-mainnet
```

⚠️ **Note:** Redeploying creates a NEW contract address. Update `.env.local`!

---

## Success Signs ✅

- ✅ Compilation succeeds without errors
- ✅ Deployment completes and shows contract address
- ✅ Contract visible on Basescan (https://basescan.org/address/...)
- ✅ `deployment-info/` folder has JSON files
- ✅ 10 badges initialized successfully
- ✅ `.env.local` updated with new address
- ✅ React app loads without contract errors
- ✅ Can create profile (test transaction)

---

## Timing

| Step | Time |
|------|------|
| Environment setup | 2 min |
| Compile contracts | 1 min |
| Fund wallet | 5-10 min |
| Deploy Base | 2-5 min |
| Deploy Stacks | 5-10 min |
| Verify contracts | 5 min |
| Update config | 2 min |
| **Total** | **22-35 min** |

---

## File Reference

```
deployment-info/
├─ base-mainnet-deployment.json    ← Check this after deploy
└─ stacks-testnet-deployment.json  ← Check this after deploy

scripts/
├─ deploy-base-mainnet-stacks-testnet.js  ← Main deployment script
└─ deploy.js                               ← Alternative deploy

.env.local ← UPDATE WITH NEW ADDRESSES
```

---

**Need help?** See `DEPLOYMENT_BASE_STACKS.md` for full guide

**Deploy now:**
```bash
npm run compile && npm run deploy:base+stacks
```
