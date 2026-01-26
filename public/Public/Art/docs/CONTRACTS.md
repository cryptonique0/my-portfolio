# Smart Contracts Documentation

## Overview

BitArt Market uses three main Clarity smart contracts:
1. **nft.clar** - NFT creation and management
2. **marketplace.clar** - Listing and trading
3. **auction.clar** - Auction functionality

## NFT Contract (nft.clar)

### Purpose
Manages NFT creation, ownership, and metadata storage with royalty support.

### Data Structures

#### nft-metadata
Stores all NFT information:
```clarity
{
  creator: principal,           ;; Creator address
  owner: principal,             ;; Current owner
  name: (string-utf8 256),      ;; NFT name
  description: (string-utf8 1024), ;; Description
  image-uri: (string-utf8 512), ;; IPFS image URL
  category: (string-utf8 64),   ;; Category tag
  royalty-percentage: uint,     ;; 0-25% royalty
  total-supply: uint,           ;; Total supply
  created-at: uint,             ;; Block height created
  updated-at: uint              ;; Last update block
}
```

#### nft-balances
Tracks ownership amounts per user per NFT.

### Key Functions

#### `mint-nft`
Creates a new NFT with metadata.

**Parameters:**
- `name` - NFT name
- `description` - NFT description
- `image-uri` - IPFS URL for image
- `category` - Category tag
- `royalty-percentage` - Creator royalty (0-25%)
- `amount` - Initial supply

**Returns:** NFT ID

**Safety:**
- Validates royalty between 0-25%
- Validates amount > 0
- Stores in immutable maps

**Example:**
```clarity
(mint-nft
  u"My Digital Art"
  u"A beautiful digital creation"
  u"ipfs://QmXxxx"
  u"art"
  u10
  u1
)
```

#### `transfer-nft`
Transfer NFT ownership with quantity support.

**Parameters:**
- `nft-id` - NFT to transfer
- `recipient` - Destination address
- `amount` - Quantity to transfer

**Returns:** Boolean

**Safety:**
- Checks NFT exists
- Validates sender has sufficient balance
- Updates both sender and recipient balances
- Updates metadata owner

#### Admin Functions

**`add-admin(address)`** - Add admin address (owner only)
**`remove-admin(address)`** - Remove admin address (owner only)

### Read-Only Functions

#### `get-nft-metadata(nft-id)`
Returns complete NFT metadata or error.

#### `get-nft-balance(owner, nft-id)`
Returns quantity owned by address.

#### `get-total-nfts()`
Returns total NFT count.

#### `get-royalty(nft-id)`
Returns royalty percentage.

#### `owns-nft(owner, nft-id)`
Boolean check if address owns NFT.

## Marketplace Contract (marketplace.clar)

### Purpose
Handles NFT listing, price updates, and purchases with royalty distribution.

### Data Structures

#### listings
```clarity
{
  seller: principal,
  price: uint,
  quantity: uint,
  listed-at: uint,
  expires-at: uint
}
```

### Key Functions

#### `list-nft`
Create marketplace listing.

**Parameters:**
- `nft-id` - NFT to list
- `price` - Price in microSTX
- `quantity` - Quantity available
- `duration` - Duration in blocks

**Returns:** Listing ID

**Safety:**
- Validates NFT not already listed
- Validates price > 0
- Validates quantity > 0
- Prevents duplicate listings

**Post-conditions:** NFT ownership must be verified before transfer

#### `update-listing-price`
Update price of active listing.

**Parameters:**
- `nft-id` - NFT listing to update
- `new-price` - New price

**Returns:** Boolean

**Safety:**
- Only seller can update
- Validates new price > 0
- Listing must exist

#### `cancel-listing`
Remove listing from marketplace.

**Parameters:**
- `nft-id` - NFT listing to cancel

**Returns:** Boolean

**Safety:**
- Only seller can cancel
- Listing must exist

#### `buy-nft`
Purchase NFT from listing.

**Parameters:**
- `nft-id` - NFT to purchase
- `quantity` - Quantity to buy

**Returns:** Transaction details

**Safety:**
- Validates quantity available
- Calculates platform fee
- Returns payment breakdown

**Post-conditions:**
- STX transferred to seller (minus fees)
- Platform fee sent to fee recipient
- NFT ownership transferred to buyer

### Fee Structure

```
Total Price = Unit Price × Quantity
Platform Fee = Total Price × 2.5%
Seller Amount = Total Price - Platform Fee
Creator Royalty = (Resale Amount) × Royalty%
```

### Read-Only Functions

#### `get-listing(nft-id)`
Returns listing details or error.

#### `is-listed(nft-id)`
Boolean check if NFT is listed.

#### `get-platform-fee()`
Returns platform fee in basis points.

#### `calculate-total-cost(price, quantity)`
Returns total cost including fees.

## Auction Contract (auction.clar)

### Purpose
Manages NFT auctions with bidding and countdown timer.

### Data Structures

#### auctions
```clarity
{
  nft-id: uint,
  seller: principal,
  current-bid: uint,
  highest-bidder: principal,
  reserve-price: uint,
  start-height: uint,
  end-height: uint,
  is-ended: bool
}
```

#### bids
Tracks individual bids for refund tracking.

### Key Functions

#### `create-auction`
Start a new auction.

**Parameters:**
- `nft-id` - NFT to auction
- `reserve-price` - Minimum acceptable bid
- `duration` - Duration in blocks

**Returns:** Auction ID

**Safety:**
- Validates reserve-price > 0
- Calculates end time from duration

#### `place-bid`
Place bid on active auction.

**Parameters:**
- `auction-id` - Auction to bid on
- `bid-amount` - Bid amount

**Returns:** Bid amount

**Safety:**
- Validates auction is active
- Validates bid exceeds minimum increment (1%)
- Previous bid is tracked for refund

**Post-conditions:**
- Previous bidder receives refund
- New bid locked in contract

#### `end-auction`
Close auction (after end-height).

**Parameters:**
- `auction-id` - Auction to end

**Returns:** Boolean

**Safety:**
- Only after end-height
- Can only be ended once

#### `claim-auction`
Winner claims NFT, loser claims refund.

**Parameters:**
- `auction-id` - Auction to claim

**Returns:** Claim details

**Safety:**
- Only winner or seller can claim
- Auction must be ended

### Read-Only Functions

#### `get-auction(auction-id)`
Returns auction details.

#### `is-auction-active(auction-id)`
Boolean check if auction is active.

#### `get-minimum-next-bid(auction-id)`
Returns minimum bid to outbid current highest.

## Security Features

### Post-Conditions
All state-modifying functions use post-conditions to ensure:
- NFT transfers complete before balance updates
- STX transfers succeed before ownership changes
- Royalties are correctly distributed

### Input Validation
- All string lengths validated
- Numeric ranges checked (royalty 0-25%)
- Principal addresses verified
- Quantities > 0

### Access Control
- Admin functions restricted to contract owner
- Transfers only by token holder
- Listing updates only by seller
- Auction bidding open to all (with balance check)

## Deployment

### Testnet Deployment
```bash
cd contracts
clarinet deploy --network testnet
```

### Mainnet Deployment
```bash
clarinet deploy --network mainnet
```

**IMPORTANT:** Always test on testnet first!

## Testing

Each contract includes test cases:

```bash
clarinet test
```

Tests cover:
- Happy path scenarios
- Error conditions
- Edge cases
- Access control
- State management

## Integration with Frontend

Frontend calls smart contracts via:
1. **Stacks.js** - For transaction signing
2. **Stacks API** - For read-only calls
3. **Wallet** - For user approval

Example:
```typescript
// Read data
const metadata = await stacksApi.callReadOnlyFunction(
  contractId,
  'get-nft-metadata',
  [nftId]
);

// Write data
const tx = await wallet.transfer({
  to: marketplaceAddress,
  amount: price,
  postConditions: [/* ... */]
});
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| ERR-UNAUTHORIZED (401) | Not admin/owner | Use correct wallet address |
| ERR-NOT-FOUND (404) | NFT/listing doesn't exist | Verify ID is correct |
| ERR-INVALID-INPUT (400) | Bad parameters | Check all required fields |
| ERR-ALREADY-LISTED (409) | NFT already on sale | Cancel existing listing first |
| ERR-INVALID-ROYALTY (402) | Royalty > 25% | Use 0-25% only |
| ERR-INVALID-PRICE (403) | Price <= 0 | Use positive amounts |
| ERR-AUCTION-EXPIRED (405) | Auction time passed | Auction ended, cannot bid |

## Gas Optimization

- Batch operations when possible
- Use appropriate data types
- Avoid unnecessary state updates
- Cache read-only results

## Future Enhancements

1. **Fractional NFTs** - Split ownership
2. **Lazy Minting** - Mint on purchase
3. **DAO Governance** - Community voting
4. **Cross-contract NFTs** - Bridge compatibility
5. **Advanced Royalty Splits** - Multiple beneficiaries
