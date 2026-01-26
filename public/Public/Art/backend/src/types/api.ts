/**
 * Type definitions for API request bodies and responses
 * Provides type safety for Express routes
 */

// ============================================
// NFT Request/Response Types
// ============================================

export interface CreateNFTRequest {
  name: string;
  description: string;
  category: string;
  royaltyPercentage: number;
  // Note: imageFile is handled by multer, not in body
}

export interface CreateNFTResponse {
  success: boolean;
  nft: {
    id: number;
    name: string;
    description: string;
    image: string;
    imageHash: string;
    category: string;
    royaltyPercentage: number;
    creator: string;
    owner: string;
    metadataHash: string;
    metadataUri: string;
    createdAt: string;
  };
  message: string;
}

export interface GetNFTsQuery {
  page?: string | number;
  limit?: string | number;
  category?: string;
  sortBy?: 'createdAt' | 'name';
}

// ============================================
// Marketplace Request/Response Types
// ============================================

export interface CreateListingRequest {
  nftId: number;
  price: number;
  quantity?: number;
  duration?: number;
}

export interface UpdateListingRequest {
  price: number;
}

export interface PurchaseRequest {
  listingId: number;
  quantity: number;
  buyerAddress: string;
}

// ============================================
// User Request/Response Types
// ============================================

export interface UpdateProfileRequest {
  bio?: string;
  avatar?: string;
  banner?: string;
  social?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

// ============================================
// Error Response Types
// ============================================

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// Type Guards
// ============================================

export function isCreateNFTRequest(body: any): body is CreateNFTRequest {
  return (
    typeof body === 'object' &&
    typeof body.name === 'string' &&
    typeof body.description === 'string' &&
    typeof body.category === 'string' &&
    typeof body.royaltyPercentage === 'number'
  );
}

export function isCreateListingRequest(body: any): body is CreateListingRequest {
  return (
    typeof body === 'object' &&
    typeof body.nftId === 'number' &&
    typeof body.price === 'number'
  );
}
