/**
 * Base Notification Service
 * Abstract base class for all notification services
 * Provides common functionality: retries, logging, error handling
 */

export interface NotificationPayload {
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  vaultAddress: string;
  icon?: string;
  link?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retries?: number;
  timestamp: number;
}

export interface NotificationConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export abstract class BaseNotificationService {
  protected name: string;
  protected config: NotificationConfig;
  protected logs: Array<{
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    message: string;
  }> = [];

  constructor(name: string, config: Partial<NotificationConfig> = {}) {
    this.name = name;
    this.config = {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
      ...config,
    };
  }

  /**
   * Main method to send a notification
   * Handles retries and error handling
   */
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.config.enabled) {
      return {
        success: false,
        error: `${this.name} is disabled`,
        timestamp: Date.now(),
      };
    }

    let lastError: Error | null = null;
    let retries = 0;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.sendInternal(payload);
        this.log('info', `Successfully sent notification: ${result.messageId}`);
        return {
          ...result,
          retries: attempt,
          timestamp: Date.now(),
        };
      } catch (error) {
        lastError = error as Error;
        retries = attempt;

        this.log(
          'warn',
          `Attempt ${attempt + 1} failed: ${lastError.message}`
        );

        // Wait before retrying (exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.log('error', `Failed to send after ${retries + 1} attempts`);
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      retries,
      timestamp: Date.now(),
    };
  }

  /**
   * Abstract method - implement in subclasses
   */
  protected abstract sendInternal(
    payload: NotificationPayload
  ): Promise<NotificationResult>;

  /**
   * Test the service connection
   */
  async test(): Promise<NotificationResult> {
    return this.send({
      title: `${this.name} Test`,
      message: `This is a test notification from ${this.name}`,
      severity: 'info',
      vaultAddress: '0x0000000000000000000000000000000000000000',
      timestamp: Date.now(),
    });
  }

  /**
   * Enable/disable the service
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.log('info', `Service ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('info', 'Configuration updated');
  }

  /**
   * Get service logs
   */
  getLogs(limit: number = 100): typeof this.logs {
    return this.logs.slice(-limit);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get service status
   */
  getStatus(): {
    name: string;
    enabled: boolean;
    config: NotificationConfig;
    logCount: number;
    lastLog?: (typeof this.logs)[0];
  } {
    return {
      name: this.name,
      enabled: this.config.enabled,
      config: this.config,
      logCount: this.logs.length,
      lastLog: this.logs[this.logs.length - 1],
    };
  }

  /**
   * Internal logging
   */
  protected log(
    level: 'info' | 'warn' | 'error',
    message: string
  ): void {
    const entry = {
      timestamp: Date.now(),
      level,
      message: `[${this.name}] ${message}`,
    };
    this.logs.push(entry);

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Also log to console in development
    if (typeof window === 'undefined') {
      console[level === 'info' ? 'log' : level](entry.message);
    }
  }

  /**
   * Format severity for display
   */
  protected formatSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      critical: '🔴 CRITICAL',
      high: '🟠 HIGH',
      medium: '🟡 MEDIUM',
      low: '🔵 LOW',
      info: '⚪ INFO',
    };
    return severityMap[severity] || severity.toUpperCase();
  }

  /**
   * Format timestamp
   */
  protected formatTimestamp(timestamp?: number): string {
    const date = new Date(timestamp || Date.now());
    return date.toISOString();
  }

  /**
   * Safe JSON parse
   */
  protected safeJsonParse(json: string, fallback: any = null): any {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  }

  /**
   * Safe JSON stringify
   */
  protected safeJsonStringify(obj: any, fallback: string = '{}'): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return fallback;
    }
  }
}
