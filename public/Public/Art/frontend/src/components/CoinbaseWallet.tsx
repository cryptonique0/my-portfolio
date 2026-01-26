import React, { useEffect, useState } from 'react';
import {
  isCoinbaseWallet,
  detectCoinbaseWalletFeatures,
  CoinbaseWalletFeatures,
  getCoinbaseOptimizationMessage
} from '../services/coinbase';

interface CoinbaseWalletDetectorProps {
  className?: string;
  showMessage?: boolean;
}

/**
 * Detects Coinbase Wallet and shows optimization features
 */
export const CoinbaseWalletDetector: React.FC<CoinbaseWalletDetectorProps> = ({
  className = '',
  showMessage = true
}) => {
  const [isCoinbase, setIsCoinbase] = useState(false);
  const [features, setFeatures] = useState<CoinbaseWalletFeatures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectWallet = async () => {
      try {
        const coinbaseDetected = isCoinbaseWallet();
        setIsCoinbase(coinbaseDetected);

        if (coinbaseDetected) {
          const detectedFeatures = await detectCoinbaseWalletFeatures();
          setFeatures(detectedFeatures);
        }
      } catch (error) {
        console.error('Failed to detect Coinbase Wallet features:', error);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure wallet detection
    const timer = setTimeout(detectWallet, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !isCoinbase || !features) {
    return null;
  }

  const message = getCoinbaseOptimizationMessage();

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Coinbase Logo */}
        <span className="text-2xl flex-shrink-0">💳</span>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200">
            Coinbase Wallet Detected
          </h3>

          {showMessage && message && (
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              {message}
            </p>
          )}

          {/* Features */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {features.supportsEIP1559 && (
              <div className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <span>✓</span>
                <span>EIP-1559 Support</span>
              </div>
            )}
            {features.isSmartWallet && (
              <div className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <span>✓</span>
                <span>Smart Wallet</span>
              </div>
            )}
            {features.supportsBatchTx && (
              <div className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <span>✓</span>
                <span>Batch Transactions</span>
              </div>
            )}
            <div className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
              <span>✓</span>
              <span>Base Optimized</span>
            </div>
          </div>

          {/* Smart Wallet Specific Message */}
          {features.isSmartWallet && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-300">
              ✨ Your Smart Wallet can use gasless transactions on supported operations!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CoinbaseConnectButtonProps {
  onConnect: (address: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * Specialized connect button for Coinbase Wallet users
 */
export const CoinbaseConnectButton: React.FC<CoinbaseConnectButtonProps> = ({
  onConnect,
  disabled = false,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [isCoinbase, setIsCoinbase] = useState(false);

  useEffect(() => {
    setIsCoinbase(isCoinbaseWallet());
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install Coinbase Wallet.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const address = accounts?.[0];
      if (address) {
        await onConnect(address);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = isCoinbase
    ? '💳 Connect Coinbase Wallet'
    : 'Connect Wallet';

  const buttonClass = isCoinbase
    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600';

  return (
    <button
      onClick={handleConnect}
      disabled={disabled || loading}
      className={`px-6 py-2 ${buttonClass} text-white rounded-lg font-semibold disabled:opacity-50 transition-all ${className}`}
    >
      {loading ? '⏳ Connecting...' : buttonText}
    </button>
  );
};

interface CoinbaseGasUIProps {
  gasCostEth: number;
  className?: string;
}

/**
 * Specialized gas cost display for Coinbase Wallet users
 */
export const CoinbaseGasUI: React.FC<CoinbaseGasUIProps> = ({
  gasCostEth,
  className = ''
}) => {
  const isCoinbase = isCoinbaseWallet();

  if (!isCoinbase) return null;

  const isCheap = gasCostEth < 0.01;
  const isFree = gasCostEth < 0.001;

  return (
    <div className={`rounded-lg p-3 ${isFree ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'} ${className}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isFree ? 'text-green-800 dark:text-green-300' : 'text-blue-800 dark:text-blue-300'}`}>
          Network Fee
        </span>
        <span className={`text-lg font-bold ${isFree ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>
          {gasCostEth.toFixed(6)} ETH
        </span>
      </div>

      {isFree && (
        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
          🎉 Virtually free! Your Smart Wallet transaction is almost gas-free.
        </p>
      )}

      {isCheap && !isFree && (
        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
          💰 Super affordable on Base - even cheaper with bulk operations!
        </p>
      )}
    </div>
  );
};
