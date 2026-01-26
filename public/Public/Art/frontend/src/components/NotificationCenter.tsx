/**
 * NotificationCenter Page Component
 * Manage and view all notifications
 */

import React, { useState } from 'react';
import { useNotificationCenter } from '../hooks/useNotificationCenter';

type NotificationType = 'all' | 'sale' | 'offer' | 'follow' | 'auction_bid' | 'message';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationCenter();

  const [activeFilter, setActiveFilter] = useState<NotificationType>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredNotifications =
    activeFilter === 'all'
      ? notifications
      : notifications.filter(n => n.type === activeFilter);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return '💰';
      case 'offer':
        return '🤝';
      case 'follow':
        return '👥';
      case 'auction_bid':
        return '⚡';
      case 'message':
        return '💬';
      case 'admin':
        return '⚠️';
      case 'system':
        return '🔔';
      default:
        return '📬';
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'offer':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'follow':
        return 'bg-purple-50 dark:bg-purple-900/20';
      case 'auction_bid':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'message':
        return 'bg-indigo-50 dark:bg-indigo-900/20';
      case 'admin':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filterButtons: { label: string; value: NotificationType; icon: string }[] = [
    { label: 'All', value: 'all', icon: '📬' },
    { label: 'Sales', value: 'sale', icon: '💰' },
    { label: 'Offers', value: 'offer', icon: '🤝' },
    { label: 'Follows', value: 'follow', icon: '👥' },
    { label: 'Bids', value: 'auction_bid', icon: '⚡' },
    { label: 'Messages', value: 'message', icon: '💬' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-3">🔔 Notification Center</h1>
          <p className="text-blue-100">
            Manage your notifications and stay updated with what matters most
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Controls Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  ✓ Mark all as read
                </button>
              )}
              <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setActiveFilter(btn.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === btn.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-1">{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              No notifications
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {activeFilter === 'all'
                ? 'You are all caught up!'
                : `No ${filterButtons.find(b => b.value === activeFilter)?.label.toLowerCase()} notifications`}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-2">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  !notification.read
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`text-2xl flex-shrink-0 ${getNotificationBgColor(notification.type)} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
                  !notification.read
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-3xl ${getNotificationBgColor(notification.type)} w-14 h-14 rounded-lg flex items-center justify-center`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(notification.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Link */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Want to customize your notification preferences?
          </p>
          <a
            href="/settings/notifications"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ⚙️ Notification Settings
          </a>
        </div>
      </div>
    </div>
  );
};
