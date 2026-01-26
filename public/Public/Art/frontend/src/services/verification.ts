/**
 * Frontend API Client for Verification Service
 * Handles creator verification requests and badge retrieval
 */

import { api } from './api';

export interface VerificationRequest {
  creatorAddress: string;
  name: string;
  socialLinks: Record<string, string>;
  portfolio?: string;
  salesVolume?: number;
  nftCount?: number;
}

export interface VerificationStatus {
  address: string;
  isVerified: boolean;
  verificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  badgeType: 'standard' | 'official' | 'featured';
  verifiedAt?: Date;
  stats: {
    totalSales: number;
    totalVolume: number;
    nftCount: number;
    followerCount: number;
  };
}

export interface VerificationBadge {
  type: 'standard' | 'official' | 'featured';
  label: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Get verification status for a creator
 */
export async function getVerificationStatus(address: string): Promise<VerificationStatus> {
  const response = await api.get(`/verification/${address}`);
  return response.data;
}

/**
 * Get verification requirements for a creator
 */
export async function getVerificationRequirements(address: string): Promise<{
  currentStats: {
    sales: number;
    volume: number;
    nfts: number;
    followers: number;
  };
  requirements: {
    bronze: Record<string, number>;
    silver: Record<string, number>;
    gold: Record<string, number>;
    platinum: Record<string, number>;
  };
  eligibleFor: string[];
}> {
  const response = await api.get(`/verification/${address}/requirements`);
  return response.data;
}

/**
 * Submit a verification request
 */
export async function submitVerificationRequest(request: VerificationRequest): Promise<{
  eventId: string;
  status: string;
}> {
  const response = await api.post('/verification/submit', request);
  return response.data;
}

/**
 * Get pending verification requests (admin)
 */
export async function getPendingVerifications(limit: number = 20, page: number = 1): Promise<{
  requests: Array<any>;
  total: number;
  page: number;
}> {
  const response = await api.get('/verification/pending', {
    params: { limit, page }
  });
  return response.data;
}

/**
 * Approve a verification request (admin)
 */
export async function approveVerification(
  address: string,
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
): Promise<{ success: boolean }> {
  const response = await api.post(`/verification/${address}/approve`, { level });
  return response.data;
}

/**
 * Reject a verification request (admin)
 */
export async function rejectVerification(address: string, reason: string): Promise<{ success: boolean }> {
  const response = await api.post(`/verification/${address}/reject`, { reason });
  return response.data;
}

/**
 * Get badge details
 */
export async function getVerificationBadge(type: string): Promise<VerificationBadge> {
  const response = await api.get(`/verification/badge/${type}`);
  return response.data;
}

/**
 * Get list of verified creators
 */
export async function getVerifiedCreators(limit: number = 20): Promise<{
  creators: Array<VerificationStatus>;
  total: number;
}> {
  const response = await api.get('/verification/verified-creators', {
    params: { limit }
  });
  return response.data;
}

/**
 * Check if address has verification badge
 */
export async function hasVerificationBadge(address: string): Promise<boolean> {
  try {
    const status = await getVerificationStatus(address);
    return status.isVerified;
  } catch {
    return false;
  }
}
