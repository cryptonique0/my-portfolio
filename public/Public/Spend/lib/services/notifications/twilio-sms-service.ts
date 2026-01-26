/**
 * Twilio SMS Notification Service
 * Sends SMS notifications via Twilio API
 */

import {
  BaseNotificationService,
  NotificationPayload,
  NotificationResult,
} from './base-notification-service';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumbers?: string[];
  maxLength?: number;
}

export class TwilioSMSService extends BaseNotificationService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private toNumbers: string[];
  private maxLength: number;
  private apiUrl = 'https://api.twilio.com/2010-04-01/Accounts';

  constructor(config: TwilioConfig) {
    super('Twilio SMS', {
      maxRetries: 3,
      retryDelay: 2000,
      timeout: 15000,
    });

    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
    this.toNumbers = config.toNumbers || [];
    this.maxLength = config.maxLength || 160;

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error(
        'Twilio accountSid, authToken, and fromNumber are required'
      );
    }

    if (this.toNumbers.length === 0) {
      this.log(
        'warn',
        'No phone numbers configured for SMS notifications'
      );
    }
  }

  protected async sendInternal(
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    if (this.toNumbers.length === 0) {
      throw new Error('No phone numbers configured');
    }

    const message = this.formatSMSMessage(payload);

    // Send to all configured numbers
    const results = await Promise.allSettled(
      this.toNumbers.map((toNumber) =>
        this.sendSMS(message, toNumber)
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (successful === 0) {
      throw new Error(`Failed to send SMS to all ${this.toNumbers.length} recipients`);
    }

    if (failed > 0) {
      this.log(
        'warn',
        `SMS sent to ${successful}/${this.toNumbers.length} recipients`
      );
    }

    return {
      success: true,
      messageId: `twilio-${Date.now()}`,
    };
  }

  private async sendSMS(message: string, toNumber: string): Promise<string> {
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
      'base64'
    );
    const url = `${this.apiUrl}/${this.accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('From', this.fromNumber);
    formData.append('To', toNumber);
    formData.append('Body', message);

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Twilio API returned ${response.status}: ${errorBody}`
      );
    }

    const data = (await response.json()) as Record<string, any>;
    return data.sid || '';
  }

  private formatSMSMessage(payload: NotificationPayload): string {
    const severityEmoji = this.getSeverityEmoji(payload.severity);
    const severity = this.formatSeverity(payload.severity);

    // Build message - keep under maxLength
    let message = `${severityEmoji} ${severity}: ${payload.title}`;

    // Add message if space allows
    if (message.length < this.maxLength - 20) {
      const remaining = this.maxLength - message.length - 10;
      if (payload.message.length <= remaining) {
        message += `\n${payload.message}`;
      } else {
        message += `\n${payload.message.substring(0, remaining - 3)}...`;
      }
    }

    // Ensure we don't exceed maxLength
    if (message.length > this.maxLength) {
      message = message.substring(0, this.maxLength - 3) + '...';
    }

    return message;
  }

  private getSeverityEmoji(severity: string): string {
    const emojis: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
      info: 'ℹ️',
    };
    return emojis[severity] || 'ℹ️';
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
   * Add phone number
   */
  addPhoneNumber(phoneNumber: string): boolean {
    if (!this.validatePhoneNumber(phoneNumber)) {
      this.log('warn', `Invalid phone number: ${phoneNumber}`);
      return false;
    }

    if (!this.toNumbers.includes(phoneNumber)) {
      this.toNumbers.push(phoneNumber);
      this.log('info', `Phone number added: ${phoneNumber}`);
      return true;
    }

    return false;
  }

  /**
   * Remove phone number
   */
  removePhoneNumber(phoneNumber: string): boolean {
    const index = this.toNumbers.indexOf(phoneNumber);
    if (index !== -1) {
      this.toNumbers.splice(index, 1);
      this.log('info', `Phone number removed: ${phoneNumber}`);
      return true;
    }
    return false;
  }

  /**
   * Get phone numbers
   */
  getPhoneNumbers(): string[] {
    return [...this.toNumbers];
  }

  /**
   * Validate phone number format
   * Accepts +1234567890 or 1234567890
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove common formatting characters
    const cleaned = phoneNumber.replace(/[\s\-().]/g, '');

    // Check if it's a valid E.164 format or can be converted
    if (cleaned.startsWith('+')) {
      return /^\+\d{1,15}$/.test(cleaned);
    } else if (cleaned.length >= 10 && cleaned.length <= 15) {
      return /^\d{10,15}$/.test(cleaned);
    }

    return false;
  }

  /**
   * Format phone number to E.164 standard
   */
  formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/[\s\-().]/g, '');

    // Add + if not present
    if (!cleaned.startsWith('+')) {
      // Assume US if no country code
      if (cleaned.length === 10) {
        cleaned = '+1' + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }

    return cleaned;
  }
}
