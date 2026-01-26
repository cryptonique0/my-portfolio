import { z } from 'zod';

// NFT Schemas
export const createNFTSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  image: z.string().url(),
  price: z.number().positive().optional(),
  royaltyPercentage: z.number().min(0).max(25).default(10),
  category: z.enum(['art', 'collectible', 'photography', 'music', 'video', 'other']).default('art'),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.union([z.string(), z.number()]),
  })).optional(),
});

export const updateNFTSchema = z.object({
  price: z.number().positive().optional(),
  listed: z.boolean().optional(),
  description: z.string().max(1000).optional(),
});

// User Schemas
export const updateUserProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  banner: z.string().url().optional(),
  social: z.object({
    twitter: z.string().optional(),
    discord: z.string().optional(),
    website: z.string().url().optional(),
  }).optional(),
});

// Marketplace Schemas
export const listNFTSchema = z.object({
  tokenId: z.number().int().positive(),
  price: z.number().positive(),
  expiresAt: z.string().datetime().optional(),
});

export const makeOfferSchema = z.object({
  tokenId: z.number().int().positive(),
  offerAmount: z.number().positive(),
  expiresAt: z.string().datetime(),
});

// Auction Schemas
export const createAuctionSchema = z.object({
  tokenId: z.number().int().positive(),
  startingBid: z.number().positive(),
  reservePrice: z.number().positive().optional(),
  duration: z.number().int().min(3600).max(604800), // 1 hour to 7 days
});

export const placeBidSchema = z.object({
  auctionId: z.number().int().positive(),
  bidAmount: z.number().positive(),
});

// Search Schemas
export const searchNFTsSchema = z.object({
  query: z.string().min(1).max(100),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  verified: z.boolean().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'oldest', 'trending']).default('newest'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Engagement Schemas
export const followUserSchema = z.object({
  targetAddress: z.string().regex(/^(SP|ST)[0-9A-Z]+$/),
});

export const likeNFTSchema = z.object({
  tokenId: z.number().int().positive(),
});

// Admin Schemas
export const verifyCreatorSchema = z.object({
  creatorAddress: z.string().regex(/^(SP|ST)[0-9A-Z]+$/),
  verified: z.boolean(),
  badge: z.enum(['verified', 'featured', 'partner']).optional(),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type CreateNFTInput = z.infer<typeof createNFTSchema>;
export type UpdateNFTInput = z.infer<typeof updateNFTSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ListNFTInput = z.infer<typeof listNFTSchema>;
export type MakeOfferInput = z.infer<typeof makeOfferSchema>;
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
export type SearchNFTsInput = z.infer<typeof searchNFTsSchema>;
export type FollowUserInput = z.infer<typeof followUserSchema>;
export type LikeNFTInput = z.infer<typeof likeNFTSchema>;
export type VerifyCreatorInput = z.infer<typeof verifyCreatorSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
