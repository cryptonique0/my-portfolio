/**
 * Slack Notification Service
 * Sends notifications to Slack channels via webhooks
 */

import {
  BaseNotificationService,
  NotificationPayload,
  NotificationResult,
} from './base-notification-service';

export interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
  mentionOnCritical?: boolean;
}

export class SlackNotificationService extends BaseNotificationService {
  private webhookUrl: string;
  private channel?: string;
  private username: string;
  private iconEmoji: string;
  private mentionOnCritical: boolean;

  constructor(config: SlackConfig) {
    super('Slack', {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
    });

    this.webhookUrl = config.webhookUrl;
    this.channel = config.channel;
    this.username = config.username || 'Vault Guard';
    this.iconEmoji = config.iconEmoji || ':shield:';
    this.mentionOnCritical = config.mentionOnCritical ?? true;

    if (!this.webhookUrl) {
      throw new Error('Slack webhook URL is required');
    }
  }

  protected async sendInternal(
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const slackMessage = this.formatSlackMessage(payload);

    const response = await this.fetchWithTimeout(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook returned ${response.status}`);
    }

    const text = await response.text();
    if (text !== 'ok') {
      throw new Error(`Slack returned: ${text}`);
    }

    return {
      success: true,
      messageId: `slack-${Date.now()}`,
    };
  }

  private formatSlackMessage(payload: NotificationPayload): Record<string, any> {
    const severityColor = this.getSeverityColor(payload.severity);
    const severityEmoji = this.getSeverityEmoji(payload.severity);

    let text = `${severityEmoji} ${this.formatSeverity(payload.severity)}`;

    // Add mentions for critical alerts
    if (payload.severity === 'critical' && this.mentionOnCritical) {
      text = `<!channel> ${text}`;
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: payload.title,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${this.formatSeverity(payload.severity)}`,
          },
          {
            type: 'mrkdwn',
            text: `*Vault:*\n${payload.vaultAddress.substring(0, 10)}...${payload.vaultAddress.substring(34)}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: payload.message,
        },
      },
    ];

    // Add action buttons if link is provided
    if (payload.link) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Details',
            },
            url: payload.link,
            style: severityColor === '#FF0000' ? 'danger' : 'primary',
          },
        ],
      });
    }

    // Add metadata
    if (payload.metadata && Object.keys(payload.metadata).length > 0) {
      const metadataText = Object.entries(payload.metadata)
        .map(([key, value]) => `• *${key}:* ${value}`)
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Details:*\n${metadataText}`,
        },
      });
    }

    // Add footer with timestamp
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⏰ ${this.formatTimestamp(payload.timestamp)}`,
        },
      ],
    });

    return {
      channel: this.channel,
      username: this.username,
      icon_emoji: this.iconEmoji,
      text,
      blocks,
    };
  }

  private getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      critical: '#FF0000',
      high: '#FF6600',
      medium: '#FFCC00',
      low: '#0099FF',
      info: '#CCCCCC',
    };
    return colors[severity] || '#CCCCCC';
  }

  private getSeverityEmoji(severity: string): string {
    const emojis: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
      info: '⚪',
    };
    return emojis[severity] || '⚪';
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = this.config.timeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Update webhook URL
   */
  updateWebhookUrl(webhookUrl: string): void {
    this.webhookUrl = webhookUrl;
    this.log('info', 'Webhook URL updated');
  }

  /**
   * Validate webhook URL format
   */
  validateWebhookUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.protocol === 'https:' &&
        urlObj.hostname.includes('hooks.slack.com')
      );
    } catch {
      return false;
    }
  }
}
