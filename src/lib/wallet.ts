import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';

interface WalletContextType {
  address?: string;
  isConnected: boolean;
  isLoading: boolean;
}

/**
 * Custom hook to get wallet information (legacy - use useWalletContext instead)
 * @deprecated Use useWalletContext from @/contexts/WalletContext for better features
 */
export function useWallet(): WalletContextType {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(isConnecting);
  }, [isConnecting]);

  return {
    address,
    isConnected: !!address && !isDisconnected,
    isLoading,
  };
}

/**
 * Format wallet address for display
 * Truncates address to show first 6 and last 4 characters
 * 
 * @param address - Ethereum address to format
 * @param prefixLength - Number of characters to show at start (default: 6)
 * @param suffixLength - Number of characters to show at end (default: 4)
 * @returns Formatted address string
 */
export function formatAddress(
  address: string, 
  prefixLength: number = 6, 
  suffixLength: number = 4
): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Validate Ethereum address format
 * 
 * @param address - Address to validate
 * @returns true if valid Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Copy text to clipboard
 * 
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Open block explorer for address
 * 
 * @param address - Address to view
 * @param chainId - Chain ID (8453 for Base, 84532 for Base Sepolia)
 */
export function openBlockExplorer(address: string, chainId: number = 8453): void {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/address',
    8453: 'https://basescan.org/address',
    84532: 'https://sepolia.basescan.org/address',
    11155111: 'https://sepolia.etherscan.io/address',
  };

  const baseUrl = explorers[chainId] || explorers[8453];
  window.open(`${baseUrl}/${address}`, '_blank');
}

/**
 * Shorten transaction hash for display
 * 
 * @param hash - Transaction hash
 * @returns Shortened hash
 */
export function formatTxHash(hash: string): string {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Check if wallet is connected to correct network (Base)
 * 
 * @param chainId - Current chain ID
 * @returns true if on Base mainnet or testnet
 */
export function isBaseNetwork(chainId?: number): boolean {
  if (!chainId) return false;
  return chainId === 8453 || chainId === 84532;
}

/**
 * Detect if current network is Base and return network details
 * 
 * @param chainId - Current chain ID
 * @returns Base network details or null
 */
export function detectBaseNetwork(chainId?: number): { 
  isBase: boolean; 
  network: 'mainnet' | 'testnet' | null;
  name: string;
  chainId: number;
} | null {
  if (!chainId) return null;
  
  if (chainId === 8453) {
    return {
      isBase: true,
      network: 'mainnet',
      name: 'Base Mainnet',
      chainId: 8453,
    };
  }
  
  if (chainId === 84532) {
    return {
      isBase: true,
      network: 'testnet',
      name: 'Base Sepolia',
      chainId: 84532,
    };
  }
  
  return {
    isBase: false,
    network: null,
    name: getNetworkName(chainId),
    chainId,
  };
}

/**
 * Get recommended Base network based on environment
 * 
 * @returns Chain ID for Base mainnet or testnet
 */
export function getRecommendedBaseNetwork(): number {
  const useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === 'true';
  return useTestnet ? 84532 : 8453;
}

/**
 * Get network name from chain ID
 * 
 * @param chainId - Chain ID
 * @returns Network name
 */
export function getNetworkName(chainId?: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    8453: 'Base',
    84532: 'Base Sepolia',
    11155111: 'Sepolia',
  };

  return networks[chainId || 0] || 'Unknown Network';
}

/**
 * Format balance for display (ETH)
 * 
 * @param balance - Balance in wei (as bigint or string)
 * @param decimals - Number of decimals to show
 * @returns Formatted balance string
 */
export function formatBalance(balance: bigint | string, decimals: number = 4): string {
  const value = typeof balance === 'string' ? BigInt(balance) : balance;
  const eth = Number(value) / 1e18;
  return eth.toFixed(decimals);
}
