/**
 * Connect Wallet Button
 */

import React from 'react';
import { useMetaMaskAuth } from '../hooks/useAuth';

const ConnectWalletButton: React.FC = () => {
  const { address, userId, connect, loading, error } = useMetaMaskAuth();

  if (address) {
    return (
      <button className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800" disabled>
        Connected: {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={connect}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ConnectWalletButton;
