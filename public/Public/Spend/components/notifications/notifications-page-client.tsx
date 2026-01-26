'use client';

import { useNotificationsContext } from '@/components/notifications/NotificationsContext';
import { Trash2, Archive } from 'lucide-react';

export function NotificationsClient() {
    const { notifications, deleteNotification, markAsRead } = useNotificationsContext();

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

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'withdrawal':
                return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
            case 'approval':
                return 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
            case 'rejection':
                return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
            case 'emergency':
                return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
            case 'guardian_action':
                return 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20';
            default:
                return 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-surface-border';
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (notifications.length === 0) {
        return (
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-2xl p-12 text-center">
                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No notifications yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    You're all caught up! Check back later for updates on vault activities, approvals, and guardian actions.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`border rounded-2xl p-6 transition-all hover:shadow-md ${
                        getNotificationColor(notif.type)
                    } ${!notif.read ? 'ring-2 ring-primary/50' : ''}`}
                >
                    <div className="flex gap-4">
                        {/* Icon */}
                        <div className="text-4xl flex-shrink-0">
                            {getNotificationIcon(notif.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {notif.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                        {notif.message}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary font-semibold rounded-full text-xs flex-shrink-0">
                                        <span className="size-2 bg-primary rounded-full" />
                                        New
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatTime(notif.timestamp)}
                                </p>

                                {notif.vaultAddress && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                        {notif.vaultAddress.slice(0, 6)}...{notif.vaultAddress.slice(-4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                            {!notif.read && (
                                <button
                                    onClick={() => markAsRead(notif.id)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    title="Mark as read"
                                >
                                    <Archive size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => deleteNotification(notif.id)}
                                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                title="Delete notification"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Action URL if available */}
                    {notif.actionUrl && (
                        <div className="mt-4 pt-4 border-t border-current/10">
                            <a
                                href={notif.actionUrl}
                                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm"
                            >
                                View Details →
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
