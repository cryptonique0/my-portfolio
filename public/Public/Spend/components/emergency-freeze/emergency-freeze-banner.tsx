'use client';

import { useEffect, useState } from 'react';
import { type Address } from 'viem';

interface EmergencyFreezeBannerProps {
  vaultAddress: Address;
  autoRefresh?: number; // milliseconds
}

interface FreezeStatus {
  isFrozen: boolean;
  freezeVotes: number;
  unfreezeVotes: number;
  threshold: number;
  freezeVoters: string[];
  unfreezeVoters: string[];
  lastFreezeTimestamp: number;
  percentToFreeze: number;
  percentToUnfreeze: number;
}

/**
 * Prominent emergency status banner showing vault freeze status
 * Displays red alert when frozen, yellow warning when close to freezing
 */
export function EmergencyFreezeBanner({
  vaultAddress,
  autoRefresh = 5000
}: EmergencyFreezeBannerProps) {
  const [status, setStatus] = useState<FreezeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/vaults/${vaultAddress}/emergency-freeze`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch freeze status');
      }

      const data = await response.json();
      setStatus(data.emergencyFreeze);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching emergency freeze status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, autoRefresh);
    return () => clearInterval(interval);
  }, [vaultAddress, autoRefresh]);

  if (loading) {
    return (
      <div className="h-20 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (!status) {
    return null;
  }

  // If frozen, show prominent red alert
  if (status.isFrozen) {
    return (
      <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex items-start gap-4">
          <div className="flex flex-shrink-0 items-center justify-center">
            <div className="text-3xl">🔒</div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-300">
              VAULT EMERGENCY FROZEN
            </h2>
            <p className="mt-1 text-sm text-red-800 dark:text-red-400">
              The vault has been placed under emergency freeze by guardian consensus.
              All withdrawals and sensitive actions are blocked.
            </p>

            {/* Unfreeze progress */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                  Guardians voting to UNFREEZE:
                </span>
                <span className="text-xs font-bold text-red-700 dark:text-red-400">
                  {status.unfreezeVotes}/{status.threshold}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-red-200 dark:bg-red-800">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${status.percentToUnfreeze}%` }}
                />
              </div>
              {status.unfreezeVotes > 0 && (
                <p className="text-xs text-red-700 dark:text-red-400">
                  {status.threshold - status.unfreezeVotes} more guardian
                  {status.threshold - status.unfreezeVotes === 1 ? '' : 's'} needed
                  to unfreeze
                </p>
              )}
            </div>

            {/* Voting guardians list */}
            {status.unfreezeVoters.length > 0 && (
              <div className="mt-3 rounded bg-red-100 p-2 dark:bg-red-800/30">
                <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                  Guardians voting to unfreeze:
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {status.unfreezeVoters.map((voter) => (
                    <span
                      key={voter}
                      className="rounded bg-orange-200 px-2 py-1 text-xs font-mono text-orange-900 dark:bg-orange-900/30 dark:text-orange-300"
                    >
                      {voter.slice(0, 6)}...{voter.slice(-4)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If approaching freeze threshold, show yellow warning
  if (status.freezeVotes > 0) {
    return (
      <div className="rounded-lg border-2 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <div className="flex items-start gap-4">
          <div className="flex flex-shrink-0 items-center justify-center">
            <div className="text-3xl">⚠️</div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-yellow-900 dark:text-yellow-300">
              EMERGENCY FREEZE IN PROGRESS
            </h2>
            <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-400">
              Guardians are voting to freeze the vault due to suspicious activity.
              If the threshold is reached, all withdrawals will be blocked.
            </p>

            {/* Freeze progress */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                  Guardians voting to FREEZE:
                </span>
                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                  {status.freezeVotes}/{status.threshold}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-yellow-200 dark:bg-yellow-800">
                <div
                  className="h-full bg-yellow-500 transition-all duration-300"
                  style={{ width: `${status.percentToFreeze}%` }}
                />
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                {status.threshold - status.freezeVotes} more guardian
                {status.threshold - status.freezeVotes === 1 ? '' : 's'} needed
                to freeze
              </p>
            </div>

            {/* Freeze voters list */}
            {status.freezeVoters.length > 0 && (
              <div className="mt-3 rounded bg-yellow-100 p-2 dark:bg-yellow-800/30">
                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                  Guardians voting to freeze:
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {status.freezeVoters.map((voter) => (
                    <span
                      key={voter}
                      className="rounded bg-yellow-200 px-2 py-1 text-xs font-mono text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200"
                    >
                      {voter.slice(0, 6)}...{voter.slice(-4)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // All clear - no freeze activity
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
      <div className="flex items-center gap-3">
        <span className="text-xl">✅</span>
        <div>
          <p className="font-semibold text-green-900 dark:text-green-300">
            Vault Status: Normal
          </p>
          <p className="text-xs text-green-700 dark:text-green-400">
            No emergency freeze activity detected
          </p>
        </div>
      </div>
    </div>
  );
}
