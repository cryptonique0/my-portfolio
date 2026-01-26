# Supabase Database Integration - Complete Implementation

## Overview
Complete Supabase PostgreSQL integration for BitArt Market with user profiles, NFT metadata, transactions, auctions, and analytics.

## Database Architecture

### Tables Created

#### 1. **users**
Stores user profiles and account information.
- Fields: id, wallet_address, username, email, bio, avatar_url, verified, role, follower_count
- Indexes: wallet_address, username, verified, role
- Relations: creator_id (nfts), follower_id (follows)

#### 2. **nfts**
Stores NFT metadata and ownership information.
- Fields: id, token_id, blockchain, name, description, image_url, owner_id, creator_id, price, for_sale, collection_id, royalty_percentage
- Indexes: token_id, owner_id, creator_id, for_sale, collection_id
- Relations: owner_id, creator_id (users), collection_id (collections)

#### 3. **transactions**
Records all NFT purchase transactions.
- Fields: id, type, nft_id, seller_id, buyer_id, price, transaction_hash, status
- Indexes: nft_id, seller_id, buyer_id, status
- Relations: nft_id, seller_id, buyer_id (users)

#### 4. **auctions**
Manages timed NFT auctions.
- Fields: id, nft_id, creator_id, start_price, current_price, highest_bidder_id, status, end_date
- Indexes: nft_id, status, end_date
- Relations: nft_id, creator_id, highest_bidder_id (users)

#### 5. **bids**
Records auction bids.
- Fields: id, auction_id, bidder_id, amount, status
- Indexes: auction_id, bidder_id, status
- Relations: auction_id, bidder_id (users)

#### 6. **offers**
Direct purchase offers to NFT owners.
- Fields: id, nft_id, proposer_id, recipient_id, amount, status, expiry_date
- Indexes: nft_id, status, expiry_date
- Relations: nft_id, proposer_id, recipient_id (users)

#### 7. **notifications**
User notifications for activities.
- Fields: id, user_id, type, title, message, data, read
- Indexes: user_id, read, created_at
- Relations: user_id (users)

#### 8. **follows**
Social graph - user follow relationships.
- Fields: id, follower_id, following_id
- Indexes: follower_id, following_id
- Relations: follower_id, following_id (users)

#### 9. **collections**
NFT collections (grouping of related NFTs).
- Fields: id, creator_id, name, description, image_url, banner_url, floor_price, volume, item_count
- Indexes: creator_id, created_at
- Relations: creator_id (users)

#### 10. **analytics**
Event tracking and analytics data.
- Fields: id, event_type, user_id, nft_id, metadata
- Indexes: event_type, user_id, created_at
- Relations: user_id, nft_id (users, nfts)

## Services Implemented

### UserService
Manages user profiles and authentication data.

```typescript
// Methods:
UserService.upsertUser(walletAddress, userData)    // Create/update
UserService.getUserById(userId)                     // Fetch by ID
UserService.getUserByWallet(walletAddress)          // Fetch by wallet
UserService.getUserByUsername(username)             // Search by username
UserService.getUserProfile(userId)                  // Full profile with stats
UserService.searchUsers(query, limit)               // Search users
UserService.getTrendingCreators(limit)              // Top creators
UserService.verifyUser(userId)                      // Verify badge
UserService.updateFollowerCount(userId, increment)  // Update count
```

### NFTService
Handles NFT metadata and listing operations.

```typescript
// Methods:
NFTService.createNFT(nftData)                       // Mint NFT
NFTService.getNFTById(nftId)                        // Fetch by ID
NFTService.getNFTsByOwner(ownerId, limit, offset)   // List owned
NFTService.getNFTsByCreator(creatorId, limit, offset) // Created by
NFTService.getNFTsForSale(limit, offset)            // Available NFTs
NFTService.updateNFT(nftId, updates)                // Update metadata
NFTService.listNFT(nftId, price)                    // List for sale
NFTService.delistNFT(nftId)                         // Remove from sale
NFTService.transferNFT(nftId, newOwnerId)           // Change owner
NFTService.getNFTDetails(nftId)                     // Full details
NFTService.searchNFTs(query, limit)                 // Search NFTs
NFTService.getTrendingNFTs(limit)                   // Trending NFTs
NFTService.getCollectionFloorPrice(collectionId)    // Floor price
```

### TransactionService
Tracks NFT purchases and sales history.

```typescript
// Methods:
TransactionService.createTransaction(txData)        // Record sale
TransactionService.getTransactionById(txId)         // Fetch by ID
TransactionService.getTransactionByHash(hash)       // Blockchain hash lookup
TransactionService.getUserTransactionHistory(userId) // User history
TransactionService.getNFTTransactionHistory(nftId)  // NFT history
TransactionService.getUserSales(userId, limit)      // Sales made
TransactionService.getUserPurchases(userId, limit)  // Purchases made
TransactionService.updateTransactionStatus(txId, status) // Update status
TransactionService.getUserVolume(userId)            // Total sales value
TransactionService.getPlatformVolume()              // Total platform volume
TransactionService.getRecentSales(limit)            // Recent activity
```

### AuctionService
Manages timed auctions and bidding.

```typescript
// Methods:
AuctionService.createAuction(auctionData)           // Start auction
AuctionService.getAuctionById(auctionId)            // Fetch by ID
AuctionService.getAuctionByNFTId(nftId)             // NFT's auction
AuctionService.getActiveAuctions(limit, offset)     // Current auctions
AuctionService.getUserAuctions(userId, limit)       // User's auctions
AuctionService.placeBid(auctionId, bidderId, amount) // Place bid
AuctionService.getAuctionBids(auctionId, limit)     // All bids
AuctionService.getUserBids(userId, limit)           // User's bids
AuctionService.endAuction(auctionId)                // Close auction
AuctionService.cancelAuction(auctionId)             // Cancel auction
AuctionService.getAuctionDetails(auctionId)         // Full details
AuctionService.getEndingSoonAuctions(hours, limit)  // Expiring soon
```

### OfferService
Handles direct purchase offers.

```typescript
// Methods:
OfferService.createOffer(offerData)                 // Create offer
OfferService.getOfferById(offerId)                  // Fetch by ID
OfferService.getNFTOffers(nftId, limit)             // NFT offers
OfferService.getUserReceivedOffers(userId, limit)   // Offers received
OfferService.getUserSentOffers(userId, limit)       // Offers sent
OfferService.acceptOffer(offerId)                   // Accept offer
OfferService.rejectOffer(offerId)                   // Reject offer
OfferService.cancelOffer(offerId)                   // Cancel offer
OfferService.getActiveNFTOffers(nftId)              // Active offers
OfferService.getHighestOffer(nftId)                 // Best offer
```

### FollowService
Manages social graph and follows.

```typescript
// Methods:
FollowService.followUser(followerId, followingId)   // Follow user
FollowService.unfollowUser(followerId, followingId) // Unfollow
FollowService.getFollowers(userId, limit)           // Get followers
FollowService.getFollowing(userId, limit)           // Get following
FollowService.isFollowing(followerId, followingId)  // Check status
FollowService.getFollowerCount(userId)              // Count followers
FollowService.getFollowingCount(userId)             // Count following
FollowService.getMutualFollowers(userId1, userId2)  // Common follows
```

### NotificationService
Handles user notifications.

```typescript
// Methods:
NotificationService.createNotification(data)        // Create
NotificationService.getUserNotifications(userId)    // List
NotificationService.getUnreadNotifications(userId)  // Unread only
NotificationService.markAsRead(notificationId)      // Mark read
NotificationService.markAllAsRead(userId)           // Mark all
NotificationService.deleteNotification(notificationId) // Delete
NotificationService.getUnreadCount(userId)          // Count unread
NotificationService.notifyPurchase(...)             // Sale alert
NotificationService.notifyAuctionBid(...)           // Bid alert
NotificationService.notifyOffer(...)                // Offer alert
NotificationService.notifyFollow(...)               // Follow alert
```

### CollectionService
Manages NFT collections.

```typescript
// Methods:
CollectionService.createCollection(data)            // Create
CollectionService.getCollectionById(collectionId)   // Fetch by ID
CollectionService.getCreatorCollections(creatorId)  // Creator's collections
CollectionService.getAllCollections(limit)          // List all
CollectionService.updateCollection(id, updates)     // Update
CollectionService.getTrendingCollections(limit)     // Trending
CollectionService.searchCollections(query, limit)   // Search
CollectionService.getCollectionWithItems(id, limit) // Full details
CollectionService.updateCollectionStats(id)         // Refresh stats
```

### AnalyticsService
Tracks events and metrics.

```typescript
// Methods:
AnalyticsService.trackEvent(type, userId, nftId, metadata) // Track
AnalyticsService.getEventCount(type, hours)         // Count events
AnalyticsService.getUserActivity(userId, limit)     // User activity
AnalyticsService.getNFTAnalytics(nftId)             // NFT stats
AnalyticsService.getPlatformStats()                 // Platform metrics
AnalyticsService.getPopularSearches(limit)          // Top searches
AnalyticsService.getTrendingEvents(hours, limit)    // Trending events
```

## API Endpoints

### User Endpoints
```
GET    /api/db/users/:userId                   # Get user profile
GET    /api/db/users/wallet/:walletAddress     # Get by wallet
GET    /api/db/users/search                    # Search users
POST   /api/db/users/profile                   # Create/update
PUT    /api/db/users/:userId                   # Update profile
GET    /api/db/users/:userId/followers         # Get followers
GET    /api/db/users/:userId/following         # Get following
POST   /api/db/users/:userId/follow            # Follow user
DELETE /api/db/users/:userId/follow/:followerId# Unfollow
GET    /api/db/users/trending/creators         # Trending creators
```

### NFT Endpoints
```
GET    /api/db/nfts                            # List NFTs
GET    /api/db/nfts/:nftId                     # Get NFT details
GET    /api/db/nfts/search                     # Search NFTs
GET    /api/db/nfts/trending                   # Trending NFTs
GET    /api/db/nfts/owner/:ownerId             # Owner's NFTs
GET    /api/db/nfts/creator/:creatorId         # Creator's NFTs
POST   /api/db/nfts                            # Create NFT
PUT    /api/db/nfts/:nftId                     # Update NFT
POST   /api/db/nfts/:nftId/list                # List for sale
POST   /api/db/nfts/:nftId/delist              # Remove from sale
POST   /api/db/nfts/:nftId/purchase            # Buy NFT
```

### Auction Endpoints
```
GET    /api/db/auctions                        # List active auctions
GET    /api/db/auctions/:auctionId             # Get auction details
GET    /api/db/auctions/:auctionId/bids        # Get bids
GET    /api/db/auctions/ending-soon            # Ending soon
POST   /api/db/auctions                        # Create auction
POST   /api/db/auctions/:auctionId/bid         # Place bid
GET    /api/db/auctions/user/:userId           # User's auctions
GET    /api/db/auctions/user/:userId/bids      # User's bids
POST   /api/db/auctions/:auctionId/end         # End auction
POST   /api/db/auctions/:auctionId/cancel      # Cancel auction
```

### Transaction Endpoints
```
GET    /api/db/transactions                    # Recent transactions
GET    /api/db/transactions/:transactionId     # Get transaction
GET    /api/db/transactions/user/:userId       # User transactions
GET    /api/db/transactions/user/:userId/sales # User sales
GET    /api/db/transactions/user/:userId/purchases # Purchases
GET    /api/db/transactions/nft/:nftId         # NFT history
GET    /api/db/transactions/stats/volume       # Platform volume
GET    /api/db/transactions/stats/user/:userId # User volume
```

### Collection Endpoints
```
GET    /api/db/collections                     # List collections
GET    /api/db/collections/:collectionId       # Get collection
GET    /api/db/collections/search              # Search collections
GET    /api/db/collections/trending            # Trending
GET    /api/db/collections/creator/:creatorId  # Creator's collections
POST   /api/db/collections                     # Create collection
PUT    /api/db/collections/:collectionId       # Update collection
POST   /api/db/collections/:collectionId/refresh-stats # Update stats
```

### Notification Endpoints
```
GET    /api/db/notifications/:userId           # Get notifications
GET    /api/db/notifications/:userId/unread    # Unread only
GET    /api/db/notifications/:userId/count     # Unread count
PUT    /api/db/notifications/:notificationId/read # Mark read
PUT    /api/db/notifications/:userId/read-all  # Mark all read
DELETE /api/db/notifications/:notificationId   # Delete notification
```

### Analytics Endpoints
```
POST   /api/db/analytics/track                 # Track event
GET    /api/db/analytics/stats                 # Platform stats
GET    /api/db/analytics/nft/:nftId            # NFT analytics
GET    /api/db/analytics/user/:userId          # User activity
GET    /api/db/analytics/trending              # Trending events
GET    /api/db/analytics/searches              # Popular searches
```

## Features

✅ Complete CRUD operations for all entities
✅ Real-time data updates with Supabase subscriptions
✅ Row-level security for data privacy
✅ Automatic timestamp management
✅ Efficient database indexing
✅ Transaction integrity with foreign keys
✅ Analytics event tracking
✅ Notification system
✅ Social graph management
✅ Auction and bidding system
✅ Direct offer system
✅ NFT collection management
✅ Full-text search capabilities

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Automatic audit timestamps
- ✅ Foreign key constraints
- ✅ Data validation at database level
- ✅ Admin-only operations via service role key
- ✅ User-specific data access policies

## Performance

- ✅ Optimized indexes on frequently queried columns
- ✅ Pagination support on all list endpoints
- ✅ Query result caching capabilities
- ✅ Connection pooling via Supabase
- ✅ Efficient aggregation queries
- ✅ Batch operations support

## Next Steps

1. Run SQL migration in Supabase dashboard
2. Configure environment variables
3. Test API endpoints
4. Implement frontend integration
5. Set up real-time subscriptions
6. Configure authentication policies
7. Deploy to production

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.
