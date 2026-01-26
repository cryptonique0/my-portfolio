import React from 'react';

interface WalletDisconnectBannerProps {
  error: string | null;
  onDismiss: () => void;
  onReconnect: () => void;
  isLoading?: boolean;
}

/**
 * Banner to display wallet disconnect errors and offer reconnect
 */
export const WalletDisconnectBanner: React.FC<WalletDisconnectBannerProps> = ({
  error,
  onDismiss,
  onReconnect,
  isLoading = false
}) => {
  if (!error) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
            Wallet Disconnected
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
            {error}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onReconnect}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isLoading ? 'Reconnecting...' : 'Reconnect Wallet'}
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-transparent border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg text-sm font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-yellow-600 dark:text-yellow-400 hover:opacity-70 flex-shrink-0 font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

interface WalletErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
  type?: 'error' | 'warning';
}

/**
 * Banner for general wallet errors
 */
export const WalletErrorBanner: React.FC<WalletErrorBannerProps> = ({
  error,
  onDismiss,
  type = 'error'
}) => {
  if (!error) return null;

  const colors = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      title: 'text-red-900 dark:text-red-200',
      text: 'text-red-800 dark:text-red-300',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      title: 'text-yellow-900 dark:text-yellow-200',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: '⚠️'
    }
  };

  const config = colors[type];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.title}`}>
            {type === 'error' ? 'Error' : 'Warning'}
          </h3>
          <p className={`text-sm ${config.text} mt-1`}>
            {error}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className={`${config.title} hover:opacity-70 flex-shrink-0 font-bold`}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

interface WalletSessionExpiredProps {
  onReconnect: () => void;
}

/**
 * Banner for expired wallet session
 */
export const WalletSessionExpired: React.FC<WalletSessionExpiredProps> = ({
  onReconnect
}) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">🔐</div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200">
            Session Expired
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
            Your wallet session has expired. Please reconnect to continue.
          </p>
          <button
            onClick={onReconnect}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};
