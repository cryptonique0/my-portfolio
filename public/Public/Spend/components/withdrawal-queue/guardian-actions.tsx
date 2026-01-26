'use client';

import { useState } from 'react';
import { usePublicClient, useWalletClient, useContractRead } from 'wagmi';
import { type Address } from 'viem';
import { SpendVaultABI } from '@/lib/abis/SpendVault';
import { GuardianSBTABI } from '@/lib/abis/GuardianSBT';
import { Button } from '@/components/ui/button';

interface GuardianActionsProps {
  withdrawalId: number;
  vaultAddress: Address;
  guardianSBTAddress: Address;
  userAddress?: Address;
  withdrawalStatus: 'pending' | 'ready' | 'frozen' | 'executed' | 'cancelled';
  isFrozen: boolean;
  freezeCount: number;
  onActionSuccess?: () => void;
}

/**
 * Guardian action buttons for managing queued withdrawals
 */
export function GuardianActions({
  withdrawalId,
  vaultAddress,
  guardianSBTAddress,
  userAddress,
  withdrawalStatus,
  isFrozen,
  freezeCount,
  onActionSuccess
}: GuardianActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  /**
   * Check if user is a guardian
   */
  const { data: isGuardian } = useContractRead({
    account: userAddress,
    address: guardianSBTAddress,
    abi: GuardianSBTABI,
    functionName: 'balanceOf',
    args: [userAddress || '0x0'],
    query: { enabled: !!userAddress }
  });

  const hasGuardianToken = isGuardian && typeof isGuardian === 'bigint' && isGuardian > 0n;

  /**
   * Handle freeze action
   */
  const handleFreeze = async () => {
    if (!walletClient || !publicClient || !userAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      // Call freeze function
      const hash = await walletClient.writeContract({
        account: userAddress,
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'freezeQueuedWithdrawal',
        args: [BigInt(withdrawalId)]
      });

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        onActionSuccess?.();
      } else {
        setError('Transaction failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to freeze withdrawal';
      setError(message);
      console.error('Freeze action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle unfreeze action
   */
  const handleUnfreeze = async () => {
    if (!walletClient || !publicClient || !userAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        account: userAddress,
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'unfreezeQueuedWithdrawal',
        args: [BigInt(withdrawalId)]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        onActionSuccess?.();
      } else {
        setError('Transaction failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unfreeze withdrawal';
      setError(message);
      console.error('Unfreeze action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = async () => {
    if (!walletClient || !publicClient || !userAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        account: userAddress,
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'cancelQueuedWithdrawal',
        args: [BigInt(withdrawalId)]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        onActionSuccess?.();
      } else {
        setError('Transaction failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel withdrawal';
      setError(message);
      console.error('Cancel action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show actions for executed or cancelled withdrawals
  if (withdrawalStatus === 'executed' || withdrawalStatus === 'cancelled') {
    return null;
  }

  // Show error if present
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  // Guardians can freeze/unfreeze
  if (hasGuardianToken) {
    return (
      <div className="flex gap-2">
        {isFrozen ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            onClick={handleUnfreeze}
            className="flex-1"
          >
            {isLoading ? 'Unfreezing...' : 'Unfreeze'}
          </Button>
        ) : (
          withdrawalStatus !== 'frozen' && (
            <Button
              size="sm"
              variant="destructive"
              disabled={isLoading}
              onClick={handleFreeze}
              className="flex-1"
            >
              {isLoading ? 'Freezing...' : 'Freeze for Review'}
            </Button>
          )
        )}

        {/* Cancel button always available unless frozen/executed/cancelled */}
        {withdrawalStatus === 'pending' && (
          <Button
            size="sm"
            variant="ghost"
            disabled={isLoading}
            onClick={handleCancel}
            className="flex-1"
          >
            {isLoading ? 'Cancelling...' : 'Cancel'}
          </Button>
        )}

        {freezeCount > 0 && isFrozen && (
          <div className="text-xs text-orange-600 dark:text-orange-400">
            Frozen by you + {freezeCount > 1 ? freezeCount - 1 : '0'} other{freezeCount > 2 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  // Non-guardians cannot perform actions
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      Only guardians can freeze or cancel withdrawals
    </div>
  );
}
