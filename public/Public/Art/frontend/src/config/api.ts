// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // NFT endpoints
  nfts: `${API_BASE_URL}/nfts`,
  mint: `${API_BASE_URL}/nfts/mint`,
  
  // User endpoints
  users: `${API_BASE_URL}/users`,
  profile: `${API_BASE_URL}/users/profile`,
  
  // Marketplace endpoints
  marketplace: `${API_BASE_URL}/marketplace`,
  listings: `${API_BASE_URL}/marketplace/listings`,
  
  // Analytics endpoints
  analytics: `${API_BASE_URL}/analytics`,
  advancedAnalytics: `${API_BASE_URL}/advanced-analytics`,
  
  // Gamification endpoints
  gamification: `${API_BASE_URL}/gamification`,
  
  // Admin endpoints
  admin: `${API_BASE_URL}/admin`,
};

export default { API_BASE_URL, API_ENDPOINTS };
