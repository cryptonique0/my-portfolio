# How to Deploy on Remix - Quick Reference

## 🎯 Three Simple Steps

### Step 1: Deploy BitArtNFT
1. Open https://remix.ethereum.org
2. Create file `BitArtNFT.sol`
3. Copy code from `contracts/solidity/BitArtNFT.sol` in GitHub
4. Compiler: Select `0.8.19`
5. Deploy (environment: Injected Provider - MetaMask)
6. **SAVE ADDRESS** → `NFT_CA`

### Step 2: Deploy BitArtMarketplace
1. Create file `BitArtMarketplace.sol`
2. Copy code from `contracts/solidity/BitArtMarketplace.sol` in GitHub
3. Compiler: Select `0.8.19`
4. Deploy with constructor parameter: `NFT_CA` (from Step 1)
5. **SAVE ADDRESS** → `MARKETPLACE_CA`

### Step 3: Deploy BitArtAuction
1. Create file `BitArtAuction.sol`
2. Copy code from `contracts/solidity/BitArtAuction.sol` in GitHub
3. Compiler: Select `0.8.19`
4. Deploy with constructor parameter: `NFT_CA` (from Step 1)
5. **SAVE ADDRESS** → `AUCTION_CA`

---

## ⚙️ Important Prerequisites

**MetaMask Setup:**
- Network: Base Mainnet
- RPC: https://mainnet.base.org
- Chain ID: 8453
- Gas fee: Have some ETH ready

**Remix Compiler:**
- Version: 0.8.19 (IMPORTANT!)
- Optimization: Enabled (200 runs)

---

## 📝 Configuration After Deployment

Send these three contract addresses to update:

```
📧 Send to Project Owner:

NFT Contract:        0x___________________________________________
Marketplace:         0x___________________________________________
Auction:             0x___________________________________________
```

---

## 🔗 Resources

| Resource | Link |
|----------|------|
| Remix IDE | https://remix.ethereum.org |
| Base Docs | https://docs.base.org |
| Basescan | https://basescan.org |
| GitHub Repo | https://github.com/cryptonique0/BitArt-Market |

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't** use compiler version other than 0.8.19
❌ **Don't** forget to save contract addresses
❌ **Don't** mix up the constructor arguments (NFT_CA)
❌ **Don't** deploy without connecting MetaMask to Base
❌ **Don't** deploy without ETH for gas fees

✅ **Do** compile before deploying
✅ **Do** use "Injected Provider" (MetaMask)
✅ **Do** save all three addresses in order
✅ **Do** verify network is Base Mainnet
✅ **Do** copy exact code from GitHub

---

## 🚀 You're Ready!

Visit https://remix.ethereum.org and deploy! 🎉
