'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { type Address } from 'viem';
import { SpendVaultABI } from '@/lib/abis/SpendVault';
import { Button } from '@/components/ui/button';

interface QueuedWithdrawalInfo {
  withdrawalId: number;
  token: Address;
  amount: bigint;
  recipient: Address;
  queuedAt: number;
  readyAt: number;
  isFrozen: boolean;
  isExecuted: boolean;
  isCancelled: boolean;
  freezeCount: number;
  timeRemaining: number; // seconds
  status: 'pending' | 'ready' | 'frozen' | 'executed' | 'cancelled';
}

interface WithdrawalQueueProps {
  vaultAddress: Address;
  onRefresh?: () => void;
  maxItems?: number;
}

/**
 * Component for displaying queued withdrawals with status and guardian actions
 */
export function WithdrawalQueue({
  vaultAddress,
  onRefresh,
  maxItems = 10
}: WithdrawalQueueProps) {
  const publicClient = usePublicClient();
  
  const [withdrawals, setWithdrawals] = useState<QueuedWithdrawalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch queued withdrawals
   */
  const fetchWithdrawals = useCallback(async () => {
    if (!publicClient) return;

    try {
      setError(null);
      const withdrawalList: QueuedWithdrawalInfo[] = [];

      // Fetch withdrawal queue ID
      const queueId = await publicClient.readContract({
        address: vaultAddress,
        abi: SpendVaultABI,
        functionName: 'withdrawalQueueId',
        args: []
      });

      const totalWithdrawals = Math.min(Number(queueId), maxItems);

      // Fetch each withdrawal
      for (let i = 0; i < totalWithdrawals; i++) {
        try {
          const queued = await publicClient.readContract({
            address: vaultAddress,
            abi: SpendVaultABI,
            functionName: 'getQueuedWithdrawal',
            args: [BigInt(i)]
          });

          const now = Math.floor(Date.now() / 1000);
          const readyAt = Number((queued as any).readyAt || 0);
          const timeRemaining = Math.max(0, readyAt - now);

          let status: 'pending' | 'ready' | 'frozen' | 'executed' | 'cancelled' = 'pending';
          if ((queued as any).isExecuted) status = 'executed';
          else if ((queued as any).isCancelled) status = 'cancelled';
          else if ((queued as any).isFrozen) status = 'frozen';
          else if (timeRemaining === 0) status = 'ready';

          withdrawalList.push({
            withdrawalId: i,
            token: (queued as any).token,
            amount: (queued as any).amount,
            recipient: (queued as any).recipient,
            queuedAt: Number((queued as any).queuedAt || 0),
            readyAt,
            isFrozen: (queued as any).isFrozen,
            isExecuted: (queued as any).isExecuted,
            isCancelled: (queued as any).isCancelled,
            freezeCount: Number((queued as any).freezeCount || 0),
            timeRemaining,
            status
          });
        } catch (err) {
          console.error(`Error fetching withdrawal ${i}:`, err);
        }
      }

      setWithdrawals(withdrawalList.reverse()); // Show newest first
      setLoading(false);
    } catch (err) {
      console.error('Error fetching withdrawal queue:', err);
      setError('Failed to load withdrawal queue');
      setLoading(false);
    }
  }, [publicClient, vaultAddress, maxItems]);

  /**
   * Format time remaining
   */
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Ready';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  /**
   * Format token amount
   */
  const formatAmount = (amount: bigint, decimals: number = 18): string => {
    const divisor = BigInt(10 ** decimals);
    const whole = amount / divisor;
    const frac = ((amount % divisor) * BigInt(10000)) / divisor;
    if (frac === BigInt(0)) return whole.toString();
    return `${whole}.${frac.toString().padStart(4, '0')}`;
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'frozen':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'executed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'ready':
        return '✅';
      case 'frozen':
        return '🔒';
      case 'executed':
        return '✓';
      case 'cancelled':
        return '✗';
      default:
        return '⏳';
    }
  };

  // Setup auto-refresh every 10 seconds
  useEffect(() => {
    fetchWithdrawals();
    const interval = setInterval(fetchWithdrawals, 10000);
    return () => clearInterval(interval);
  }, [fetchWithdrawals]);

  if (loading) {
    return (
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-900/50">
        <p className="text-sm text-gray-600 dark:text-gray-400">No queued withdrawals</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Withdrawal Queue</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {withdrawals.length} withdrawal{withdrawals.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {withdrawals.map((withdrawal) => (
          <QueuedWithdrawalCard
            key={withdrawal.withdrawalId}
            withdrawal={withdrawal}
            formatTimeRemaining={formatTimeRemaining}
            formatAmount={formatAmount}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            vaultAddress={vaultAddress}
            onAction={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual withdrawal card component
 */
function QueuedWithdrawalCard({
  withdrawal,
  formatTimeRemaining,
  formatAmount,
  getStatusColor,
  getStatusIcon,
  vaultAddress,
  onAction
}: {
  withdrawal: QueuedWithdrawalInfo;
  formatTimeRemaining: (seconds: number) => string;
  formatAmount: (amount: bigint, decimals?: number) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  vaultAddress: Address;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getStatusIcon(withdrawal.status)}</span>
            <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
              {withdrawal.status.toUpperCase()}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            #{withdrawal.withdrawalId}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{formatAmount(withdrawal.amount)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {withdrawal.token === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'ERC-20'}
          </p>
        </div>
      </div>

      {/* Recipient Info */}
      <div className="mb-3 border-t border-gray-100 pt-3 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">To:</p>
        <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
          {withdrawal.recipient.slice(0, 6)}...{withdrawal.recipient.slice(-4)}
        </p>
      </div>

      {/* Time Remaining / Status */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Time Remaining</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            {formatTimeRemaining(withdrawal.timeRemaining)}
          </p>
        </div>
        {withdrawal.freezeCount > 0 && (
          <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
            <p className="text-xs text-orange-700 dark:text-orange-400">
              🔒 Frozen by {withdrawal.freezeCount} guardian{withdrawal.freezeCount > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {withdrawal.status === 'ready' && !withdrawal.isFrozen && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              // TODO: Implement execute action
              console.log('Execute withdrawal', withdrawal.withdrawalId);
              onAction?.();
            }}
          >
            Execute Now
          </Button>
        )}
        {(withdrawal.status === 'pending' || withdrawal.status === 'ready') && !withdrawal.isFrozen && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              // TODO: Implement cancel action
              console.log('Cancel withdrawal', withdrawal.withdrawalId);
              onAction?.();
            }}
          >
            Cancel
          </Button>
        )}
        {withdrawal.status !== 'frozen' && withdrawal.status !== 'executed' && withdrawal.status !== 'cancelled' && (
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => {
              // TODO: Implement freeze action
              console.log('Freeze withdrawal', withdrawal.withdrawalId);
              onAction?.();
            }}
          >
            Freeze
          </Button>
        )}
      </div>
    </div>
  );
}
