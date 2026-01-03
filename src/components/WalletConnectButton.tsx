'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Wallet Connect Button Component
 * Handles wallet connection, disconnection, and displays connection status
 */
export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  if (isConnected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        {/* Chain Badge */}
        <div className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-medium">
          {chain?.name || 'Unknown'}
        </div>

        {/* Address Display */}
        <div className="px-4 py-2 rounded-lg bg-white/5 border border-purple-500/30 backdrop-blur">
          <span className="text-white font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 rounded-lg border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/10 transition-all"
        >
          Disconnect
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </motion.button>

      {/* Connector Dropdown */}
      {showConnectors && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 w-64 p-4 rounded-xl bg-slate-800 border border-purple-500/30 shadow-xl backdrop-blur z-50"
        >
          <p className="text-gray-400 text-sm mb-3">Select a wallet:</p>
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector });
                  setShowConnectors(false);
                }}
                disabled={isPending}
                className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/50 text-white text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                    {connector.name.charAt(0)}
                  </div>
                  <span className="font-medium">{connector.name}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Click Outside Handler */}
      {showConnectors && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowConnectors(false)}
        />
      )}
    </div>
  );
}
