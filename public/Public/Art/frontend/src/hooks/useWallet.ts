import { useEffect, useState } from 'react';
import { walletService } from '../services/wallet';
import { useUserStore } from '../store';

const SESSION_STORAGE_KEY = 'bitart_wallet_session';

interface SessionData {
  address: string;
  chain: 'base';
  network: 'testnet' | 'mainnet';
  timestamp: number;
}

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const { user, setUser } = useUserStore();

  /**
   * Restore session from localStorage if valid
   */
  const restoreSession = async () => {
    try {
      const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionStr) return;

      const session: SessionData = JSON.parse(sessionStr);
      
      // Check if session is less than 7 days old
      const sessionAge = Date.now() - session.timestamp;
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      
      if (sessionAge > SEVEN_DAYS) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return;
      }

      // Try to reconnect with saved address
      const currentUser = await walletService.getCurrentUser();
      if (currentUser && currentUser.address === session.address) {
        setUser({
          address: currentUser.address || null,
          username: currentUser.username || null,
          avatar: null,
          chain: 'base',
          balance: currentUser.balance || null,
          isConnected: true
        });
      }
    } catch (err) {
      // Session restore failed, clear it
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  /**
   * Save session to localStorage
   */
  const saveSession = (address: string, network: 'testnet' | 'mainnet') => {
    const session: SessionData = {
      address,
      chain: 'base',
      network,
      timestamp: Date.now()
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  };

  /**
   * Clear session from localStorage
   */
  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  useEffect(() => {
    // Restore session on component mount
    restoreSession();

    // Check if user is already logged in
    (async () => {
      if (walletService.isUserLoggedIn()) {
        const currentUser = await walletService.getCurrentUser();
        if (currentUser) {
          setUser({
            address: currentUser.address || null,
            username: currentUser.username || null,
            avatar: null,
            chain: 'base',
            balance: currentUser.balance || null,
            isConnected: true
          });
        }
      }
    })();

    // Listen for account and disconnect events
    const unsubscribeAccount = walletService.onAccountChange((accounts) => {
      if (accounts.length > 0) {
        // Account changed, reload user data
        (async () => {
          const currentUser = await walletService.getCurrentUser();
          if (currentUser) {
            setUser({
              address: currentUser.address || null,
              username: currentUser.username || null,
              avatar: null,
              chain: 'base',
              balance: currentUser.balance || null,
              isConnected: true
            });
            if (currentUser.address) {
              saveSession(currentUser.address, currentUser.network as 'testnet' | 'mainnet');
            }
          }
        })();
      }
    });

    const unsubscribeDisconnect = walletService.onDisconnect(() => {
      setUser({
        address: null,
        username: null,
        avatar: null,
        chain: null,
        balance: null,
        isConnected: false
      });
      clearSession();
    });

    return () => {
      unsubscribeAccount?.();
      unsubscribeDisconnect?.();
    };
  }, [setUser]);

  const connect = async (isTestnet: boolean = true) => {
    setLoading(true);
    setError(null);
    setDisconnectError(null);
    try {
      const connection = await walletService.connectWallet(isTestnet);
      if (connection) {
        const currentUser = await walletService.getCurrentUser();
        if (currentUser) {
          setUser({
            address: currentUser.address || null,
            username: currentUser.username || null,
            avatar: null,
            chain: 'base',
            balance: currentUser.balance || null,
            isConnected: true
          });
          
          // Save session for persistence
          if (currentUser.address) {
            saveSession(currentUser.address, isTestnet ? 'testnet' : 'mainnet');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    try {
      walletService.disconnectWallet();
      clearSession();
      setUser({
        address: null,
        username: null,
        avatar: null,
        chain: null,
        balance: null,
        isConnected: false
      });
    } catch (err: any) {
      setDisconnectError(err.message || 'Failed to disconnect wallet');
    }
  };

  const switchNetwork = async (isTestnet: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const success = await walletService.switchToBase(isTestnet);
      if (success && user?.address) {
        saveSession(user.address, isTestnet ? 'testnet' : 'mainnet');
        // Reload user data to update balance
        const currentUser = await walletService.getCurrentUser();
        if (currentUser) {
          setUser({
            ...user,
            balance: currentUser.balance || null
          });
        }
      } else if (!success) {
        setError('Failed to switch network');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    disconnectError,
    clearDisconnectError: () => setDisconnectError(null),
    chain: 'base' as const,
    connect,
    disconnect,
    switchNetwork,
    isConnected: user.isConnected
  };
};
