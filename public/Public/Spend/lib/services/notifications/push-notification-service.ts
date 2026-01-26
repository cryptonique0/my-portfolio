/**
 * Push Notification Service
 * Handles browser push notifications and in-app notifications
 */

import {
  BaseNotificationService,
  NotificationPayload,
  NotificationResult,
} from './base-notification-service';

export interface PushNotificationConfig {
  appName?: string;
  appIcon?: string;
  badge?: string;
  tag?: string;
}

export interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export class PushNotificationService extends BaseNotificationService {
  private appName: string;
  private appIcon: string;
  private badge: string;
  private tag: string;
  private registrations: Map<string, PushSubscription> = new Map();
  private inAppCallbacks: Set<(payload: NotificationPayload) => void> = new Set();

  constructor(config: PushNotificationConfig = {}) {
    super('Push Notifications', {
      maxRetries: 2,
      retryDelay: 500,
      timeout: 5000,
    });

    this.appName = config.appName || 'Vault Guard';
    this.appIcon =
      config.appIcon ||
      'https://vault.example.com/icon-192x192.png';
    this.badge =
      config.badge ||
      'https://vault.example.com/badge-72x72.png';
    this.tag = config.tag || 'vault-notification';
  }

  protected async sendInternal(
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const results = {
      browser: false,
      inApp: false,
      error: '',
    };

    // Try browser push notification
    try {
      await this.sendBrowserPush(payload);
      results.browser = true;
    } catch (error) {
      results.error = (error as Error).message;
      this.log('warn', `Browser push failed: ${results.error}`);
    }

    // Always send in-app notification
    try {
      this.sendInAppNotification(payload);
      results.inApp = true;
    } catch (error) {
      this.log('error', `In-app notification failed: ${(error as Error).message}`);
    }

    if (!results.browser && !results.inApp) {
      throw new Error('Failed to send push notifications');
    }

    return {
      success: results.browser || results.inApp,
      messageId: `push-${Date.now()}`,
    };
  }

  private async sendBrowserPush(payload: NotificationPayload): Promise<void> {
    // Check if notifications are supported
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      throw new Error('Browser push notifications not supported');
    }

    // Check permission
    if (Notification.permission === 'denied') {
      throw new Error('Push notifications permission denied');
    }

    // Request permission if needed
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Push notifications permission not granted');
      }
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Send push notification
    if (registration.showNotification) {
      const notification: NotificationOptions = {
        title: payload.title,
        body: payload.message,
        icon: this.appIcon,
        badge: this.badge,
        tag: this.tag,
        requireInteraction: payload.severity === 'critical',
        vibrate: this.getVibrationPattern(payload.severity),
        actions: [],
        data: {
          vaultAddress: payload.vaultAddress,
          severity: payload.severity,
          link: payload.link,
          timestamp: payload.timestamp || Date.now(),
          metadata: payload.metadata,
        },
      };

      // Add action for critical alerts
      if (payload.severity === 'critical' && payload.link) {
        notification.actions = [
          {
            action: 'view',
            title: 'View Details',
            icon: 'https://vault.example.com/icon-info.png',
          },
          {
            action: 'close',
            title: 'Dismiss',
            icon: 'https://vault.example.com/icon-close.png',
          },
        ];
      }

      await registration.showNotification(payload.title, notification);
    }
  }

  private sendInAppNotification(payload: NotificationPayload): void {
    // Send to all registered callbacks
    this.inAppCallbacks.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        this.log('error', `In-app callback error: ${(error as Error).message}`);
      }
    });
  }

  private getVibrationPattern(severity: string): number[] {
    const patterns: Record<string, number[]> = {
      critical: [200, 100, 200, 100, 200], // Urgent pattern
      high: [100, 100, 100],
      medium: [50, 50, 50],
      low: [50],
      info: [],
    };
    return patterns[severity] || [];
  }

  /**
   * Request push notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    throw new Error('Notifications not supported');
  }

  /**
   * Check if push notifications are available
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'Notification' in window
    );
  }

  /**
   * Get current notification permission
   */
  getPermission(): NotificationPermission | null {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return null;
  }

  /**
   * Register in-app notification callback
   */
  registerInAppCallback(callback: (payload: NotificationPayload) => void): () => void {
    this.inAppCallbacks.add(callback);
    this.log('info', 'In-app callback registered');

    // Return unregister function
    return () => {
      this.inAppCallbacks.delete(callback);
      this.log('info', 'In-app callback unregistered');
    };
  }

  /**
   * Get number of registered callbacks
   */
  getCallbackCount(): number {
    return this.inAppCallbacks.size;
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    this.inAppCallbacks.clear();
    this.log('info', 'All in-app callbacks cleared');
  }

  /**
   * Register push subscription
   */
  registerSubscription(id: string, subscription: PushSubscription): void {
    this.registrations.set(id, subscription);
    this.log('info', `Push subscription registered: ${id}`);
  }

  /**
   * Unregister push subscription
   */
  unregisterSubscription(id: string): boolean {
    const removed = this.registrations.delete(id);
    if (removed) {
      this.log('info', `Push subscription removed: ${id}`);
    }
    return removed;
  }

  /**
   * Get all registrations
   */
  getRegistrations(): Map<string, PushSubscription> {
    return new Map(this.registrations);
  }

  /**
   * Clear all registrations
   */
  clearRegistrations(): void {
    this.registrations.clear();
    this.log('info', 'All push subscriptions cleared');
  }
}
