'use client';

import { useConnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';

/**
 * Wallet Connect Button Component
 * 
 * Features:
 * - Wallet connection with connector selection
 * - Network status display with Base detection
 * - Automatic network switching prompt
 * - Error handling with user-friendly messages
 * - Connection status persistence
 */
export function WalletConnectButton() {
  const { state, actions } = useWalletContext();
  const { connectors } = useConnect();
  const [showConnectors, setShowConnectors] = useState(false);
  const [showError, setShowError] = useState(false);

  // Show error notification
  useEffect(() => {
    if (state.error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        actions.clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.error, actions]);

  // Connected State
  if (state.isConnected && state.address) {
    const isWrongNetwork = !state.isCorrectNetwork;

    return (
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          {/* Chain Badge */}
          <div 
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isWrongNetwork 
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' 
                : 'bg-green-500/20 border-green-500/30 text-green-300'
            }`}
          >
            {state.chain?.name || 'Unknown'}
            {isWrongNetwork && ' ⚠️'}
          </div>

          {/* Switch Network Button (if wrong network) */}
          {isWrongNetwork && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={actions.switchToBase}
              disabled={state.isConnecting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isConnecting ? 'Switching...' : 'Switch to Base'}
            </motion.button>
          )}

          {/* Address Display */}
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-purple-500/30 backdrop-blur">
            <span className="text-white font-mono text-sm">
              {state.address.slice(0, 6)}...{state.address.slice(-4)}
            </span>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={actions.disconnect}
            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/10 transition-all"
          >
            Disconnect
          </button>
        </motion.div>

        {/* Error Notification */}
        <AnimatePresence>
          {showError && state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 w-96 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur z-50"
            >
              <div className="flex items-start gap-3">
                <div className="text-red-400 text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-red-300 text-sm font-medium mb-1">Network Error</p>
                  <p className="text-red-200/80 text-xs">{state.error}</p>
                </div>
                <button
                  onClick={() => {
                    setShowError(false);
                    actions.clearError();
                  }}
                  className="text-red-300 hover:text-red-100 transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Disconnected State
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={state.isConnecting}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.isConnecting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
            Connecting...
          </span>
        ) : (
          'Connect Wallet'
        )}
      </motion.button>

      {/* Connector Dropdown */}
      <AnimatePresence>
        {showConnectors && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 w-64 p-4 rounded-xl bg-slate-800 border border-purple-500/30 shadow-xl backdrop-blur z-50"
            >
              <p className="text-gray-400 text-sm mb-3">Select a wallet:</p>
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => {
                      actions.connect(connector.id);
                      setShowConnectors(false);
                    }}
                    disabled={state.isConnecting}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/50 text-white text-left transition-all disabled:opacity-50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
                        {connector.name.charAt(0)}
                      </div>
                      <span className="font-medium">{connector.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Info Message */}
              <div className="mt-4 pt-3 border-t border-purple-500/20">
                <p className="text-xs text-gray-400">
                  💡 You'll be prompted to switch to Base network after connecting
                </p>
              </div>
            </motion.div>

            {/* Click Outside Handler */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowConnectors(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Error Notification (disconnected state) */}
      <AnimatePresence>
        {showError && state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 w-80 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur z-50"
          >
            <div className="flex items-start gap-3">
              <div className="text-red-400 text-xl">⚠️</div>
              <div className="flex-1">
                <p className="text-red-300 text-sm font-medium mb-1">Connection Error</p>
                <p className="text-red-200/80 text-xs">{state.error}</p>
              </div>
              <button
                onClick={() => {
                  setShowError(false);
                  actions.clearError();
                }}
                className="text-red-300 hover:text-red-100 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
