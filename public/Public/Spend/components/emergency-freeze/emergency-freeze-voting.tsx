'use client';

import { useState } from 'react';
import { usePublicClient, useWalletClient, useReadContract, useAccount } from 'wagmi';
import { type Address } from 'viem';
import { SpendVaultABI } from '@/lib/abis/SpendVault';
import { GuardianSBTABI } from '@/lib/abis/GuardianSBT';
import { Button } from '@/components/ui/button';

interface GuardianEmergencyFreezeVotingProps {
  vaultAddress: Address;
  guardianSBTAddress: Address;
  userAddress?: Address;
  isFrozen: boolean;
  freezeVotes: number;
  unfreezeVotes: number;
  threshold: number;
  freezeVoters?: string[];
  unfreezeVoters?: string[];
  onVoteSuccess?: () => void;
}

/**
 * Guardian interface for voting to freeze/unfreeze vault
 * Only guardians can vote
 */
export function GuardianEmergencyFreezeVoting({
  vaultAddress,
  guardianSBTAddress,
  userAddress,
  isFrozen,
  freezeVotes,
  unfreezeVotes,
  threshold,
  freezeVoters = [],
  unfreezeVoters = [],
  onVoteSuccess
}: GuardianEmergencyFreezeVotingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: connectedAddress } = useAccount();

  // Use connected address if userAddress not provided
  const activeUserAddress = userAddress || connectedAddress;

  /**
   * Check if user is a guardian
   */
  const { data: isGuardian } = useReadContract({
    address: guardianSBTAddress,
    abi: GuardianSBTABI,
    functionName: 'balanceOf',
    args: [activeUserAddress || '0x0'],
    query: { enabled: !!activeUserAddress }
  });

  const hasGuardianToken = Boolean(isGuardian && (isGuardian as bigint) > 0n);

  /**
   * Check if current user has voted
   */
  const hasVotedFreeze = activeUserAddress && freezeVoters.includes(activeUserAddress);
  const hasVotedUnfreeze = activeUserAddress && unfreezeVoters.includes(activeUserAddress);

  /**
   * Handle emergency freeze vote
   */
  const handleVoteFreeze = async () => {
    if (!walletClient || !publicClient || !activeUserAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const hash = await walletClient.writeContract({
        account: activeUserAddress,
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'voteEmergencyFreeze',
        args: []
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setSuccessMessage('✅ Vote to freeze submitted successfully');
        onVoteSuccess?.();
      } else {
        setError('Transaction failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vote freeze';
      setError(message);
      console.error('Vote freeze error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle emergency unfreeze vote
   */
  const handleVoteUnfreeze = async () => {
    if (!walletClient || !publicClient || !activeUserAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const hash = await walletClient.writeContract({
        account: activeUserAddress,
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'voteEmergencyUnfreeze',
        args: []
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        if (isFrozen) {
          setSuccessMessage('✅ Vote to unfreeze submitted successfully');
        } else {
          setSuccessMessage('✅ Freeze vote revoked successfully');
        }
        onVoteSuccess?.();
      } else {
        setError('Transaction failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vote unfreeze';
      setError(message);
      console.error('Vote unfreeze error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Non-guardians cannot vote
  if (!hasGuardianToken) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-800 dark:bg-gray-900/50">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Only guardians can vote to freeze or unfreeze the vault
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* Voting section based on current state */}
      {!isFrozen ? (
        // Vault is not frozen - show option to vote freeze
        <div className="space-y-3">
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
              Vote to Freeze Vault
            </h3>
            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
              {freezeVotes}/{threshold} guardians have voted to freeze
            </p>
          </div>

          {hasVotedFreeze ? (
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <span className="text-sm text-blue-700 dark:text-blue-400">
                ✓ You voted to freeze
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={handleVoteUnfreeze}
              >
                {isLoading ? 'Revoking...' : 'Revoke Vote'}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              disabled={isLoading}
              onClick={handleVoteFreeze}
              className="w-full"
            >
              {isLoading ? 'Voting...' : '🔒 Vote to Freeze Vault'}
            </Button>
          )}

          {/* Freeze progress indicator */}
          {freezeVotes > 0 && (
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-yellow-500 transition-all duration-300"
                  style={{ width: `${(freezeVotes / threshold) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {threshold - freezeVotes} more vote{threshold - freezeVotes === 1 ? '' : 's'} needed to freeze
              </p>
            </div>
          )}
        </div>
      ) : (
        // Vault is frozen - show option to vote unfreeze
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">
              Vote to Unfreeze Vault
            </h3>
            <p className="mt-1 text-xs text-red-700 dark:text-red-400">
              {unfreezeVotes}/{threshold} guardians have voted to unfreeze
            </p>
          </div>

          {hasVotedUnfreeze ? (
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <span className="text-sm text-green-700 dark:text-green-400">
                ✓ You voted to unfreeze
              </span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={handleVoteUnfreeze}
              className="w-full"
            >
              {isLoading ? 'Voting...' : '🔓 Vote to Unfreeze Vault'}
            </Button>
          )}

          {/* Unfreeze progress indicator */}
          {unfreezeVotes > 0 && (
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(unfreezeVotes / threshold) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {threshold - unfreezeVotes} more vote{threshold - unfreezeVotes === 1 ? '' : 's'} needed to unfreeze
              </p>
            </div>
          )}
        </div>
      )}

      {/* Vote summary */}
      <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
        <div className="space-y-2 text-xs">
          {isFrozen && unfreezeVoters.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                Guardians voting to unfreeze:
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {unfreezeVoters.map((voter) => (
                  <span
                    key={voter}
                    className={`rounded px-2 py-1 font-mono ${
                      voter === activeUserAddress
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {voter.slice(0, 6)}...{voter.slice(-4)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isFrozen && freezeVoters.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                Guardians voting to freeze:
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {freezeVoters.map((voter) => (
                  <span
                    key={voter}
                    className={`rounded px-2 py-1 font-mono ${
                      voter === activeUserAddress
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
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
