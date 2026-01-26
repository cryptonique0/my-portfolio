/**
 * NotificationBell Component
 * Display notification icon with unread count badge
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNotificationCenter } from '../hooks/useNotificationCenter';

export const NotificationBell: React.FC = () => {
  const { unreadCount, getUnreadCount, markAllAsRead, notifications } = useNotificationCenter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll for unread count updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [getUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'text-green-600 dark:text-green-400';
      case 'offer':
        return 'text-blue-600 dark:text-blue-400';
      case 'follow':
        return 'text-purple-600 dark:text-purple-400';
      case 'auction_bid':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'message':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'admin':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-3xl mb-2">🎉</div>
                <p>All caught up!</p>
                <p className="text-xs mt-1">You have no notifications</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`text-xl flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <a
                href="/notifications"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
