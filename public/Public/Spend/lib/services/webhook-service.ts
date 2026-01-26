// Webhook management service
import {
  WebhookEndpoint,
  WebhookEvent,
  AlertRule,
  Alert,
  EventType,
  AlertSeverity,
  eventSeverityMap,
  eventDescriptions,
  generateWebhookSecret,
  createSignature,
} from './webhook-types';

// In-memory storage (replace with database in production)
let webhookEndpoints: Map<string, WebhookEndpoint> = new Map();
let alerts: Map<string, Alert[]> = new Map();
let alertRules: Map<string, AlertRule[]> = new Map();

export class WebhookService {
  // Webhook endpoint management
  static registerWebhook(
    vaultAddress: string,
    url: string,
    events: EventType[],
  ): WebhookEndpoint {
    const endpoint: WebhookEndpoint = {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      events,
      active: true,
      secret: generateWebhookSecret(),
      retryPolicy: {
        maxRetries: 3,
        retryDelayMs: 5000,
      },
      createdAt: new Date(),
      failureCount: 0,
    };

    const key = vaultAddress;
    const vaultWebhooks = webhookEndpoints.get(key) || [];
    vaultWebhooks.push(endpoint);
    webhookEndpoints.set(key, vaultWebhooks);

    return endpoint;
  }

  static updateWebhook(
    vaultAddress: string,
    webhookId: string,
    updates: Partial<WebhookEndpoint>,
  ): WebhookEndpoint | null {
    const key = vaultAddress;
    const webhooks = webhookEndpoints.get(key);
    if (!webhooks) return null;

    const index = webhooks.findIndex((w) => w.id === webhookId);
    if (index === -1) return null;

    webhooks[index] = { ...webhooks[index], ...updates, id: webhooks[index].id };
    return webhooks[index];
  }

  static deleteWebhook(vaultAddress: string, webhookId: string): boolean {
    const key = vaultAddress;
    const webhooks = webhookEndpoints.get(key);
    if (!webhooks) return false;

    const index = webhooks.findIndex((w) => w.id === webhookId);
    if (index === -1) return false;

    webhooks.splice(index, 1);
    return true;
  }

  static getWebhooks(vaultAddress: string): WebhookEndpoint[] {
    return webhookEndpoints.get(vaultAddress) || [];
  }

  // Event triggering
  static async triggerEvent(event: WebhookEvent): Promise<void> {
    const vaultAddress = event.vaultAddress;
    const webhooks = this.getWebhooks(vaultAddress);

    // Create alert
    this.createAlert(event);

    // Trigger webhooks
    for (const webhook of webhooks) {
      if (!webhook.active || !webhook.events.includes(event.type)) {
        continue;
      }

      this.sendWebhook(webhook, event);
    }
  }

  private static async sendWebhook(webhook: WebhookEndpoint, event: WebhookEvent): Promise<void> {
    const payload = JSON.stringify(event);
    const signature = createSignature(payload, webhook.secret);

    let retries = 0;
    while (retries < webhook.retryPolicy.maxRetries) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-ID': webhook.id,
            ...webhook.headers,
          },
          body: payload,
        });

        if (response.ok) {
          webhook.lastTriggeredAt = new Date();
          webhook.failureCount = 0;
          return;
        }

        retries++;
        if (retries < webhook.retryPolicy.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, webhook.retryPolicy.retryDelayMs));
        }
      } catch (error) {
        retries++;
        if (retries < webhook.retryPolicy.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, webhook.retryPolicy.retryDelayMs));
        }
      }
    }

    webhook.failureCount++;
    if (webhook.failureCount >= 5) {
      webhook.active = false; // Disable webhook after 5 consecutive failures
    }
  }

  // Alert management
  private static createAlert(event: WebhookEvent): void {
    const severity = eventSeverityMap[event.type] || 'info';
    const description = eventDescriptions[event.type] || 'Event occurred';

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vaultAddress: event.vaultAddress,
      type: event.type,
      severity,
      title: event.type.split('.')[1]?.replace(/_/g, ' ') || 'Event',
      message: description,
      timestamp: event.timestamp,
      read: false,
      actionRequired:
        severity === 'critical' || severity === 'high' || event.type.includes('pending'),
    };

    const vaultAlerts = alerts.get(event.vaultAddress) || [];
    vaultAlerts.unshift(alert);
    alerts.set(event.vaultAddress, vaultAlerts);
  }

  static getAlerts(vaultAddress: string): Alert[] {
    return alerts.get(vaultAddress) || [];
  }

  static markAlertAsRead(vaultAddress: string, alertId: string): boolean {
    const vaultAlerts = alerts.get(vaultAddress);
    if (!vaultAlerts) return false;

    const alert = vaultAlerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.read = true;
    return true;
  }

  static markAllAlertsAsRead(vaultAddress: string): void {
    const vaultAlerts = alerts.get(vaultAddress);
    if (vaultAlerts) {
      vaultAlerts.forEach((a) => (a.read = true));
    }
  }

  static deleteAlert(vaultAddress: string, alertId: string): boolean {
    const vaultAlerts = alerts.get(vaultAddress);
    if (!vaultAlerts) return false;

    const index = vaultAlerts.findIndex((a) => a.id === alertId);
    if (index === -1) return false;

    vaultAlerts.splice(index, 1);
    return true;
  }

  static getAlertStats(vaultAddress: string) {
    const vaultAlerts = this.getAlerts(vaultAddress);
    return {
      total: vaultAlerts.length,
      unread: vaultAlerts.filter((a) => !a.read).length,
      critical: vaultAlerts.filter((a) => a.severity === 'critical').length,
      actionRequired: vaultAlerts.filter((a) => a.actionRequired).length,
      bySeverity: {
        critical: vaultAlerts.filter((a) => a.severity === 'critical').length,
        high: vaultAlerts.filter((a) => a.severity === 'high').length,
        medium: vaultAlerts.filter((a) => a.severity === 'medium').length,
        low: vaultAlerts.filter((a) => a.severity === 'low').length,
        info: vaultAlerts.filter((a) => a.severity === 'info').length,
      },
    };
  }

  // Alert rules
  static createAlertRule(vaultAddress: string, rule: AlertRule): AlertRule {
    const rules = alertRules.get(vaultAddress) || [];
    rules.push(rule);
    alertRules.set(vaultAddress, rules);
    return rule;
  }

  static getAlertRules(vaultAddress: string): AlertRule[] {
    return alertRules.get(vaultAddress) || [];
  }

  static updateAlertRule(vaultAddress: string, ruleId: string, updates: Partial<AlertRule>): boolean {
    const rules = alertRules.get(vaultAddress);
    if (!rules) return false;

    const index = rules.findIndex((r) => r.id === ruleId);
    if (index === -1) return false;

    rules[index] = { ...rules[index], ...updates, id: rules[index].id };
    return true;
  }

  static deleteAlertRule(vaultAddress: string, ruleId: string): boolean {
    const rules = alertRules.get(vaultAddress);
    if (!rules) return false;

    const index = rules.findIndex((r) => r.id === ruleId);
    if (index === -1) return false;

    rules.splice(index, 1);
    return true;
  }

  // Test webhook
  static async testWebhook(webhook: WebhookEndpoint): Promise<boolean> {
    const testEvent: WebhookEvent = {
      id: `test_${Date.now()}`,
      type: 'vault.created',
      timestamp: new Date(),
      vaultAddress: '0x' + '0'.repeat(40),
      data: { test: true },
      severity: 'info',
    };

    try {
      const payload = JSON.stringify(testEvent);
      const signature = createSignature(payload, webhook.secret);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': webhook.id,
          'X-Webhook-Test': 'true',
        },
        body: payload,
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export service instance
export const webhookService = WebhookService;
