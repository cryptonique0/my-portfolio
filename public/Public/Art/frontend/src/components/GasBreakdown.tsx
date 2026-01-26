import React, { useEffect, useState } from 'react';
import { getBaseGasPrice, estimateTransactionGas, calculateFeeBreakdown, formatPrice, GasEstimate, TransactionFeeBreakdown } from '../services/gas';

interface GasBreakdownProps {
  itemPrice?: number; // in ETH, optional
  royaltyPercentage?: number; // 0-100
  estimateFunction?: () => Promise<string>; // Optional: async function that returns data for gas estimation
  to?: string; // Contract address for estimation
  from?: string; // User address for estimation
  showDetailed?: boolean; // Show detailed breakdown
  className?: string;
}

export const GasBreakdown: React.FC<GasBreakdownProps> = ({
  itemPrice = 0,
  royaltyPercentage = 0,
  estimateFunction,
  to,
  from,
  showDetailed = false,
  className = ''
}) => {
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [breakdown, setBreakdown] = useState<TransactionFeeBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGasEstimate = async () => {
      setLoading(true);
      setError(null);

      try {
        let estimate: GasEstimate;

        if (estimateFunction) {
          // If custom estimation function provided, use it
          const data = await estimateFunction();
          if (to) {
            estimate = await estimateTransactionGas(to, data, from);
          } else {
            estimate = await getBaseGasPrice();
          }
        } else {
          // Just get current gas price
          estimate = await getBaseGasPrice();
        }

        setGasEstimate(estimate);

        // Calculate fee breakdown
        const feeBreakdown = calculateFeeBreakdown(
          itemPrice,
          estimate.estimatedGasCostEth,
          royaltyPercentage
        );
        setBreakdown(feeBreakdown);
      } catch (err: any) {
        setError(err.message || 'Failed to estimate gas');
      } finally {
        setLoading(false);
      }
    };

    // Debounce gas estimation to avoid too many RPC calls
    const timer = setTimeout(fetchGasEstimate, 500);
    return () => clearTimeout(timer);
  }, [itemPrice, royaltyPercentage, estimateFunction, to, from]);

  if (!gasEstimate || !breakdown) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        {loading ? '⚡ Estimating gas...' : '—'}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-600 dark:text-red-400 ${className}`}>
        ⚠️ {error}
      </div>
    );
  }

  if (itemPrice === 0 && !showDetailed) {
    // Show minimal gas display
    return (
      <div className={`text-sm ${className}`}>
        <span className="font-semibold">Gas:</span>{' '}
        <span className={breakdown.isCheapGas ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
          ~{formatPrice(breakdown.estimatedGasCost)} ETH
          {breakdown.isCheapGas && ' 🎉 (Cheap!)'}
        </span>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">⚡ Fee Breakdown</h3>
        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
          Base Cheap Gas
        </div>
      </div>

      {/* Breakdown Items */}
      <div className="space-y-2 text-sm">
        {itemPrice > 0 && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Item Price</span>
              <span className="font-medium">{formatPrice(breakdown.itemPrice)} ETH</span>
            </div>

            {breakdown.platformFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform Fee ({breakdown.platformFeeBps / 100}%)</span>
                <span className="font-medium">{formatPrice(breakdown.platformFee)} ETH</span>
              </div>
            )}

            {breakdown.royaltyFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Creator Royalty ({breakdown.royaltyPercentage}%)</span>
                <span className="font-medium">{formatPrice(breakdown.royaltyFee)} ETH</span>
              </div>
            )}

            <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
          </>
        )}

        {/* Gas Cost */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Network Fee (Gas)</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatPrice(breakdown.estimatedGasCost)} ETH</span>
            {breakdown.isCheapGas && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                🎉 Ultra cheap!
              </span>
            )}
          </div>
        </div>

        {/* Gas Price Details */}
        {showDetailed && (
          <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 rounded p-2">
            <div className="flex justify-between">
              <span>Gas Price:</span>
              <span>{formatPrice(gasEstimate.gasPriceGwei, 3)} Gwei</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Gas Limit:</span>
              <span>{parseInt(gasEstimate.gasLimit).toLocaleString()} units</span>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      {itemPrice > 0 && (
        <div className="border-t border-gray-300 dark:border-gray-600 mt-3 pt-3 flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">Total Cost</span>
          <div className="text-right">
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {formatPrice(breakdown.totalCost)} ETH
            </div>
            {breakdown.savings > 0 && (
              <div className="text-xs text-green-600 dark:text-green-400">
                Save ~{formatPrice(breakdown.savings)} vs mainnet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cheap Gas Badge */}
      {breakdown.isCheapGas && itemPrice > 0 && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-300">
          ✨ This transaction is extremely affordable on Base! Your gas costs are less than 1% of the item price.
        </div>
      )}
    </div>
  );
};
