import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageURI: string;
  requiredReputation: number;
  currentSupply: number;
  maxSupply: number;
  isActive: boolean;
  createdAt: number;
  owned?: boolean;
  quantity?: number;
}

/**
 * Hook for managing NFT achievement badges
 * Features:
 * - Fetch user badges
 * - Mint badges (admin)
 * - Burn badges
 * - Query badge metadata
 * - Track badge ownership
 */
export function useBadges() {
  const { address } = useAccount();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all available badges
   */
  const fetchAllBadges = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/badges/all');
      if (!response.ok) throw new Error('Failed to fetch badges');

      const data = await response.json();
      setBadges(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch user's badges
   */
  const fetchUserBadges = useCallback(async (userAddress?: string) => {
    if (!userAddress && !address) {
      setError('No wallet connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const target = userAddress || address;
      const response = await fetch(`/api/badges/user/${target}`);
      if (!response.ok) throw new Error('Failed to fetch user badges');

      const data = await response.json();
      setUserBadges(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  /**
   * Mint badge to user (admin only)
   */
  const mintBadge = useCallback(
    async (recipient: string, badgeId: number, amount: number = 1) => {
      if (!address) {
        setError('No wallet connected');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/badges/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient,
            badgeId,
            amount,
            minter: address,
          }),
        });

        if (!response.ok) throw new Error('Failed to mint badge');

        const data = await response.json();

        // Refresh user badges if minting to current user
        if (recipient.toLowerCase() === address.toLowerCase()) {
          await fetchUserBadges(recipient);
        }

        return data.success;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [address, fetchUserBadges]
  );

  /**
   * Batch mint badges
   */
  const batchMintBadges = useCallback(
    async (
      recipients: string[],
      badgeIds: number[],
      amounts: number[]
    ) => {
      if (!address) {
        setError('No wallet connected');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/badges/batch-mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients,
            badgeIds,
            amounts,
            minter: address,
          }),
        });

        if (!response.ok) throw new Error('Failed to batch mint badges');

        const data = await response.json();

        // Refresh badges
        await fetchAllBadges();

        return data.success;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [address, fetchAllBadges]
  );

  /**
   * Burn badge
   */
  const burnBadge = useCallback(
    async (badgeId: number, amount: number = 1) => {
      if (!address) {
        setError('No wallet connected');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/badges/burn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            badgeId,
            amount,
            burner: address,
          }),
        });

        if (!response.ok) throw new Error('Failed to burn badge');

        // Refresh user badges
        await fetchUserBadges();

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [address, fetchUserBadges]
  );

  /**
   * Get badge by ID
   */
  const getBadgeById = useCallback(
    (badgeId: number): Badge | undefined => {
      return badges.find((b) => b.id === badgeId);
    },
    [badges]
  );

  /**
   * Check if user has badge
   */
  const hasBadge = useCallback(
    (badgeId: number): boolean => {
      return userBadges.some((b) => b.id === badgeId);
    },
    [userBadges]
  );

  /**
   * Get user's badge count
   */
  const getBadgeCount = useCallback((): number => {
    return userBadges.length;
  }, [userBadges]);

  /**
   * Unlock badge based on reputation
   */
  const unlockBadgeByReputation = useCallback(
    async (reputation: number): Promise<Badge[]> => {
      return badges.filter((b) => reputation >= b.requiredReputation);
    },
    [badges]
  );

  return {
    badges,
    userBadges,
    isLoading,
    error,
    fetchAllBadges,
    fetchUserBadges,
    mintBadge,
    batchMintBadges,
    burnBadge,
    getBadgeById,
    hasBadge,
    getBadgeCount,
    unlockBadgeByReputation,
  };
}

/**
 * Hook for badge API operations
 */
export function useBadgeAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create new badge type (admin)
   */
  const createBadge = useCallback(
    async (
      name: string,
      description: string,
      requiredReputation: number,
      maxSupply: number,
      imageURI: string
    ): Promise<number | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/badges/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            requiredReputation,
            maxSupply,
            imageURI,
          }),
        });

        if (!response.ok) throw new Error('Failed to create badge');

        const data = await response.json();
        return data.badgeId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update badge metadata
   */
  const updateBadge = useCallback(
    async (
      badgeId: number,
      updates: Partial<Badge>
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/badges/${badgeId}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Failed to update badge');

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Deactivate badge
   */
  const deactivateBadge = useCallback(
    async (badgeId: number): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/badges/${badgeId}/deactivate`,
          { method: 'POST' }
        );

        if (!response.ok) throw new Error('Failed to deactivate badge');

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    createBadge,
    updateBadge,
    deactivateBadge,
  };
}
