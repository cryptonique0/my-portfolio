import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { EnhancedThemeToggle } from './EnhancedThemeToggle';
import { BaseNativeBadge } from './Badge';
import { WalletDisconnectBanner, WalletErrorBanner } from './WalletErrors';
import { isCoinbaseWallet } from '../services/coinbase';

export const Header: React.FC = () => {
  const { 
    user, 
    connect, 
    disconnect, 
    isConnected,
    error, 
    loading,
    disconnectError,
    clearDisconnectError
  } = useWallet();
  const [isCoinbase, setIsCoinbase] = useState(false);

  // Detect Coinbase Wallet
  useEffect(() => {
    setIsCoinbase(isCoinbaseWallet());
  }, []);

  return (
    <>
      {/* Error Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {disconnectError && (
          <WalletDisconnectBanner
            error={disconnectError}
            onDismiss={clearDisconnectError}
            onReconnect={() => connect(true)}
            isLoading={loading}
          />
        )}
        {error && !disconnectError && (
          <WalletErrorBanner
            error={error}
            onDismiss={() => {}}
            type="error"
          />
        )}
      </div>

      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/images/logo.png" 
              alt="BitArt Market" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link
              to="/discover"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Discover
            </Link>
            <Link
              to="/create"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Create
            </Link>
            <Link
              to="/studio"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Studio
            </Link>
            {isConnected && (
              <Link
                to="/transaction-history"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                📜 History
              </Link>
            )}
            {isConnected && (
              <Link
                to="/wishlist"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                ⭐ Wishlist
              </Link>
            )}
            {isConnected && (
              <Link
                to="/collections"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                📁 Collections
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <EnhancedThemeToggle />

            {/* Coinbase Badge */}
            {isCoinbase && (
              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full hidden sm:inline">
                💳 Coinbase
              </span>
            )}

            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* Base Badge */}
                <BaseNativeBadge />
                <Link
                  to={`/profile/${user.address}`}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold hover:shadow-lg transition-shadow"
                  title={user.address || ''}
                >
                  {user.address?.substring(0, 2).toUpperCase()}
                </Link>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect(true)}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 transition-all ${
                  isCoinbase
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                }`}
              >
                {loading ? 'Connecting...' : isCoinbase ? '💳 Connect' : 'Connect Wallet'}
              </button>
            )}
            {error && (
              <div className="text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
};
