# Supabase Integration - Usage Examples & Best Practices

## Overview
Practical examples for using the Supabase database services in BitArt Market.

## 1. User Management

### Register/Create User Profile
```typescript
import { UserService } from '../services/user.service';

async function registerUser(walletAddress: string) {
  const user = await UserService.upsertUser(walletAddress, {
    username: 'newuser123',
    email: 'user@example.com',
    bio: 'Digital artist',
    avatar_url: 'https://example.com/avatar.jpg',
    role: 'creator',
    verified: false,
    follower_count: 0,
  });

  return user;
}
```

### Get User Profile with Statistics
```typescript
async function getUserProfile(userId: string) {
  const profile = await UserService.getUserProfile(userId);
  // Returns: {
  //   id, username, email, bio, avatar_url,
  //   nfts_count, created_nfts_count,
  //   followers_count, following_count,
  //   sales_count
  // }
  return profile;
}
```

### Search Users
```typescript
async function searchCreators(query: string) {
  const creators = await UserService.searchUsers(query, 20);
  return creators.filter(u => u.role === 'creator');
}
```

---

## 2. NFT Operations

### Create NFT Listing
```typescript
import { NFTService } from '../services/nft.service';

async function mintAndListNFT(
  tokenId: string,
  creatorId: string,
  nftData: any
) {
  const nft = await NFTService.createNFT({
    token_id: tokenId,
    blockchain: 'bitcoin',
    name: nftData.name,
    description: nftData.description,
    image_url: nftData.imageUrl,
    owner_id: creatorId,
    creator_id: creatorId,
    royalty_percentage: 10,
    for_sale: false,
    price: null,
  });

  return nft;
}
```

### List NFT for Sale
```typescript
async function listNFTForSale(nftId: string, price: number) {
  const success = await NFTService.listNFT(nftId, price);
  if (success) {
    // Track event
    await AnalyticsService.trackEvent(
      'nft_listed',
      undefined,
      nftId,
      { price }
    );
  }
  return success;
}
```

### Get NFT Details with Owner Info
```typescript
async function getNFTMarketplace(nftId: string) {
  const nft = await NFTService.getNFTDetails(nftId);
  // Returns complete info including owner, creator, auctions
  return {
    nft: nft,
    owner: nft.owner,
    creator: nft.creator,
    auctions: nft.auctions,
  };
}
```

### Get User's NFT Collection
```typescript
async function getUserCollection(userId: string) {
  const nfts = await NFTService.getNFTsByOwner(userId, 50, 0);
  return nfts;
}
```

---

## 3. Marketplace Transactions

### Purchase NFT
```typescript
import { TransactionService } from '../services/transaction.service';
import { NotificationService } from '../services/notification.service';

async function purchaseNFT(
  nftId: string,
  buyerId: string,
  transactionHash: string
) {
  // Get NFT details
  const nft = await NFTService.getNFTById(nftId);
  if (!nft || !nft.for_sale) {
    throw new Error('NFT not available');
  }

  // Create transaction record
  const transaction = await TransactionService.createTransaction({
    type: 'sale',
    nft_id: nftId,
    seller_id: nft.owner_id,
    buyer_id: buyerId,
    price: nft.price.toString(),
    transaction_hash: transactionHash,
    status: 'pending',
  });

  // Transfer ownership
  await NFTService.transferNFT(nftId, buyerId);

  // Update transaction status
  await TransactionService.updateTransactionStatus(
    transaction.id,
    'completed'
  );

  // Notify seller
  const seller = await UserService.getUserById(nft.owner_id);
  const buyer = await UserService.getUserById(buyerId);
  
  await NotificationService.notifyPurchase(
    nft.owner_id,
    buyer.username,
    nft.name
  );

  // Track event
  await AnalyticsService.trackEvent(
    'nft_purchased',
    buyerId,
    nftId,
    { seller_id: nft.owner_id, price: nft.price }
  );

  return transaction;
}
```

### Get User Sales History
```typescript
async function getUserSalesHistory(userId: string) {
  const sales = await TransactionService.getUserSales(userId, 50, 0);
  const totalVolume = await TransactionService.getUserVolume(userId);

  return {
    sales,
    totalVolume,
    salesCount: sales.length,
  };
}
```

### Get Platform Statistics
```typescript
async function getMarketplaceStats() {
  const stats = await AnalyticsService.getPlatformStats();
  const recentSales = await TransactionService.getRecentSales(10);

  return {
    totalUsers: stats.users,
    totalNFTs: stats.nfts,
    totalTransactions: stats.totalTransactions,
    totalVolume: stats.totalVolume,
    recentSales,
  };
}
```

---

## 4. Auction System

### Create Auction
```typescript
import { AuctionService } from '../services/auction.service';

async function createAuction(
  nftId: string,
  creatorId: string,
  startPrice: number,
  durationHours: number
) {
  const endDate = new Date();
  endDate.setHours(endDate.getHours() + durationHours);

  const auction = await AuctionService.createAuction({
    nft_id: nftId,
    creator_id: creatorId,
    start_price: startPrice,
    current_price: startPrice,
    highest_bidder_id: null,
    status: 'active',
    end_date: endDate.toISOString(),
  });

  return auction;
}
```

### Place Bid
```typescript
async function placeBid(
  auctionId: string,
  bidderId: string,
  amount: number
) {
  const bid = await AuctionService.placeBid(auctionId, bidderId, amount);

  if (bid) {
    // Notify previous bidder if exists
    const auction = await AuctionService.getAuctionById(auctionId);
    
    if (auction && auction.highest_bidder_id !== bidderId) {
      const bidder = await UserService.getUserById(bidderId);
      const auctionCreator = await UserService.getUserById(auction.creator_id);
      
      await NotificationService.notifyAuctionBid(
        auctionCreator.id,
        bidder.username,
        'NFT',
        amount
      );
    }

    // Track event
    await AnalyticsService.trackEvent(
      'auction_bid_placed',
      bidderId,
      auction.nft_id,
      { amount, auction_id: auctionId }
    );
  }

  return bid;
}
```

### Get Auctions Ending Soon
```typescript
async function getEndingAuctions() {
  const auctions = await AuctionService.getEndingSoonAuctions(24, 10);
  const auctionsWithDetails = await Promise.all(
    auctions.map(a => AuctionService.getAuctionDetails(a.id))
  );

  return auctionsWithDetails;
}
```

---

## 5. Social Features

### Follow Creator
```typescript
import { FollowService } from '../services/follow.service';

async function followCreator(followerId: string, creatorId: string) {
  const follow = await FollowService.followUser(followerId, creatorId);

  if (follow) {
    // Update follower count
    await UserService.updateFollowerCount(creatorId, true);

    // Send notification
    const follower = await UserService.getUserById(followerId);
    await NotificationService.notifyFollow(creatorId, follower.username);
  }

  return follow;
}
```

### Get Creator Followers
```typescript
async function getCreatorProfile(userId: string) {
  const user = await UserService.getUserProfile(userId);
  const followers = await FollowService.getFollowers(userId, 10);
  const following = await FollowService.getFollowing(userId, 10);

  return {
    ...user,
    followers: followers.length,
    following: following.length,
    topFollowers: followers.slice(0, 5),
  };
}
```

### Get Mutual Followers
```typescript
async function getMutualFollowers(user1Id: string, user2Id: string) {
  const mutual = await FollowService.getMutualFollowers(user1Id, user2Id);
  return mutual;
}
```

---

## 6. Notifications

### Get User Notifications
```typescript
import { NotificationService } from '../services/notification.service';

async function getUserNotifications(userId: string) {
  const unreadCount = await NotificationService.getUnreadCount(userId);
  const notifications = await NotificationService.getUserNotifications(userId, 20, 0);

  return {
    unreadCount,
    notifications,
    hasUnread: unreadCount > 0,
  };
}
```

### Mark All Notifications as Read
```typescript
async function markAllRead(userId: string) {
  await NotificationService.markAllAsRead(userId);
  return { status: 'success' };
}
```

---

## 7. Offers & Negotiations

### Create Offer
```typescript
import { OfferService } from '../services/offer.service';

async function makeOffer(
  nftId: string,
  proposerId: string,
  recipientId: string,
  amount: number,
  expiryDays: number = 7
) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  const offer = await OfferService.createOffer({
    nft_id: nftId,
    proposer_id: proposerId,
    recipient_id: recipientId,
    amount,
    status: 'pending',
    expiry_date: expiryDate.toISOString(),
  });

  if (offer) {
    // Notify recipient
    const proposer = await UserService.getUserById(proposerId);
    await NotificationService.notifyOffer(
      recipientId,
      proposer.username,
      'NFT',
      amount
    );
  }

  return offer;
}
```

### Get Best Offer for NFT
```typescript
async function getBestOffer(nftId: string) {
  const bestOffer = await OfferService.getHighestOffer(nftId);
  if (bestOffer) {
    const proposer = await UserService.getUserById(bestOffer.proposer_id);
    return {
      ...bestOffer,
      proposer,
    };
  }
  return null;
}
```

### Accept Offer
```typescript
async function acceptOffer(offerId: string) {
  // Mark as accepted
  const success = await OfferService.acceptOffer(offerId);

  if (success) {
    // Create transaction
    const offer = await OfferService.getOfferById(offerId);
    const nft = await NFTService.getNFTById(offer.nft_id);

    const transaction = await TransactionService.createTransaction({
      type: 'offer_accepted',
      nft_id: offer.nft_id,
      seller_id: nft.owner_id,
      buyer_id: offer.proposer_id,
      price: offer.amount.toString(),
      transaction_hash: 'pending',
      status: 'pending',
    });

    // Transfer NFT
    await NFTService.transferNFT(offer.nft_id, offer.proposer_id);
  }

  return success;
}
```

---

## 8. Collections

### Create Collection
```typescript
import { CollectionService } from '../services/collection.service';

async function createCollection(
  creatorId: string,
  collectionData: any
) {
  const collection = await CollectionService.createCollection({
    creator_id: creatorId,
    name: collectionData.name,
    description: collectionData.description,
    image_url: collectionData.imageUrl,
    banner_url: collectionData.bannerUrl,
    floor_price: null,
    volume: 0,
    item_count: 0,
  });

  return collection;
}
```

### Get Collection with Items
```typescript
async function getCollectionDetails(collectionId: string) {
  const collection = await CollectionService.getCollectionWithItems(collectionId, 50);
  
  return {
    ...collection,
    itemCount: collection.items?.length || 0,
    floorPrice: collection.floor_price,
    volume: collection.volume,
  };
}
```

### Update Collection Stats
```typescript
async function updateCollectionStatistics(collectionId: string) {
  const success = await CollectionService.updateCollectionStats(collectionId);
  return success;
}
```

---

## 9. Analytics & Search

### Track User Event
```typescript
import { AnalyticsService } from '../services/analytics.service';

async function trackUserActivity(
  userId: string,
  eventType: string,
  metadata?: any
) {
  return await AnalyticsService.trackEvent(
    eventType,
    userId,
    undefined,
    metadata
  );
}
```

### Get Trending NFTs
```typescript
async function getTrending() {
  const trendingNFTs = await NFTService.getTrendingNFTs(10);
  const trendingCreators = await UserService.getTrendingCreators(10);
  const trendingCollections = await CollectionService.getTrendingCollections(10);

  return {
    nfts: trendingNFTs,
    creators: trendingCreators,
    collections: trendingCollections,
  };
}
```

### Get Popular Searches
```typescript
async function getSearchTrends() {
  const searches = await AnalyticsService.getPopularSearches(10);
  return searches;
}
```

---

## 10. Error Handling

### Try-Catch Pattern
```typescript
async function safeNFTOperation(nftId: string) {
  try {
    const nft = await NFTService.getNFTById(nftId);
    
    if (!nft) {
      throw new Error('NFT not found');
    }

    return nft;
  } catch (error) {
    logger.error(`Failed to get NFT ${nftId}:`, error);
    throw error;
  }
}
```

### Validation Pattern
```typescript
async function validatePurchase(nftId: string, buyerId: string, price: number) {
  const nft = await NFTService.getNFTById(nftId);
  
  if (!nft) throw new Error('NFT not found');
  if (!nft.for_sale) throw new Error('NFT not for sale');
  if (nft.price !== price) throw new Error('Price mismatch');
  if (buyerId === nft.owner_id) throw new Error('Cannot buy own NFT');

  return true;
}
```

---

## Performance Tips

1. **Use Pagination**: Always paginate when fetching lists
```typescript
const nfts = await NFTService.getNFTsByOwner(userId, 50, offset);
```

2. **Batch Operations**: Use Promise.all for parallel queries
```typescript
const [users, nfts, auctions] = await Promise.all([
  Promise.all(userIds.map(id => UserService.getUserById(id))),
  NFTService.getNFTsForSale(50),
  AuctionService.getActiveAuctions(50),
]);
```

3. **Cache Results**: Store frequently accessed data
```typescript
const cachedStats = await redis.get('platform:stats');
if (!cachedStats) {
  const stats = await AnalyticsService.getPlatformStats();
  await redis.set('platform:stats', stats, 'EX', 3600);
}
```

4. **Index Usage**: Queries use indexes automatically on:
- wallet_address, username, owner_id, creator_id
- for_sale, status, created_at

---

## Security Best Practices

1. **Validate Input**: Always validate user inputs
2. **Use Service Role**: Admin operations use SUPABASE_SERVICE_ROLE_KEY
3. **Check Ownership**: Verify user owns resource before modifying
4. **Rate Limiting**: Apply rate limits to API endpoints
5. **Logging**: Log all important operations

---

## Testing

```typescript
// Example test
async function testUserFlow() {
  // Create user
  const user = await UserService.upsertUser('wallet123', {
    username: 'testuser',
  });

  // Create NFT
  const nft = await NFTService.createNFT({
    token_id: '1',
    owner_id: user.id,
    creator_id: user.id,
    name: 'Test NFT',
    // ... other fields
  });

  // List for sale
  await NFTService.listNFT(nft.id, 10.5);

  // Purchase
  const buyer = await UserService.upsertUser('buyer_wallet', {
    username: 'buyer',
  });

  const tx = await purchaseNFT(nft.id, buyer.id, 'hash123');

  console.log('Test complete:', tx);
}
```

---

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for deployment instructions.
