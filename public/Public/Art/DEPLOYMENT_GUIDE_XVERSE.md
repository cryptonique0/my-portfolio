# Deploy Contracts Using Xverse Wallet

Since Xverse wallet uses browser extension signing, you'll need to deploy through a web interface rather than command line.

## ✅ Recommended Method: Deploy via Web Interface

### Option 1: Hiro Explorer (Easiest)

1. **Visit Hiro Explorer Deploy Page**
   ```
   https://explorer.hiro.so/sandbox/deploy?chain=testnet
   ```

2. **Connect Xverse Wallet**
   - Click "Connect Wallet"
   - Select "Xverse"
   - Approve connection

3. **Deploy Each Contract**

   **Contract 1: bitart-nft**
   - Contract name: `bitart-nft`
   - Copy code from: `/home/web3joker/BitArt Market/contracts/nft.clar`
   - Click "Deploy"
   - Sign transaction in Xverse popup
   - Wait 5-15 minutes for confirmation

   **Contract 2: bitart-marketplace**
   - Contract name: `bitart-marketplace`
   - Copy code from: `/home/web3joker/BitArt Market/contracts/marketplace.clar`
   - Click "Deploy"
   - Sign transaction
   - Wait for confirmation

   **Contract 3: bitart-auction**
   - Contract name: `bitart-auction`
   - Copy code from: `/home/web3joker/BitArt Market/contracts/auction.clar`
   - Click "Deploy"
   - Sign transaction
   - Wait for confirmation

### Option 2: Platform.so Deployer

1. **Visit Platform.so**
   ```
   https://platform.so/deployer
   ```

2. **Connect Xverse Wallet**

3. **Deploy contracts one by one** (same process as above)

## 📋 After Deployment

Once all 3 contracts are deployed, you'll get contract IDs like:
```
ST2ABC...XYZ.bitart-nft
ST2ABC...XYZ.bitart-marketplace
ST2ABC...XYZ.bitart-auction
```

**Copy these addresses** and run:
```bash
# Update your application config
# I'll help you update the frontend and backend configs
```

## 🔑 Why Can't We Use Mnemonic Directly?

Xverse wallet may:
- Use a different key derivation path
- Store the mnemonic in a non-standard format
- Require browser extension signing for security

The web deployment method is actually **more secure** as your private key never leaves the wallet extension!

## ✅ Deployment Costs

- **Testnet**: FREE (get test STX from https://testnet-faucet.stacks.co/)
- **Mainnet**: ~150-250 STX per contract (~450-750 STX total)

## 📝 Quick Access to Contract Files

All three contract files are ready at:
- `contracts/nft.clar` (195 lines)
- `contracts/marketplace.clar` (206 lines)  
- `contracts/auction.clar` (180 lines)

Just copy-paste each file into the web deployer!
