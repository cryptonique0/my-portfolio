/**
 * useNotificationCenter Hook
 * Manage notifications and preferences in React components
 */

import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  user_id: string;
  type: 'sale' | 'offer' | 'follow' | 'auction_bid' | 'message' | 'admin' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_on_sale: boolean;
  email_on_offer: boolean;
  email_on_follow: boolean;
  email_on_auction_bid: boolean;
  email_on_message: boolean;
  push_on_sale: boolean;
  push_on_offer: boolean;
  push_on_follow: boolean;
  push_on_auction_bid: boolean;
  push_on_message: boolean;
  in_app_on_sale: boolean;
  in_app_on_offer: boolean;
  in_app_on_follow: boolean;
  in_app_on_auction_bid: boolean;
  in_app_on_message: boolean;
  notify_frequency: 'instant' | 'daily' | 'weekly' | 'never';
  unsubscribe_all: boolean;
  updated_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useNotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('authToken');

  const fetchNotifications = useCallback(async (limit = 50, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUnreadNotifications = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch unread notifications');
      const data = await response.json();
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [token]);

  const getUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to get unread count');
      const data = await response.json();
      setUnreadCount(data.data.unreadCount);
      return data.data.unreadCount;
    } catch (err) {
      console.error('Error getting unread count:', err);
      return 0;
    }
  }, [token]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [token]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete notification');
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [token, notifications]);

  const getNotificationsByType = useCallback(async (type: string, limit = 50, offset = 0) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/history/${type}?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch notification history');
      const data = await response.json();
      return data.data.notifications;
    } catch (err) {
      console.error('Error fetching notification history:', err);
      return [];
    }
  }, [token]);

  // Fetch initial notifications on mount
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByType,
  };
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('authToken');

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch preferences');
      const data = await response.json();
      setPreferences(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Failed to update preferences');
        const data = await response.json();
        setPreferences(data.data);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [token]
  );

  const updateChannel = useCallback(
    async (channel: 'email' | 'push' | 'in_app', type: string, enabled: boolean) => {
      const key = `${channel}_on_${type}`;
      return updatePreferences({ [key]: enabled } as any);
    },
    [updatePreferences]
  );

  const updateFrequency = useCallback(
    async (frequency: 'instant' | 'daily' | 'weekly' | 'never') => {
      return updatePreferences({ notify_frequency: frequency });
    },
    [updatePreferences]
  );

  const unsubscribeAll = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to unsubscribe');
      await fetchPreferences();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [token, fetchPreferences]);

  const resubscribe = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/resubscribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to resubscribe');
      await fetchPreferences();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [token, fetchPreferences]);

  useEffect(() => {
    if (token) {
      fetchPreferences();
    }
  }, [token, fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    updateChannel,
    updateFrequency,
    unsubscribeAll,
    resubscribe,
  };
};
