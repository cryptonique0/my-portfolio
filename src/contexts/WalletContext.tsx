'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchNetwork, useNetwork } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

/**
 * Wallet and Chain State
 */
export interface WalletState {
  address?: string;
  isConnected: boolean;
  isConnecting: boolean;
  chain?: {
    id: number;
    name: string;
    unsupported?: boolean;
  };
  isCorrectNetwork: boolean;
  error?: string;
}

/**
 * Wallet Actions
 */
export interface WalletActions {
  connect: (connectorId?: string) => Promise<void>;
  disconnect: () => void;
  switchToBase: () => Promise<boolean>;
  clearError: () => void;
  reconnect: () => Promise<void>;
}

/**
 * Wallet Context Type
 */
export interface WalletContextType {
  state: WalletState;
  actions: WalletActions;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Target Base Network Configuration
 */
const TARGET_BASE_CHAIN = process.env.NEXT_PUBLIC_USE_TESTNET === 'true' 
  ? baseSepolia 
  : base;

const BASE_CHAIN_IDS: number[] = [base.id, baseSepolia.id];

/**
 * Session Storage Keys
 */
const STORAGE_KEYS = {
  CONNECTED: 'wallet_connected',
  CONNECTOR_ID: 'wallet_connector_id',
  LAST_ADDRESS: 'wallet_last_address',
  AUTO_CONNECTED: 'wallet_auto_connected',
} as const;

/**
 * Wallet Context Provider Component
 * 
 * Features:
 * - Detect Base network
 * - Automatic network switching to Base
 * - Graceful error handling for rejected switches
 * - Session persistence across page refreshes
 * - Global wallet and chain state management
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { connect, connectors, isLoading: isConnecting } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchNetwork, isLoading: isSwitching } = useSwitchNetwork();

  const [error, setError] = useState<string>();
  const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState(false);
  const [switchAttempts, setSwitchAttempts] = useState(0);
  const [lastChainId, setLastChainId] = useState<number>();

  /**
   * Check if current chain is Base (mainnet or testnet)
   */
  const isCorrectNetwork = chain ? BASE_CHAIN_IDS.includes(chain.id) : false;

  /**
   * Switch to Base Network with enhanced error handling and retry logic
   */
  const switchToBase = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !switchNetwork) {
      setError('Please connect your wallet first');
      return false;
    }

    // Already on correct network
    if (isCorrectNetwork) {
      setSwitchAttempts(0);
      return true;
    }

    // Prevent too many retry attempts
    if (switchAttempts >= 3) {
      setError('Maximum switch attempts reached. Please switch to Base network manually.');
      return false;
    }

    try {
      setPendingSwitch(true);
      setError(undefined);
      setSwitchAttempts(prev => prev + 1);

      console.log(`🔄 Attempting to switch to ${TARGET_BASE_CHAIN.name} (Attempt ${switchAttempts + 1})`);

      await switchNetwork(TARGET_BASE_CHAIN.id);
      
      // Success - reset attempts
      setSwitchAttempts(0);
      console.log(`✅ Successfully switched to ${TARGET_BASE_CHAIN.name}`);
      
      // Store successful switch preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred_chain_id', TARGET_BASE_CHAIN.id.toString());
      }
      
      return true;
    } catch (err: any) {
      console.error('Network switch error:', err);
      
      // User rejected the request
      if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('denied')) {
        setError('You rejected the network switch. This app requires Base network to function properly.');
        console.log('⚠️ User rejected network switch');
        // Don't auto-retry on user rejection
        setSwitchAttempts(3);
      } 
      // Chain not added to wallet
      else if (err.code === 4902 || err.message?.includes('Unrecognized chain') || err.message?.includes('not added')) {
        const addChainInstructions = `
          To add Base network manually:
          1. Open your wallet
          2. Go to Settings → Networks
          3. Add Network with these details:
             - Network Name: ${TARGET_BASE_CHAIN.name}
             - RPC URL: ${TARGET_BASE_CHAIN.rpcUrls.default.http[0]}
             - Chain ID: ${TARGET_BASE_CHAIN.id}
             - Currency: ETH
        `;
        setError('Base network not found in your wallet. Please add it manually.');
        console.log('⚠️ Base network not configured:', addChainInstructions);
      }
      // RPC error or network unavailable
      else if (err.message?.includes('RPC') || err.message?.includes('network')) {
        setError('Network connection error. Please check your internet connection.');
      }
      // Generic errors
      else {
        setError(`Network switch failed: ${err.message || 'Unknown error'}. Please try again.`);
        console.error('❌ Network switch error:', err);
      }
      return false;
    } finally {
      setPendingSwitch(false);
    }
  }, [isConnected, isCorrectNetwork, switchNetwork, switchAttempts]);

  /**
   * Connect wallet with optional connector ID
   */
  const handleConnect = useCallback(async (connectorId?: string) => {
    try {
      setError(undefined);
      
      const connector = connectorId 
        ? connectors.find(c => c.id === connectorId) || connectors[0]
        : connectors[0];

      if (!connector) {
        throw new Error('No wallet connector available');
      }

      await connect({ connector });
      
      // Store connection preference
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true');
        localStorage.setItem(STORAGE_KEYS.CONNECTOR_ID, connector.id);
      }
    } catch (err: any) {
      if (err.message?.includes('rejected') || err.code === 4001) {
        setError('Connection rejected by user');
      } else {
        setError(`Failed to connect: ${err.message || 'Unknown error'}`);
      }
      console.error('❌ Wallet connection error:', err);
    }
  }, [connect, connectors]);

  /**
   * Disconnect wallet and clear session
   */
  const handleDisconnect = useCallback(() => {
    wagmiDisconnect();
    setError(undefined);
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CONNECTED);
      localStorage.removeItem(STORAGE_KEYS.CONNECTOR_ID);
      localStorage.removeItem(STORAGE_KEYS.LAST_ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.AUTO_CONNECTED);
    }
    
    console.log('👋 Wallet disconnected');
  }, [wagmiDisconnect]);

  /**
   * Reconnect to last used wallet
   */
  const handleReconnect = useCallback(async () => {
    if (typeof window === 'undefined' || hasAttemptedReconnect) return;

    const wasConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED);
    const lastConnectorId = localStorage.getItem(STORAGE_KEYS.CONNECTOR_ID);
    const autoConnected = localStorage.getItem(STORAGE_KEYS.AUTO_CONNECTED);

    if (wasConnected === 'true' && lastConnectorId && !autoConnected) {
      console.log('🔄 Attempting to reconnect wallet...');
      
      try {
        await handleConnect(lastConnectorId);
        localStorage.setItem(STORAGE_KEYS.AUTO_CONNECTED, 'true');
      } catch (err) {
        console.log('⚠️ Auto-reconnect failed');
      }
    }

    setHasAttemptedReconnect(true);
  }, [hasAttemptedReconnect, handleConnect]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  /**
   * Persist wallet address on connection
   */
  useEffect(() => {
    if (address && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LAST_ADDRESS, address);
    }
  }, [address]);

  /**
   * Auto-reconnect on mount
   */
  useEffect(() => {
    handleReconnect();
  }, [handleReconnect]);

  /**
   * Auto-switch to Base when connected to wrong network
   */
  useEffect(() => {
    if (isConnected && !isCorrectNetwork && !pendingSwitch && !error) {
      const timer = setTimeout(() => {
        console.log('⚠️ Wrong network detected, prompting switch to Base...');
        switchToBase();
      }, 1000); // Small delay to avoid immediate popup

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isConnected, isCorrectNetwork, pendingSwitch, error, switchToBase]);

  /**
   * Clear auto-connected flag on manual disconnect
   */
  useEffect(() => {
    if (!isConnected && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTO_CONNECTED);
      setSwitchAttempts(0);
    }
  }, [isConnected]);

  /**
   * Detect network changes and handle accordingly
   */
  useEffect(() => {
    if (chain?.id !== lastChainId) {
      setLastChainId(chain?.id);
      
      // User manually switched networks
      if (lastChainId !== undefined && chain?.id) {
        console.log(`🔀 Network changed: ${lastChainId} → ${chain.id}`);
        
        // User manually switched to Base - reset attempts and clear errors
        if (BASE_CHAIN_IDS.includes(chain.id)) {
          setSwitchAttempts(0);
          setError(undefined);
          console.log('✅ Manually switched to Base network');
        }
        // User switched away from Base
        else if (isConnected) {
          console.log('⚠️ Switched away from Base network');
        }
      }
    }
  }, [chain?.id, lastChainId, isConnected]);

  /**
   * Context value
   */
  const value: WalletContextType = {
    state: {
      address,
      isConnected,
      isConnecting: isConnecting || isSwitching || pendingSwitch,
      chain: chain ? {
        id: chain.id,
        name: chain.name,
        unsupported: chain.unsupported,
      } : undefined,
      isCorrectNetwork,
      error,
    },
    actions: {
      connect: handleConnect,
      disconnect: handleDisconnect,
      switchToBase,
      clearError,
      reconnect: handleReconnect,
    },
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to use Wallet Context
 * 
 * @throws Error if used outside of WalletProvider
 */
export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  
  return context;
}

/**
 * Convenience hook to get only wallet state
 */
export function useWalletState(): WalletState {
  const { state } = useWalletContext();
  return state;
}

/**
 * Convenience hook to get only wallet actions
 */
export function useWalletActions(): WalletActions {
  const { actions } = useWalletContext();
  return actions;
}
