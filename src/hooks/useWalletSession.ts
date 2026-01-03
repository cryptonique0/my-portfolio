'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { detectBaseNetwork } from '@/lib/wallet';

/**
 * Wallet Session State
 */
export interface WalletSession {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  hasWallet: boolean;
  
  // Account info
  address?: string;
  shortAddress?: string;
  
  // Network info
  chainId?: number;
  chainName?: string;
  isBaseNetwork: boolean;
  networkType?: 'mainnet' | 'testnet' | null;
  
  // Session persistence
  isSessionRestored: boolean;
  wasAutoConnected: boolean;
  
  // Error state
  error?: string;
  hasError: boolean;
}

/**
 * Wallet Session Actions
 */
export interface WalletSessionActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToBase: () => Promise<boolean>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

/**
 * Enhanced Wallet Session Hook
 * 
 * Provides comprehensive wallet state management with:
 * - Base network detection and switching
 * - Session persistence across page refresh
 * - Automatic reconnection handling
 * - Error state management
 * - Formatted address display
 * 
 * @returns Wallet session state and actions
 */
export function useWalletSession(): {
  session: WalletSession;
  actions: WalletSessionActions;
} {
  const { state, actions: contextActions } = useWalletContext();
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const [wasAutoConnected, setWasAutoConnected] = useState(false);

  // Detect if user has a wallet provider (MetaMask, etc.)
  const hasWallet = typeof window !== 'undefined' && (
    !!(window as any).ethereum || 
    !!(window as any).web3
  );

  // Detect Base network
  const baseNetworkInfo = detectBaseNetwork(state.chain?.id);
  const isBaseNetwork = baseNetworkInfo?.isBase ?? false;
  const networkType = baseNetworkInfo?.network ?? null;

  // Format address for display
  const shortAddress = state.address 
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : undefined;

  /**
   * Check if session was restored from storage
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasConnected = localStorage.getItem('wallet_connected') === 'true';
      const autoConnected = localStorage.getItem('wallet_auto_connected') === 'true';
      
      if (state.isConnected && wasConnected) {
        setIsSessionRestored(true);
        setWasAutoConnected(autoConnected);
        console.log('✅ Wallet session restored');
      }
    }
  }, [state.isConnected]);

  /**
   * Connect wallet (uses first available connector)
   */
  const connect = useCallback(async () => {
    try {
      await contextActions.connect();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  }, [contextActions]);

  /**
   * Disconnect and clear session
   */
  const disconnect = useCallback(() => {
    contextActions.disconnect();
    setIsSessionRestored(false);
    setWasAutoConnected(false);
  }, [contextActions]);

  /**
   * Refresh session (attempt reconnection if needed)
   */
  const refreshSession = useCallback(async () => {
    if (!state.isConnected && typeof window !== 'undefined') {
      const wasConnected = localStorage.getItem('wallet_connected') === 'true';
      if (wasConnected) {
        try {
          await contextActions.reconnect();
        } catch (err) {
          console.error('Session refresh failed:', err);
        }
      }
    }
  }, [state.isConnected, contextActions]);

  /**
   * Build session state
   */
  const session: WalletSession = {
    // Connection status
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    hasWallet,
    
    // Account info
    address: state.address,
    shortAddress,
    
    // Network info
    chainId: state.chain?.id,
    chainName: state.chain?.name,
    isBaseNetwork,
    networkType,
    
    // Session persistence
    isSessionRestored,
    wasAutoConnected,
    
    // Error state
    error: state.error,
    hasError: !!state.error,
  };

  const sessionActions: WalletSessionActions = {
    connect,
    disconnect,
    switchToBase: contextActions.switchToBase,
    clearError: contextActions.clearError,
    refreshSession,
  };

  return {
    session,
    actions: sessionActions,
  };
}

/**
 * Hook to check if user needs to switch to Base network
 * 
 * @returns true if connected but not on Base
 */
export function useNeedsBaseSwitch(): boolean {
  const { session } = useWalletSession();
  return session.isConnected && !session.isBaseNetwork;
}

/**
 * Hook to get current network status
 * 
 * @returns Network status info
 */
export function useNetworkStatus(): {
  isCorrect: boolean;
  needsSwitch: boolean;
  chainId?: number;
  chainName?: string;
  isBase: boolean;
} {
  const { session } = useWalletSession();
  
  return {
    isCorrect: session.isBaseNetwork,
    needsSwitch: session.isConnected && !session.isBaseNetwork,
    chainId: session.chainId,
    chainName: session.chainName,
    isBase: session.isBaseNetwork,
  };
}

/**
 * Hook to monitor wallet connection persistence
 * Logs connection state changes for debugging
 */
export function useWalletPersistence(): void {
  const { session } = useWalletSession();

  useEffect(() => {
    if (session.isConnected) {
      console.log('🔗 Wallet Connected:', {
        address: session.shortAddress,
        chain: session.chainName,
        isBase: session.isBaseNetwork,
        restored: session.isSessionRestored,
      });
    }
  }, [session.isConnected, session.address]);
}
