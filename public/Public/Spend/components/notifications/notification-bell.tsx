'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useNotificationsContext } from './NotificationsContext';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    } = useNotificationsContext();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'withdrawal':
                return '🔄';
            case 'approval':
                return '✅';
            case 'rejection':
                return '❌';
            case 'guardian_action':
                return '👥';
            case 'emergency':
                return '⚠️';
            case 'system':
                return 'ℹ️';
            default:
                return '🔔';
        }
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                aria-expanded={isOpen}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center size-5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-2xl shadow-lg z-50 max-h-96 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-surface-border">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary hover:text-primary-hover font-medium"
                                    title="Mark all as read"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                aria-label="Close notifications"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Bell size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-surface-border">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                                            !notif.read ? 'bg-blue-50 dark:bg-blue-500/10' : ''
                                        }`}
                                        onClick={() => {
                                            if (!notif.read) markAsRead(notif.id);
                                            if (notif.actionUrl) {
                                                window.location.href = notif.actionUrl;
                                            }
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className="text-2xl flex-shrink-0">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.read && (
                                                        <div className="size-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                                    {formatTime(notif.timestamp)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notif.id);
                                                }}
                                                className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0"
                                                title="Delete notification"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-surface-border flex gap-2 justify-center">
                            <Link
                                href="/notifications"
                                className="text-xs text-primary hover:text-primary-hover font-medium"
                            >
                                View all notifications
                            </Link>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <button
                                onClick={clearAll}
                                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
