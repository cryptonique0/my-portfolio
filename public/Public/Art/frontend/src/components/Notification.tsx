import React from 'react';
import { useNotificationStore } from '../store';
import { BaseScanLink, shortenTxHash } from './BaseScanLink';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  txHash?: string; // Optional transaction hash for BaseScan link
}

const NotificationItem: React.FC<NotificationProps & { onClose: (id: string) => void }> = ({
  id,
  title,
  message,
  type,
  txHash,
  onClose
}) => {
  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
  };

  const iconStyles = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const textColorStyles = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-blue-800 dark:text-blue-200',
    warning: 'text-yellow-800 dark:text-yellow-200'
  };

  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`${typeStyles[type]} border rounded-lg p-4 mb-3`}>
      <div className="flex items-start">
        <span className={`${textColorStyles[type]} mr-3 text-lg flex-shrink-0`}>
          {iconStyles[type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`${textColorStyles[type]} font-semibold`}>{title}</p>
          <p className={`${textColorStyles[type]} text-sm mt-1`}>{message}</p>
          {txHash && (
            <div className="mt-2">
              <BaseScanLink
                type="tx"
                hash={txHash}
                label={`🔍 View on BaseScan (${shortenTxHash(txHash)})`}
                className="text-xs"
              />
            </div>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className={`${textColorStyles[type]} ml-4 font-bold flex-shrink-0`}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};
