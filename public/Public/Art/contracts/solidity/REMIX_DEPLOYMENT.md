# Remix Deployment Guide for BitArt Contracts

## Quick Start: Deploy on Remix IDE

This guide walks you through deploying BitArt contracts on Base Mainnet using Remix IDE (no CLI required).

## Prerequisites

1. **Base Mainnet Network**: Add Base to your MetaMask
   - Network Name: Base
   - RPC URL: https://mainnet.base.org
   - Chain ID: 8453
   - Currency: ETH

2. **Funds**: You need small amount of ETH on Base for gas fees

3. **MetaMask**: Connected to Base Mainnet

## Deployment Steps

### 1️⃣ Deploy BitArtNFT Contract

1. Go to **https://remix.ethereum.org/**

2. Create a new file: `BitArtNFT.sol`

3. Copy the entire `BitArtNFT.sol` code from this repository

4. In Remix:
   - **Compiler Tab** (left side):
     - Select Solidity Compiler
     - Set version to `0.8.19`
     - Click "Compile BitArtNFT.sol"
   
   - **Deploy & Run Transactions Tab**:
     - Environment: Select "Injected Provider - MetaMask"
     - Contract: Select "BitArtNFT"
     - Click "Deploy" button
     - **Approve transaction in MetaMask**
     - ⏳ Wait for confirmation
     - ✅ Copy the contract address from the console

   **Save this address as: `NFT_CONTRACT_ADDRESS`**

---

### 2️⃣ Deploy BitArtMarketplace Contract

1. Create a new file: `BitArtMarketplace.sol`

2. Copy the entire `BitArtMarketplace.sol` code from this repository

3. In Remix:
   - **Compiler Tab**:
     - Set version to `0.8.19`
     - Click "Compile BitArtMarketplace.sol"
   
   - **Deploy & Run Transactions Tab**:
     - Contract: Select "BitArtMarketplace"
     - Constructor argument: Paste `NFT_CONTRACT_ADDRESS` (from Step 1)
     - Click "Deploy" button
     - **Approve transaction in MetaMask**
     - ⏳ Wait for confirmation
     - ✅ Copy the contract address

   **Save this address as: `MARKETPLACE_CONTRACT_ADDRESS`**

---

### 3️⃣ Deploy BitArtAuction Contract

1. Create a new file: `BitArtAuction.sol`

2. Copy the entire `BitArtAuction.sol` code from this repository

3. In Remix:
   - **Compiler Tab**:
     - Set version to `0.8.19`
     - Click "Compile BitArtAuction.sol"
   
   - **Deploy & Run Transactions Tab**:
     - Contract: Select "BitArtAuction"
     - Constructor argument: Paste `NFT_CONTRACT_ADDRESS` (from Step 1)
     - Click "Deploy" button
     - **Approve transaction in MetaMask**
     - ⏳ Wait for confirmation
     - ✅ Copy the contract address

   **Save this address as: `AUCTION_CONTRACT_ADDRESS`**

---

## ✅ Deployment Summary

After all three deployments, you should have:

```
NFT Contract Address:        0x...
Marketplace Contract Address: 0x...
Auction Contract Address:     0x...
```

## 🔗 Next Steps

1. **Update your configuration files** with these addresses:
   - Update `frontend/.env.local`
   - Update `backend/.env.local`

2. **Verify on Basescan** (optional):
   - Go to https://basescan.org
   - Search for each contract address
   - Click "Code" tab
   - Click "Is this a proxy?" → "Verify & Publish"
   - Select compiler version `0.8.19`
   - Paste contract code
   - Click "Verify and Publish"

3. **Test the contracts**:
   - In Remix, expand the deployed contract
   - Test functions like `mint()`, `listNFT()`, etc.

## 🐛 Troubleshooting

### "Gas estimation failed"
- Make sure you have enough ETH on Base for gas
- Check that the NFT address is correct in marketplace/auction

### "Contract not found in Remix"
- Make sure you've compiled the contract (compiler tab)
- Check that all imports are available

### "MetaMask not connected"
- Click "Connect Wallet" in Remix
- Make sure you're on Base Mainnet in MetaMask

### "Transaction failed"
- Check gas limit in MetaMask (increase if needed)
- Make sure you have enough ETH for gas fees

## 📝 Contract Integration

Once deployed, update your application configuration:

**frontend/.env.local:**
```
VITE_NFT_CONTRACT=0x...
VITE_MARKETPLACE_CONTRACT=0x...
VITE_AUCTION_CONTRACT=0x...
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_BASE_CHAIN_ID=0x2105
```

**backend/.env.local:**
```
NFT_CONTRACT=0x...
MARKETPLACE_CONTRACT=0x...
AUCTION_CONTRACT=0x...
BASE_RPC_URL=https://mainnet.base.org
```

## 🎉 Done!

Your BitArt contracts are now live on Base Mainnet!

For more info, visit:
- Basescan: https://basescan.org
- Base Docs: https://docs.base.org
- Remix: https://remix.ethereum.org
