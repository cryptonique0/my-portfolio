'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ON_CHAIN_RESUME_ABI, CONTRACT_ADDRESS } from '@/lib/contract';

/**
 * Custom hook for managing on-chain profile operations
 * Handles profile creation, updates, and data fetching
 */
export function useContractProfile() {
  const { address, isConnected } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read profile data
  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ON_CHAIN_RESUME_ABI,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
  });

  // Read credentials
  const { data: credentialsData, refetch: refetchCredentials } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ON_CHAIN_RESUME_ABI,
    functionName: 'getCredentials',
    args: address ? [address] : undefined,
  });

  // Read achievements
  const { data: achievementsData, refetch: refetchAchievements } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ON_CHAIN_RESUME_ABI,
    functionName: 'getAchievements',
    args: address ? [address] : undefined,
  });

  // Read reputation
  const { data: reputationData, refetch: refetchReputation } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ON_CHAIN_RESUME_ABI,
    functionName: 'getReputation',
    args: address ? [address] : undefined,
  });

  // Write contract functions
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create a new profile on-chain
   */
  const createProfile = async (handle: string, ipfsHash: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsCreating(true);
      setError(null);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ON_CHAIN_RESUME_ABI,
        functionName: 'createProfile',
        args: [handle, ipfsHash],
      });

      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      console.error('Profile creation error:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update existing profile
   */
  const updateProfile = async (ipfsHash: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ON_CHAIN_RESUME_ABI,
        functionName: 'updateProfile',
        args: [ipfsHash],
      });

      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Profile update error:', err);
      return null;
    }
  };

  /**
   * Add a credential
   */
  const addCredential = async (
    credentialType: string,
    issuer: string,
    issuedDate: number,
    expiryDate: number,
    proofUrl: string
  ) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ON_CHAIN_RESUME_ABI,
        functionName: 'addCredential',
        args: [credentialType, issuer, BigInt(issuedDate), BigInt(expiryDate), proofUrl],
      });

      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add credential';
      setError(errorMessage);
      console.error('Add credential error:', err);
      return null;
    }
  };

  /**
   * Unlock an achievement
   */
  const unlockAchievement = async (title: string, description: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ON_CHAIN_RESUME_ABI,
        functionName: 'unlockAchievement',
        args: [title, description],
      });

      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlock achievement';
      setError(errorMessage);
      console.error('Unlock achievement error:', err);
      return null;
    }
  };

  /**
   * Refetch all profile data
   */
  const refreshProfile = () => {
    refetchProfile();
    refetchCredentials();
    refetchAchievements();
    refetchReputation();
  };

  return {
    // Profile data
    profile: profileData,
    credentials: credentialsData,
    achievements: achievementsData,
    reputation: reputationData,

    // Loading states
    isLoadingProfile,
    isCreating: isCreating || isWritePending || isConfirming,
    isConfirmed,

    // Error state
    error,

    // Actions
    createProfile,
    updateProfile,
    addCredential,
    unlockAchievement,
    refreshProfile,

    // Transaction hash
    txHash: hash,
  };
}
