'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NotificationPreferences, Notification, NotificationType } from '@/lib/hooks/useNotifications';

interface NotificationsContextType {
    notifications: Notification[];
    preferences: NotificationPreferences;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (notificationId: string) => void;
    clearAll: () => void;
    updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void;
    unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const notifications = useNotifications();

    return (
        <NotificationsContext.Provider value={notifications}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotificationsContext() {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotificationsContext must be used within NotificationsProvider');
    }
    return context;
}
