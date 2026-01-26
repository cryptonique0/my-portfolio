import React, { useEffect, useState } from 'react';
import {
  isGaslessEnabled,
  supportsAccountAbstraction,
  isEligibleForGasless,
  getGaslessListingEstimate,
  GASLESS_FEATURES
} from '../services/gasless';

interface GaslessIndicatorProps {
  userAddress?: string;
  className?: string;
}

/**
 * Shows gasless availability and savings
 */
export const GaslessIndicator: React.FC<GaslessIndicatorProps> = ({
  userAddress,
  className = ''
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGasless = async () => {
      setLoading(true);
      try {
        const available = isGaslessEnabled();
        setIsAvailable(available);

        if (available && userAddress) {
          const [supportsAA, eligible] = await Promise.all([
            supportsAccountAbstraction(userAddress),
            isEligibleForGasless(userAddress)
          ]);
          setIsEligible(eligible && supportsAA);
        }
      } finally {
        setLoading(false);
      }
    };

    checkGasless();
  }, [userAddress]);

  if (loading || !isAvailable) return null;

  const estimate = getGaslessListingEstimate();

  return (
    <div className={`border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚡</span>
        <div className="flex-1">
          <h3 className="font-semibold text-green-900 dark:text-green-200">
            {isEligible ? 'Gasless Listing Available!' : 'Gasless Listings (Coming Soon)'}
          </h3>

          {isEligible ? (
            <>
              <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                Your transaction will be sponsored by our Paymaster service.
              </p>

              <div className="mt-3 space-y-2 text-xs text-green-700 dark:text-green-400">
                <div className="flex justify-between">
                  <span>Normal Gas Cost:</span>
                  <span className="font-medium line-through">{estimate.normalGasCost.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Cost:</span>
                  <span className="font-bold text-lg">FREE ✨</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings:</span>
                  <span className="text-green-600 dark:text-green-300 font-semibold">
                    {estimate.netSavings.toFixed(4)} ETH
                  </span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-green-100 dark:bg-green-800/50 border border-green-200 dark:border-green-700 rounded text-xs text-green-800 dark:text-green-300">
                🎉 First 5 listings: {GASLESS_FEATURES.gaslessListingBonus}
              </div>
            </>
          ) : (
            <p className="text-sm text-green-800 dark:text-green-300 mt-1">
              Enable gasless transactions on your account to save up to {estimate.gaslessReduction}% on listing fees.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface GaslessToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  userAddress?: string;
  className?: string;
}

/**
 * Toggle gasless vs normal transaction
 */
export const GaslessToggle: React.FC<GaslessToggleProps> = ({
  enabled,
  onToggle,
  userAddress,
  className = ''
}) => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (userAddress && isGaslessEnabled()) {
        const supported = await supportsAccountAbstraction(userAddress);
        setIsSupported(supported);
      }
    };
    check();
  }, [userAddress]);

  if (!isSupported) return null;

  return (
    <label className={`flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-4 h-4 rounded text-green-600"
      />
      <div>
        <p className="font-medium text-gray-900 dark:text-white">
          Use Gasless Transaction {enabled && '⚡'}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {enabled
            ? 'Your listing will be sponsored - completely free!'
            : 'Pay gas fee manually'}
        </p>
      </div>
    </label>
  );
};

interface GaslessBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Badge indicating gasless capability
 */
export const GaslessBadge: React.FC<GaslessBadgeProps> = ({ size = 'sm', className = '' }) => {
  if (!GASLESS_FEATURES.showGaslessBadges) return null;

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full ${sizeClass} ${className}`}>
      <span>⚡</span>
      <span>Gasless</span>
    </span>
  );
};

interface GaslessBannerProps {
  className?: string;
}

/**
 * Promotional banner for gasless listings
 */
export const GaslessBanner: React.FC<GaslessBannerProps> = ({ className = '' }) => {
  if (!isGaslessEnabled()) return null;

  const estimate = getGaslessListingEstimate();

  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">⚡</span>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-green-900 dark:text-green-200">
            List NFTs for Free!
          </h2>
          <p className="text-sm text-green-800 dark:text-green-300 mt-1">
            Save up to {estimate.gaslessReduction}% on gas fees with our Paymaster-sponsored listings.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
              ✓ No gas fees
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
              ✓ Instant transactions
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
              ✓ Account abstraction enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
