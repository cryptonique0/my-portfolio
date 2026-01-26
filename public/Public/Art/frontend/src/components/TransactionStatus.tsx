import React, { useEffect, useState } from 'react';
import { BaseScanLink } from './BaseScanLink';
import { Transaction, transactionService } from '../services/transaction';

interface TransactionToastProps {
  txHash: string;
  type?: 'mint' | 'list' | 'buy' | 'auction' | 'bid' | 'approve';
  description?: string;
  onStatusChange?: (status: Transaction['status']) => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * Toast component for transaction status with BaseScan link
 */
export const TransactionToast: React.FC<TransactionToastProps> = ({
  txHash,
  type: _type = 'buy',
  description: _description = 'Transaction',
  onStatusChange,
  autoClose = true,
  autoCloseDelay = 10000
}) => {
  const [tx, setTx] = useState<Transaction | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const transaction = transactionService.getTransaction(txHash);
    setTx(transaction || null);

    // Listen for status changes
    const unsubscribe = transactionService.onTransactionStatusChange(txHash, (updatedTx) => {
      setTx(updatedTx);
      onStatusChange?.(updatedTx.status);
    });

    // Start polling
    transactionService.pollTransactionStatus(txHash);

    return unsubscribe;
  }, [txHash, onStatusChange]);

  useEffect(() => {
    if (autoClose && tx?.status !== 'pending') {
      const timer = setTimeout(() => setIsVisible(false), autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [tx?.status, autoClose, autoCloseDelay]);

  if (!tx || !isVisible) return null;

  const statusConfig = {
    pending: {
      icon: '⏳',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    success: {
      icon: '✅',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    failed: {
      icon: '❌',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    cancelled: {
      icon: '⊘',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    }
  };

  const config = statusConfig[tx.status];
  const msg = transactionService.getTransactionMessage(tx);

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className={`text-2xl flex-shrink-0 animate-${tx.status === 'pending' ? 'spin' : 'none'}`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`${config.color} font-semibold`}>{msg.title}</h3>
          <p className={`${config.color} text-sm mt-1`}>{msg.message}</p>

          {/* BaseScan Link */}
          <div className="mt-2">
            <BaseScanLink
              type="tx"
              hash={txHash}
              label={`🔍 View on BaseScan`}
              className="text-xs"
            />
          </div>

          {/* Block Info */}
          {tx.blockNumber && (
            <p className={`${config.color} text-xs mt-2`}>
              Block: {tx.blockNumber}
            </p>
          )}

          {/* Error Details */}
          {tx.error && tx.status === 'failed' && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300 font-mono break-all">
              {tx.error}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className={`${config.color} flex-shrink-0 font-bold hover:opacity-70`}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

interface TransactionHistoryProps {
  limit?: number;
  className?: string;
}

/**
 * Display recent transactions with status
 */
export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  limit = 5,
  className = ''
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(transactionService.getRecentTransactions(limit));

    // Update on new transactions
    const unsubscribe = transactionService.onTransactionStatusChange('recent', (_tx) => {
      setTransactions(transactionService.getRecentTransactions(limit));
    });

    return unsubscribe;
  }, [limit]);

  if (transactions.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        No transactions yet
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {transactions.map((tx) => {
        const statusColors = {
          pending: 'text-blue-600 dark:text-blue-400',
          success: 'text-green-600 dark:text-green-400',
          failed: 'text-red-600 dark:text-red-400',
          cancelled: 'text-yellow-600 dark:text-yellow-400'
        };

        const statusIcons = {
          pending: '⏳',
          success: '✅',
          failed: '❌',
          cancelled: '⊘'
        };

        return (
          <div
            key={tx.hash}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`text-lg flex-shrink-0 ${statusColors[tx.status]}`}>
                {statusIcons[tx.status]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {tx.description}
                </p>
                <BaseScanLink
                  type="tx"
                  hash={tx.hash}
                  className="text-xs"
                />
              </div>
            </div>
            <span className={`text-xs font-medium ${statusColors[tx.status]} whitespace-nowrap ml-2`}>
              {tx.status === 'pending' ? 'Pending...' : tx.status}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface TransactionLoadingStateProps {
  isLoading: boolean;
  txHash?: string;
  message?: string;
  className?: string;
}

/**
 * Loading state indicator for transaction lifecycle
 */
export const TransactionLoadingState: React.FC<TransactionLoadingStateProps> = ({
  isLoading,
  txHash,
  message = 'Processing transaction...',
  className = ''
}) => {
  if (!isLoading) return null;

  return (
    <div className={`flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${className}`}>
      <div className="animate-spin">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{message}</p>
        {txHash && (
          <BaseScanLink
            type="tx"
            hash={txHash}
            label="View on BaseScan"
            className="text-xs"
          />
        )}
      </div>
    </div>
  );
};
