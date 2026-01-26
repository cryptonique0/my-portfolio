# BitArt Solidity Contracts

Solidity smart contracts for BitArt Market on Base Mainnet.

## Deployed Contracts on Base Mainnet

- **BitArtNFT**: `0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682`
  - Verify on [BaseScan](https://basescan.org/address/0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682)

- **BitArtMarketplace**: `0x7d28443e3571faB3821d669537E45484E4A06AC9`
  - Verify on [BaseScan](https://basescan.org/address/0x7d28443e3571faB3821d669537E45484E4A06AC9)

- **BitArtAuction**: `0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2`
  - Verify on [BaseScan](https://basescan.org/address/0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2)

### ✅ All Contracts Deployed!

All three contracts are now live on Base Mainnet. You can verify and interact with them on BaseScan.

---

## Contracts

### 1. BitArtNFT (ERC721)
NFT contract for BitArt Market with full metadata and royalty support.

**Features:**
- ERC721 standard compliance
- Metadata storage (name, description, category, royalty percentage)
- EIP-2981 royalty standard support
- Creator tracking
- Admin management

**Key Functions:**
- `mint()` - Mint a new NFT
- `updateMetadata()` - Update NFT metadata
- `updateRoyalty()` - Update royalty percentage
- `getMetadata()` - Retrieve NFT metadata
- `royaltyInfo()` - Get royalty information (EIP-2981)

### 2. BitArtMarketplace
Marketplace contract for buying/selling NFTs with automatic royalty distribution.

**Features:**
- NFT listing and sale
- Automatic royalty distribution to creators
- Platform fee collection
- Seller balance management
- Admin controls

**Key Functions:**
- `listNFT()` - List an NFT for sale
- `buyNFT()` - Purchase an NFT
- `updateListingPrice()` - Change listing price
- `cancelListing()` - Remove a listing
- `withdrawBalance()` - Withdraw seller proceeds

### 3. BitArtAuction
Auction contract for NFT bidding with reserve prices.

**Features:**
- Auction creation and management
- Minimum bid increment enforcement
- Bid history tracking
- Automatic balance distribution
- Royalty payment to creators

**Key Functions:**
- `createAuction()` - Create new auction
- `placeBid()` - Place a bid
- `endAuction()` - End auction (after duration)
- `claimAuction()` - Claim NFT/proceeds
- `withdrawBalance()` - Withdraw pending balance

## Deployment via Remix

### Step 1: Open Remix IDE
1. Go to https://remix.ethereum.org/
2. Create a new workspace

### Step 2: Deploy BitArtNFT

1. Create file: `BitArtNFT.sol`
2. Copy the entire code from `BitArtNFT.sol` in this repository
3. In Remix:
   - Select compiler version `0.8.19`
   - Click "Compile BitArtNFT.sol"
   - Go to "Deploy & Run Transactions" tab
   - Select "Base" network from chain selector
   - Click "Deploy"
4. **Save the deployed contract address** (e.g., `0x...`)

### Step 3: Deploy BitArtMarketplace

1. Create file: `BitArtMarketplace.sol`
2. Copy the entire code from `BitArtMarketplace.sol` in this repository
3. In Remix:
   - Select compiler version `0.8.19`
   - Click "Compile BitArtMarketplace.sol"
   - In deploy constructor, paste the **BitArtNFT address** from Step 2
   - Click "Deploy"
4. **Save the deployed contract address**

### Step 4: Deploy BitArtAuction

1. Create file: `BitArtAuction.sol`
2. Copy the entire code from `BitArtAuction.sol` in this repository
3. In Remix:
   - Select compiler version `0.8.19`
   - Click "Compile BitArtAuction.sol"
   - In deploy constructor, paste the **BitArtNFT address** from Step 2
   - Click "Deploy"
4. **Save the deployed contract address**

## Configuration

### Platform Fee
- Default: 2.5% (250 basis points)
- Configurable via `setPlatformFee()`
- Max: 10% (1000 basis points)

### Royalty
- Max: 50% (5000 basis points)
- Enforced in NFT mint and royalty update functions
- Follows EIP-2981 standard

## Deployed Contract Addresses (Base Mainnet)

Deployed via Remix on Base Mainnet:

```
BitArtNFT:          0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682 ✅
BitArtMarketplace:  TBD (deploy with NFT address above)
BitArtAuction:      TBD (deploy with NFT address above)
```

**Next Steps:**
1. Deploy BitArtMarketplace with constructor: `0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682`
2. Deploy BitArtAuction with constructor: `0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682`

## Security

- Uses OpenZeppelin's audited ERC721 implementation
- Includes ReentrancyGuard for critical functions
- Owner-based access control
- Admin management system

## License

MIT
