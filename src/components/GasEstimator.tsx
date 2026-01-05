'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BoltIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

type TransactionType = 
  | 'createProfile'
  | 'addCredential'
  | 'updateProfile'
  | 'mintBadge'
  | 'batchMintBadges'
  | 'transferBadge';

interface GasEstimate {
  type: TransactionType;
  estimatedGas: number;
  gasPriceGwei: number;
  estimatedCostETH: string;
  estimatedCostUSD: string;
  executionTime: string;
}

const GAS_ESTIMATES: Record<TransactionType, number> = {
  createProfile: 120_000,
  addCredential: 80_000,
  updateProfile: 45_000,
  mintBadge: 60_000,
  batchMintBadges: 35_000, // per badge in batch
  transferBadge: 30_000
};

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  createProfile: 'Create Profile',
  addCredential: 'Add Credential',
  updateProfile: 'Update Profile',
  mintBadge: 'Mint Badge',
  batchMintBadges: 'Batch Mint Badges',
  transferBadge: 'Transfer Badge'
};

export default function GasEstimator() {
  const [selectedType, setSelectedType] = useState<TransactionType>('createProfile');
  const [batchSize, setBatchSize] = useState(1);
  const [currentGasPrice, setCurrentGasPrice] = useState(0.5); // Gwei
  const [ethPrice, setEthPrice] = useState(3000); // USD

  // Calculate estimate
  const calculateEstimate = (): GasEstimate => {
    let estimatedGas = GAS_ESTIMATES[selectedType];
    
    // Adjust for batch operations
    if (selectedType === 'batchMintBadges' && batchSize > 1) {
      estimatedGas = estimatedGas * batchSize;
    }

    const gasCostGwei = estimatedGas * currentGasPrice;
    const gasCostETH = gasCostGwei / 1_000_000_000;
    const gasCostUSD = gasCostETH * ethPrice;

    return {
      type: selectedType,
      estimatedGas,
      gasPriceGwei: currentGasPrice,
      estimatedCostETH: gasCostETH.toFixed(6),
      estimatedCostUSD: gasCostUSD.toFixed(2),
      executionTime: '~15 seconds'
    };
  };

  const estimate = calculateEstimate();

  const isExpensive = parseFloat(estimate.estimatedCostUSD) > 5;
  const isCheap = parseFloat(estimate.estimatedCostUSD) < 0.50;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <BoltIcon className="h-8 w-8 text-yellow-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Gas Estimator</h2>
          <p className="text-sm text-gray-400">Estimate transaction costs before executing</p>
        </div>
      </div>

      {/* Transaction Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Transaction Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as TransactionType)}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.entries(TRANSACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Batch Size (for batch operations) */}
      {selectedType === 'batchMintBadges' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Batch Size: {batchSize}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      )}

      {/* Current Gas Price */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Current Gas Price: {currentGasPrice} Gwei
        </label>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={currentGasPrice}
          onChange={(e) => setCurrentGasPrice(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0.1 (Base L2)</span>
          <span>10 (High)</span>
        </div>
      </div>

      {/* Estimate Results */}
      <motion.div
        key={`${selectedType}-${batchSize}-${currentGasPrice}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`p-6 rounded-xl border-2 ${
          isExpensive 
            ? 'bg-red-500/10 border-red-500/50' 
            : isCheap 
            ? 'bg-green-500/10 border-green-500/50'
            : 'bg-blue-500/10 border-blue-500/50'
        }`}
      >
        {/* Warning for expensive transactions */}
        {isExpensive && (
          <div className="flex items-center space-x-2 mb-4 text-red-400">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">High gas cost - consider waiting</span>
          </div>
        )}

        {/* Cheap transaction indicator */}
        {isCheap && (
          <div className="flex items-center space-x-2 mb-4 text-green-400">
            <BoltIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Great time to transact! 🎉</span>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-gray-400 mb-1">
              <BoltIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Gas Units</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {estimate.estimatedGas.toLocaleString()}
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-gray-400 mb-1">
              <ClockIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Execution Time</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {estimate.executionTime}
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-gray-400 mb-1">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Cost (ETH)</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {estimate.estimatedCostETH}
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-gray-400 mb-1">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Cost (USD)</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${estimate.estimatedCostUSD}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            💡 <strong>Tip:</strong> Base network typically has gas prices under 1 Gwei, 
            making transactions extremely affordable compared to Ethereum mainnet.
          </p>
        </div>
      </motion.div>

      {/* Optimization Tips */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">
          ⚡ Gas Optimization Tips
        </h3>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Batch mint multiple badges to save gas per badge</li>
          <li>• Update profiles during off-peak hours</li>
          <li>• Use Base L2 for ~90% lower gas costs</li>
          <li>• Soulbound badges prevent unnecessary transfers</li>
        </ul>
      </div>

      {/* Historical Comparison */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">24h Low</p>
          <p className="text-sm font-bold text-green-400">0.3 Gwei</p>
        </div>
        <div className="text-center p-3 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">24h Average</p>
          <p className="text-sm font-bold text-blue-400">0.5 Gwei</p>
        </div>
        <div className="text-center p-3 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">24h High</p>
          <p className="text-sm font-bold text-orange-400">1.2 Gwei</p>
        </div>
      </div>
    </div>
  );
}

// Compact version for inline use
export function QuickGasEstimate({ type }: { type: TransactionType }) {
  const gasEstimate = GAS_ESTIMATES[type];
  const gasCostETH = (gasEstimate * 0.5) / 1_000_000_000; // Assuming 0.5 Gwei
  const gasCostUSD = (gasCostETH * 3000).toFixed(2); // Assuming $3000 ETH

  return (
    <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
      <BoltIcon className="h-4 w-4" />
      <span>~${gasCostUSD}</span>
    </div>
  );
}
