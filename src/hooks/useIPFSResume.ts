import { useState } from 'react';
import { uploadResumeToIPFS } from '@/lib/ipfs';
import { useAccount } from 'wagmi';

export interface ResumeData {
  name: string;
  bio: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationDate: string;
    field: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    url?: string;
    technologies: string[];
    date: string;
  }>;
}

interface UploadState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  ipfsHash: string | null;
}

/**
 * Hook for uploading resume data to IPFS
 * Handles structured resume JSON storage with Pinata pinning
 */
export function useIPFSResume() {
  const { address } = useAccount();
  const [state, setState] = useState<UploadState>({
    isLoading: false,
    error: null,
    success: false,
    ipfsHash: null,
  });

  const uploadResume = async (resumeData: ResumeData) => {
    if (!address) {
      setState({
        isLoading: false,
        error: 'Wallet not connected',
        success: false,
        ipfsHash: null,
      });
      return null;
    }

    setState({
      isLoading: true,
      error: null,
      success: false,
      ipfsHash: null,
    });

    try {
      // Prepare complete resume data
      const fullResume = {
        ...resumeData,
        address,
        timestamp: Date.now(),
      };

      // Try API endpoint first
      try {
        const response = await fetch('/api/ipfs/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullResume),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const result = await response.json();

        setState({
          isLoading: false,
          error: null,
          success: true,
          ipfsHash: result.ipfsHash || result.cid,
        });

        return result.ipfsHash || result.cid;
      } catch (apiError) {
        // Fallback to direct IPFS upload
        console.warn('API upload failed, trying direct upload:', apiError);
        const result = await uploadResumeToIPFS(fullResume);

        setState({
          isLoading: false,
          error: null,
          success: true,
          ipfsHash: result.cid,
        });

        return result.cid;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isLoading: false,
        error: errorMessage,
        success: false,
        ipfsHash: null,
      });
      return null;
    }
  };

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      ipfsHash: null,
    });
  };

  return {
    uploadResume,
    reset,
    ...state,
  };
}

/**
 * Hook for verifying credentials
 */
export function useCredentialVerification() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyCredential = async (
    userAddress: string,
    credentialIndex: number,
    issuerSignature?: string
  ) => {
    if (!address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/credentials/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          credentialIndex,
          issuerAddress: address,
          issuerSignature,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  return {
    verifyCredential,
    isLoading,
    error,
  };
}

/**
 * Hook for fetching leaderboard data
 */
export function useLeaderboard(limit: number = 50, sortBy: 'reputation' | 'achievements' = 'reputation') {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const [userRank, setUserRank] = useState<any | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leaderboard?limit=${limit}&sortBy=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const result = await response.json();
      setEntries(result.data || []);

      // Find current user if connected
      if (address && result.data) {
        const currentUser = result.data.find(
          (entry: any) => entry.address?.toLowerCase() === address.toLowerCase()
        );
        setUserRank(currentUser || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    entries,
    isLoading,
    error,
    userRank,
    refetch: fetchLeaderboard,
  };
}
