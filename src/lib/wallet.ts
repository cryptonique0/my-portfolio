import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

interface WalletContextType {
  address?: string;
  isConnected: boolean;
  isLoading: boolean;
}

/**
 * Custom hook to get wallet information
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
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
