'use client';

import { useWalletSession, useNetworkStatus } from '@/hooks/useWalletSession';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Network Status Banner Component
 * 
 * Displays persistent network status and prompts user to switch to Base
 * when connected to wrong network.
 * 
 * Features:
 * - Automatic detection of Base network
 * - One-click network switching
 * - Graceful error handling
 * - Auto-dismiss on correct network
 */
export function NetworkStatusBanner() {
  const { session, actions } = useWalletSession();
  const networkStatus = useNetworkStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Reset dismissed state when network changes
  useEffect(() => {
    if (networkStatus.isCorrect) {
      setIsDismissed(false);
    }
  }, [networkStatus.isCorrect]);

  // Auto-dismiss success message
  useEffect(() => {
    if (networkStatus.isCorrect && session.isConnected) {
      const timer = setTimeout(() => setIsDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [networkStatus.isCorrect, session.isConnected]);

  const handleSwitch = async () => {
    setIsSwitching(true);
    try {
      await actions.switchToBase();
    } finally {
      setIsSwitching(false);
    }
  };

  // Don't show if not connected or dismissed
  if (!session.isConnected || isDismissed) {
    return null;
  }

  // Correct network - show success briefly
  if (networkStatus.isCorrect) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-lg shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✅</span>
              <div>
                <p className="text-green-300 font-medium text-sm">
                  Connected to {session.chainName}
                </p>
                <p className="text-green-200/60 text-xs">
                  {session.shortAddress}
                </p>
              </div>
              <button
                onClick={() => setIsDismissed(true)}
                className="text-green-300 hover:text-green-100 transition-colors ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Wrong network - show switch prompt
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <div className="px-6 py-4 rounded-xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-lg shadow-xl">
          <div className="flex items-start gap-4">
            <span className="text-amber-400 text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-amber-300 font-semibold text-sm mb-1">
                Wrong Network Detected
              </p>
              <p className="text-amber-200/70 text-xs mb-3">
                You're connected to {session.chainName}. This app requires Base network.
              </p>
              
              {/* Error message */}
              {session.error && (
                <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-300 text-xs">{session.error}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSwitch}
                  disabled={isSwitching}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSwitching ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                          fill="none"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Switching...
                    </span>
                  ) : (
                    'Switch to Base'
                  )}
                </button>
                
                <button
                  onClick={() => setIsDismissed(true)}
                  className="px-3 py-2 rounded-lg text-amber-300 text-sm hover:bg-amber-500/10 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Example: Using the wallet session hook in a component
 */
export function WalletSessionExample() {
  const { session, actions } = useWalletSession();

  return (
    <div className="p-6 rounded-xl bg-slate-800 border border-purple-500/30">
      <h3 className="text-xl font-bold text-white mb-4">Wallet Session</h3>
      
      {/* Connection Status */}
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
          <span className="text-gray-400 text-sm">Status</span>
          <span className={`font-medium ${session.isConnected ? 'text-green-400' : 'text-gray-400'}`}>
            {session.isConnected ? '🟢 Connected' : '⚪ Disconnected'}
          </span>
        </div>

        {session.isConnected && (
          <>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-gray-400 text-sm">Address</span>
              <span className="font-mono text-white text-sm">{session.shortAddress}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-gray-400 text-sm">Network</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white text-sm">{session.chainName}</span>
                {session.isBaseNetwork ? (
                  <span className="text-green-400 text-xs">✓ Base</span>
                ) : (
                  <span className="text-amber-400 text-xs">⚠ Wrong Network</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-gray-400 text-sm">Session</span>
              <span className="text-white text-sm">
                {session.wasAutoConnected ? '🔄 Auto-restored' : '✋ Manual'}
              </span>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-purple-500/20">
          {session.isConnected ? (
            <div className="flex gap-2">
              {!session.isBaseNetwork && (
                <button
                  onClick={actions.switchToBase}
                  disabled={session.isConnecting}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Switch to Base
                </button>
              )}
              <button
                onClick={actions.disconnect}
                className="flex-1 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={actions.connect}
              disabled={session.isConnecting || !session.hasWallet}
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {session.hasWallet ? 'Connect Wallet' : 'No Wallet Detected'}
            </button>
          )}
        </div>

        {/* Error Display */}
        {session.hasError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-300 text-xs">{session.error}</p>
            <button
              onClick={actions.clearError}
              className="mt-2 text-red-400 text-xs hover:text-red-300 transition-colors"
            >
              Clear Error
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
