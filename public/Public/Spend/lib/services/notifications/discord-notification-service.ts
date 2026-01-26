/**
 * Discord Notification Service
 * Sends notifications to Discord channels via webhooks
 */

import {
  BaseNotificationService,
  NotificationPayload,
  NotificationResult,
} from './base-notification-service';

export interface DiscordConfig {
  webhookUrl: string;
  mentionOnCritical?: boolean;
  roleId?: string;
  username?: string;
}

export class DiscordNotificationService extends BaseNotificationService {
  private webhookUrl: string;
  private mentionOnCritical: boolean;
  private roleId?: string;
  private username: string;

  constructor(config: DiscordConfig) {
    super('Discord', {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
    });

    this.webhookUrl = config.webhookUrl;
    this.mentionOnCritical = config.mentionOnCritical ?? true;
    this.roleId = config.roleId;
    this.username = config.username || 'Vault Guard';

    if (!this.webhookUrl) {
      throw new Error('Discord webhook URL is required');
    }
  }

  protected async sendInternal(
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const discordMessage = this.formatDiscordMessage(payload);

    const response = await this.fetchWithTimeout(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook returned ${response.status}`);
    }

    return {
      success: true,
      messageId: `discord-${Date.now()}`,
    };
  }

  private formatDiscordMessage(
    payload: NotificationPayload
  ): Record<string, any> {
    const color = this.getSeverityColor(payload.severity);
    const severityEmoji = this.getSeverityEmoji(payload.severity);

    let content = '';

    // Add role mention for critical alerts
    if (payload.severity === 'critical' && this.mentionOnCritical) {
      if (this.roleId) {
        content = `<@&${this.roleId}> `;
      } else {
        content = '@here ';
      }
    }

    const embed: Record<string, any> = {
      title: payload.title,
      description: payload.message,
      color: color,
      timestamp: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
      fields: [
        {
          name: 'Severity',
          value: `${severityEmoji} ${this.formatSeverity(payload.severity)}`,
          inline: true,
        },
        {
          name: 'Vault Address',
          value: `\`${payload.vaultAddress}\``,
          inline: true,
        },
      ],
    };

    // Add metadata fields
    if (payload.metadata && Object.keys(payload.metadata).length > 0) {
      Object.entries(payload.metadata).forEach(([key, value]) => {
        embed.fields.push({
          name: key,
          value: String(value),
          inline: true,
        });
      });
    }

    // Add action button if link is provided
    if (payload.link) {
      embed.url = payload.link;
    }

    // Add footer
    embed.footer = {
      text: 'Vault Guard Security',
      icon_url:
        'https://avatars.githubusercontent.com/u/1234567?v=4',
    };

    return {
      content: content || undefined,
      username: this.username,
      embeds: [embed],
    };
  }

  private getSeverityColor(severity: string): number {
    const colors: Record<string, number> = {
      critical: 0xFF0000, // Red
      high: 0xFF6600, // Orange
      medium: 0xFFCC00, // Yellow
      low: 0x0099FF, // Blue
      info: 0xCCCCCC, // Gray
    };
    return colors[severity] || 0xCCCCCC;
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
   * Update role mention
   */
  updateRoleId(roleId: string): void {
    this.roleId = roleId;
    this.log('info', 'Role ID updated');
  }

  /**
   * Validate webhook URL format
   */
  validateWebhookUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.protocol === 'https:' &&
        urlObj.hostname.includes('discord.com')
      );
    } catch {
      return false;
    }
  }
}
