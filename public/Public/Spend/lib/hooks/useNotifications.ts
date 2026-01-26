import { useState, useCallback } from 'react';

export type NotificationType = 'withdrawal' | 'approval' | 'rejection' | 'guardian_action' | 'emergency' | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    actionUrl?: string;
    vaultAddress?: string;
    avatar?: string;
}

export interface NotificationPreferences {
    withdrawalRequests: boolean;
    approvals: boolean;
    rejections: boolean;
    guardianActions: boolean;
    emergencyAlerts: boolean;
    systemUpdates: boolean;
    emailNotifications: boolean;
    inAppNotifications: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    withdrawalRequests: true,
    approvals: true,
    rejections: true,
    guardianActions: true,
    emergencyAlerts: true,
    systemUpdates: true,
    emailNotifications: true,
    inAppNotifications: true,
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const id = `notif-${Date.now()}-${Math.random()}`;
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: Date.now(),
            read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
        return id;
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, read: true }))
        );
    }, []);

    const deleteNotification = useCallback((notificationId: string) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
        setPreferences((prev) => ({ ...prev, ...newPreferences }));
    }, []);

    const unreadCount = notifications.filter((notif) => !notif.read).length;

    return {
        notifications,
        preferences,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        updatePreferences,
        unreadCount,
    };
}
