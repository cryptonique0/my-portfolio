/**
 * Services Index
 * Consolidated exports for all backend services
 * Provides clean API for route handlers
 */

// Search Service
export {
  searchNFTs,
  getTrendingNFTs,
  getNFTsByCategory,
  getSearchSuggestions,
  getPopularCategories,
  getPriceStats,
  calculatePopularityScore,
  type NFTFilter,
  type SearchFilters,
  type SortOptions,
  type SearchResult
} from './search';

// Marketplace Service
export {
  createListing,
  cancelListing,
  buyNFT,
  getMarketplaceStats,
  getActiveListings,
  getTransactionHistory,
  updateListingPrice,
  calculateFees,
  getFloorPrice,
  type ListingData,
  type MarketplaceStats,
  type Transaction
} from './marketplace-refactored';

// Analytics Service
export {
  getMarketplaceStats as getAnalytics,
  type MarketplaceStats as AnalyticsData
} from './marketplace-refactored';

// Royalties Service
export {
  getCreatorRoyalties,
  getRoyaltyHistory,
  getNFTRoyaltyStats,
  getTopRoyaltyNFTs,
  calculateRoyalties,
  type RoyaltyRecord,
  type CreatorRoyalties,
  type RoyaltyChartData,
  type NFTRoyaltyStats
} from './royalties';

// Creator Service
export {
  getCreatorStats,
  getCreatorEarnings,
  getCreatorCollections,
  type CreatorStats,
  type CreatorEarnings
} from './creators';

// NFT Service
export {
  getNFTMetadata,
  listNFTs,
  type NFTMetadata
} from './nft';
// Supabase Database Services
export { UserService } from './user.service';
export { NFTService } from './nft.service';
export { TransactionService } from './transaction.service';
export { AuctionService } from './auction.service';
export { OfferService } from './offer.service';
export { FollowService } from './follow.service';
export { NotificationService } from './notification.service';
export { CollectionService } from './collection.service';
export { AnalyticsService } from './analytics.service';

// Advanced Analytics Service
export { AdvancedAnalyticsService } from './advanced-analytics.service';

// Admin Service
export { AdminService } from './admin.service';

// Blockchain Services
export { BlockchainService } from './blockchain.service';
export { TransactionTrackerService } from './transaction-tracker.service';
export { NFTMintingService } from './minting.service';
export { EventListenerService } from './event-listener.service';