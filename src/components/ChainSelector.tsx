/**
 * Chain Selector Component
 * Allows users to switch between EVM chains and Stacks
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useSwitchChain } from 'wagmi';
import { useChainDetection, getNetworksByType, getAllNetworks } from '@/lib/chain-utils';
import { ChainType, NETWORKS } from '@/lib/web3-config';
import { useStacksChain } from '@/lib/chain-utils';

interface ChainSelectorProps {
  onChainChange?: (chainId: number | string, chainName: string) => void;
  className?: string;
}

export function ChainSelector({ onChainChange, className = '' }: ChainSelectorProps) {
  const { currentChain, isEvmChain, isStacksChain, switchToChain } = useChainDetection();
  const { switchStacksNetwork } = useStacksChain();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);

  const allNetworks = getAllNetworks();

  const handleChainSelect = useCallback(
    async (chainId: number | string, chainName: string) => {
      try {
        if (typeof chainId === 'number') {
          // EVM chain
          await switchChain?.({ chainId });
        } else {
          // Stacks chain
          const isTestnet = chainId === '2147483648';
          switchStacksNetwork(isTestnet ? 'testnet' : 'mainnet');
        }
        onChainChange?.(chainId, chainName);
        setShowDropdown(false);
      } catch (error) {
        console.error('Failed to switch chain:', error);
      }
    },
    [switchChain, switchStacksNetwork, onChainChange]
  );

  const currentChainName = currentChain?.name || 'Select Chain';
  const currentChainIcon = getChainIcon(currentChain?.id?.toString());

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{currentChainIcon}</span>
        <span className="font-medium text-sm">{currentChainName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* EVM Networks Group */}
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                EVM Networks
              </div>
              {getNetworksByType(ChainType.EVM).map((network) => (
                <button
                  key={network.id}
                  onClick={() => handleChainSelect(network.id, network.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentChain?.id === network.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{getChainIcon(network.id.toString())}</span>
                    <div>
                      <div>{network.name}</div>
                      <div className="text-xs text-gray-500">ID: {network.id}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Stacks Networks Group */}
            <div className="border-t border-gray-200 pt-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Bitcoin L2
              </div>
              {getNetworksByType(ChainType.STACKS).map((network) => (
                <button
                  key={network.id}
                  onClick={() => handleChainSelect(network.id, network.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentChain?.id === network.id
                      ? 'bg-purple-100 text-purple-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{getChainIcon(network.id.toString())}</span>
                    <div>
                      <div>{network.name}</div>
                      <div className="text-xs text-gray-500">STX</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get emoji icon for chain
 */
function getChainIcon(chainId?: string): string {
  switch (chainId) {
    case '8453':
      return '🔵'; // Base
    case '84532':
      return '🔷'; // Base Sepolia
    case '1':
      return '⟠'; // Ethereum
    case '11155111':
      return '⟡'; // Sepolia
    case '0':
      return '🟡'; // Stacks Mainnet
    case '2147483648':
      return '🟠'; // Stacks Testnet
    default:
      return '⛓️';
  }
}

/**
 * Chain Status Badge Component
 */
export interface ChainStatusProps {
  chainId?: number | string;
  className?: string;
  showName?: boolean;
}

export function ChainStatusBadge({ chainId, className = '', showName = true }: ChainStatusProps) {
  const { currentChain } = useChainDetection();
  const chain = currentChain;

  if (!chain) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm ${className}`}>
        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
        <span className="text-gray-600">Disconnected</span>
      </div>
    );
  }

  const isMainnet = chainId?.toString().includes('1') || chainId?.toString().includes('8453');
  const statusColor = isMainnet ? 'green' : 'yellow';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 bg-${statusColor}-100 rounded-full text-sm ${className}`}
    >
      <span className={`w-2 h-2 bg-${statusColor}-500 rounded-full`}></span>
      <span className={`text-${statusColor}-900 font-medium`}>
        {showName ? chain.name : chain.name.split(' ')[0]}
      </span>
    </div>
  );
}

/**
 * Multi-Chain Profile Status Component
 */
export interface MultiChainStatusProps {
  deployedChains?: (number | string)[];
  className?: string;
}

export function MultiChainStatus({ deployedChains = [], className = '' }: MultiChainStatusProps) {
  const allNetworks = getAllNetworks();

  if (deployedChains.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Not deployed to any chain yet
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {deployedChains.map((chainId) => {
        const network = allNetworks.find((n) => n.id === chainId);
        if (!network) return null;

        return (
          <div
            key={chainId}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
          >
            <span>{getChainIcon(chainId.toString())}</span>
            <span>{network.name}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Chain Information Card Component
 */
export interface ChainInfoCardProps {
  chainId?: number | string;
  className?: string;
}

export function ChainInfoCard({ chainId, className = '' }: ChainInfoCardProps) {
  const { currentChain } = useChainDetection();
  const chain = currentChain;

  if (!chain) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg text-gray-600 ${className}`}>
        <p className="text-sm">Please connect your wallet to view chain information</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Chain Name</label>
          <p className="text-lg font-bold text-gray-900">{chain.name}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Chain ID</label>
          <p className="font-mono text-sm text-gray-700">{chain.id}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Currency</label>
          <p className="text-sm text-gray-700">{chain.currency}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
          <p className="text-sm text-gray-700 capitalize">
            {chain.type === 'evm' ? 'EVM Compatible' : 'Bitcoin L2 (Stacks)'}
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Block Explorer</label>
          <a
            href={chain.blockExplorer}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 truncate"
          >
            {new URL(chain.blockExplorer).hostname}
          </a>
        </div>
      </div>
    </div>
  );
}
