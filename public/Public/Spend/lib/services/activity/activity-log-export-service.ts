/**
 * Activity Log Export Service
 * Exports activity logs in CSV, JSON, and PDF formats with filtering
 */

import {
  ActivityLog,
  ActivityFilterOptions,
  ActivityExportOptions,
  ActivityStatistics,
  activitySeverityMap,
  activityCategoryMap,
} from './activity-log-types';

export class ActivityLogExportService {
  /**
   * Export activity logs to CSV format
   */
  static exportToCSV(logs: ActivityLog[], options: Partial<ActivityExportOptions> = {}): string {
    const filtered = this.filterLogs(logs, options.filters);

    // Headers
    const headers = [
      'Timestamp',
      'Type',
      'Category',
      'Severity',
      'Action',
      'Description',
      'Vault Address',
      'User',
      'Success',
      'Error Message',
    ];

    // Build CSV rows
    const rows = filtered.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.type,
      log.category,
      log.severity,
      log.action,
      (log.description || '').replace(/"/g, '""'),
      log.vaultAddress || '',
      log.userEmail || log.userId || '',
      log.success ? 'Yes' : 'No',
      (log.errorMessage || '').replace(/"/g, '""'),
    ]);

    // Include metadata if requested
    if (options.includeMetadata) {
      headers.push('Metadata');
      rows.forEach((row, index) => {
        const metadata = filtered[index].metadata
          ? JSON.stringify(filtered[index].metadata)
          : '';
        row.push(metadata);
      });
    }

    // Include changes if requested
    if (options.includeChanges) {
      headers.push('Changes');
      rows.forEach((row, index) => {
        const changes = filtered[index].changes
          ? JSON.stringify(filtered[index].changes)
          : '';
        row.push(changes);
      });
    }

    // Escape and quote fields
    const csvRows = rows.map((row) =>
      row
        .map((field) => {
          const str = String(field);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    );

    // Add statistics footer
    const stats = this.getStatistics(filtered);
    const summary = [
      '',
      'SUMMARY',
      `Total Activities: ${filtered.length}`,
      `By Severity:`,
      `  Critical: ${stats.bySeverity.critical || 0}`,
      `  High: ${stats.bySeverity.high || 0}`,
      `  Medium: ${stats.bySeverity.medium || 0}`,
      `  Low: ${stats.bySeverity.low || 0}`,
      `  Info: ${stats.bySeverity.info || 0}`,
      `Success Rate: ${(stats.successRate * 100).toFixed(2)}%`,
      `Failures: ${stats.failureCount}`,
    ];

    return [headers.join(','), ...csvRows, '', ...summary.join(',')].join('\n');
  }

  /**
   * Export activity logs to JSON format
   */
  static exportToJSON(logs: ActivityLog[], options: Partial<ActivityExportOptions> = {}): string {
    const filtered = this.filterLogs(logs, options.filters);
    const stats = this.getStatistics(filtered);

    const data = {
      exportDate: new Date().toISOString(),
      totalCount: filtered.length,
      statistics: {
        totalActivities: stats.totalActivities,
        byCategory: stats.byCategory,
        bySeverity: stats.bySeverity,
        successRate: stats.successRate,
        failureCount: stats.failureCount,
        dateRange: {
          earliest: new Date(stats.dateRange.earliest).toISOString(),
          latest: new Date(stats.dateRange.latest).toISOString(),
        },
      },
      filters: options.filters || {},
      activities: filtered.map((log) => {
        const obj: Record<string, any> = {
          id: log.id,
          timestamp: new Date(log.timestamp).toISOString(),
          type: log.type,
          category: log.category,
          severity: log.severity,
          action: log.action,
          description: log.description,
          success: log.success,
        };

        if (log.vaultAddress) obj.vaultAddress = log.vaultAddress;
        if (log.userEmail) obj.userEmail = log.userEmail;
        if (log.userId) obj.userId = log.userId;
        if (log.errorMessage) obj.errorMessage = log.errorMessage;
        if (options.includeMetadata && log.metadata) {
          obj.metadata = log.metadata;
        }
        if (options.includeChanges && log.changes) {
          obj.changes = log.changes;
        }

        return obj;
      }),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export activity logs to PDF format (text-based)
   */
  static exportToPDF(logs: ActivityLog[], options: Partial<ActivityExportOptions> = {}): string {
    const filtered = this.filterLogs(logs, options.filters);
    const stats = this.getStatistics(filtered);

    let pdf = '';

    pdf += 'ACTIVITY LOG REPORT\n';
    pdf += '==================\n\n';

    pdf += `Generated: ${new Date().toISOString()}\n`;
    pdf += `Total Activities: ${filtered.length}\n\n`;

    // Summary statistics
    pdf += 'SUMMARY\n';
    pdf += '-------\n';
    pdf += `Total: ${stats.totalActivities}\n`;
    pdf += `Success Rate: ${(stats.successRate * 100).toFixed(2)}%\n`;
    pdf += `Failures: ${stats.failureCount}\n`;
    pdf += `Date Range: ${new Date(stats.dateRange.earliest).toLocaleDateString()} - ${new Date(stats.dateRange.latest).toLocaleDateString()}\n\n`;

    // By severity
    pdf += 'BY SEVERITY\n';
    pdf += '-----------\n';
    pdf += `Critical: ${stats.bySeverity.critical || 0}\n`;
    pdf += `High: ${stats.bySeverity.high || 0}\n`;
    pdf += `Medium: ${stats.bySeverity.medium || 0}\n`;
    pdf += `Low: ${stats.bySeverity.low || 0}\n`;
    pdf += `Info: ${stats.bySeverity.info || 0}\n\n`;

    // By category
    pdf += 'BY CATEGORY\n';
    pdf += '-----------\n';
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      pdf += `${category.charAt(0).toUpperCase() + category.slice(1)}: ${count}\n`;
    });
    pdf += '\n';

    // Activity details
    pdf += 'ACTIVITY LOG DETAILS\n';
    pdf += '====================\n\n';

    filtered.forEach((log, index) => {
      pdf += `${index + 1}. ${log.action}\n`;
      pdf += `   Date: ${new Date(log.timestamp).toISOString()}\n`;
      pdf += `   Type: ${log.type}\n`;
      pdf += `   Category: ${log.category}\n`;
      pdf += `   Severity: ${log.severity}\n`;
      pdf += `   Status: ${log.success ? 'Success' : 'Failed'}\n`;

      if (log.description) {
        pdf += `   Description: ${log.description}\n`;
      }

      if (log.vaultAddress) {
        pdf += `   Vault: ${log.vaultAddress}\n`;
      }

      if (log.userEmail) {
        pdf += `   User: ${log.userEmail}\n`;
      }

      if (log.errorMessage) {
        pdf += `   Error: ${log.errorMessage}\n`;
      }

      if (options.includeMetadata && log.metadata && Object.keys(log.metadata).length > 0) {
        pdf += `   Metadata: ${JSON.stringify(log.metadata)}\n`;
      }

      if (options.includeChanges && log.changes) {
        pdf += `   Changes: ${JSON.stringify(log.changes)}\n`;
      }

      pdf += '\n';
    });

    // Footer
    pdf += '==================\n';
    pdf += 'End of Report\n';

    return pdf;
  }

  /**
   * Filter activity logs based on criteria
   */
  static filterLogs(logs: ActivityLog[], filters?: ActivityFilterOptions): ActivityLog[] {
    if (!filters) return logs;

    return logs.filter((log) => {
      // Filter by types
      if (filters.types && !filters.types.includes(log.type)) {
        return false;
      }

      // Filter by categories
      if (filters.categories && !filters.categories.includes(log.category)) {
        return false;
      }

      // Filter by severities
      if (filters.severities && !filters.severities.includes(log.severity)) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange) {
        if (log.timestamp < filters.dateRange.start || log.timestamp > filters.dateRange.end) {
          return false;
        }
      }

      // Filter by vault address
      if (filters.vaultAddress && log.vaultAddress !== filters.vaultAddress) {
        return false;
      }

      // Filter by user ID
      if (filters.userId && log.userId !== filters.userId) {
        return false;
      }

      // Filter by search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (
          !log.action.toLowerCase().includes(term) &&
          !log.description.toLowerCase().includes(term) &&
          !log.type.toLowerCase().includes(term) &&
          !(log.vaultAddress?.toLowerCase().includes(term)) &&
          !(log.userEmail?.toLowerCase().includes(term))
        ) {
          return false;
        }
      }

      // Filter success only
      if (filters.successOnly && !log.success) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get activity statistics
   */
  static getStatistics(logs: ActivityLog[]): ActivityStatistics {
    const byCategory: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    let successCount = 0;
    let failureCount = 0;

    logs.forEach((log) => {
      // Category count
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;

      // Type count
      byType[log.type] = (byType[log.type] || 0) + 1;

      // Severity count
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

      // Success/failure count
      if (log.success) {
        successCount++;
      } else {
        failureCount++;
      }
    });

    const successRate = logs.length > 0 ? successCount / logs.length : 0;

    return {
      totalActivities: logs.length,
      byCategory,
      byType,
      bySeverity,
      successRate,
      failureCount,
      dateRange: {
        earliest: logs.length > 0 ? Math.min(...logs.map((l) => l.timestamp)) : Date.now(),
        latest: logs.length > 0 ? Math.max(...logs.map((l) => l.timestamp)) : Date.now(),
      },
    };
  }

  /**
   * Download file to user's device
   */
  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy content to clipboard
   */
  static async copyToClipboard(content: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  /**
   * Generate default filename for export
   */
  static generateFilename(format: 'csv' | 'json' | 'pdf', vaultAddress?: string): string {
    const date = new Date().toISOString().split('T')[0];
    const vault = vaultAddress ? vaultAddress.substring(2, 8).toUpperCase() : 'logs';
    const ext = format === 'pdf' ? 'txt' : format;
    return `activity-log_${vault}_${date}.${ext}`;
  }

  /**
   * Search activities
   */
  static searchActivities(logs: ActivityLog[], term: string): ActivityLog[] {
    const searchTerm = term.toLowerCase();
    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchTerm) ||
        log.description.toLowerCase().includes(searchTerm) ||
        log.type.toLowerCase().includes(searchTerm) ||
        log.category.toLowerCase().includes(searchTerm) ||
        log.vaultAddress?.toLowerCase().includes(searchTerm) ||
        log.userEmail?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Group activities by date
   */
  static groupByDate(logs: ActivityLog[]): Record<string, ActivityLog[]> {
    const grouped: Record<string, ActivityLog[]> = {};

    logs.forEach((log) => {
      const date = new Date(log.timestamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });

    // Sort by date descending
    const sorted: Record<string, ActivityLog[]> = {};
    Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach((date) => {
        sorted[date] = grouped[date];
      });

    return sorted;
  }

  /**
   * Get recent activities
   */
  static getRecent(logs: ActivityLog[], limit: number = 10): ActivityLog[] {
    return logs.slice(-limit).reverse();
  }

  /**
   * Get critical activities
   */
  static getCritical(logs: ActivityLog[]): ActivityLog[] {
    return logs.filter((log) => log.severity === 'critical');
  }

  /**
   * Get failed activities
   */
  static getFailed(logs: ActivityLog[]): ActivityLog[] {
    return logs.filter((log) => !log.success);
  }
}
