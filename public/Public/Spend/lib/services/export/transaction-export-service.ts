/**
 * Transaction Export Service
 * Exports transactions in CSV, JSON, and PDF formats
 */

export interface Transaction {
  id: string;
  hash: string;
  vaultAddress: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'approval';
  amount: string;
  token: string;
  from: string;
  to: string;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  timestamp: number;
  blockNumber: number;
  gasUsed?: string;
  gasPrice?: string;
  fees?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeMetadata?: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  types?: Transaction['type'][];
  statuses?: Transaction['status'][];
  vaultAddress?: string;
  filename?: string;
}

export class TransactionExportService {
  /**
   * Export transactions to CSV
   */
  static exportToCSV(transactions: Transaction[], options: Partial<ExportOptions> = {}): string {
    const filtered = this.filterTransactions(transactions, options);

    // Headers
    const headers = [
      'Transaction Hash',
      'Type',
      'Date/Time',
      'From',
      'To',
      'Amount',
      'Token',
      'Status',
      'Block',
      'Gas Used',
      'Gas Price',
      'Fees',
      'Description',
    ];

    // Build CSV rows
    const rows = filtered.map((tx) => [
      tx.hash,
      tx.type.toUpperCase(),
      new Date(tx.timestamp).toISOString(),
      tx.from,
      tx.to,
      tx.amount,
      tx.token,
      tx.status.toUpperCase(),
      tx.blockNumber,
      tx.gasUsed || '',
      tx.gasPrice || '',
      tx.fees || '',
      (tx.description || '').replace(/"/g, '""'),
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

    // Add summary footer
    const summary = [
      '',
      'SUMMARY',
      `Total Transactions: ${filtered.length}`,
      `Completed: ${filtered.filter((t) => t.status === 'completed').length}`,
      `Pending: ${filtered.filter((t) => t.status === 'pending').length}`,
      `Failed: ${filtered.filter((t) => t.status === 'failed').length}`,
      `Rejected: ${filtered.filter((t) => t.status === 'rejected').length}`,
    ];

    return [headers.join(','), ...csvRows, '', ...summary.join(',')].join('\n');
  }

  /**
   * Export transactions to JSON
   */
  static exportToJSON(transactions: Transaction[], options: Partial<ExportOptions> = {}): string {
    const filtered = this.filterTransactions(transactions, options);

    const data = {
      exportDate: new Date().toISOString(),
      totalCount: filtered.length,
      summary: {
        total: filtered.length,
        completed: filtered.filter((t) => t.status === 'completed').length,
        pending: filtered.filter((t) => t.status === 'pending').length,
        failed: filtered.filter((t) => t.status === 'failed').length,
        rejected: filtered.filter((t) => t.status === 'rejected').length,
      },
      typeBreakdown: {
        deposit: filtered.filter((t) => t.type === 'deposit').length,
        withdrawal: filtered.filter((t) => t.type === 'withdrawal').length,
        transfer: filtered.filter((t) => t.type === 'transfer').length,
        approval: filtered.filter((t) => t.type === 'approval').length,
      },
      transactions: filtered.map((tx) => {
        const obj: Record<string, any> = {
          hash: tx.hash,
          type: tx.type,
          date: new Date(tx.timestamp).toISOString(),
          from: tx.from,
          to: tx.to,
          amount: tx.amount,
          token: tx.token,
          status: tx.status,
          blockNumber: tx.blockNumber,
        };

        if (tx.gasUsed) obj.gasUsed = tx.gasUsed;
        if (tx.gasPrice) obj.gasPrice = tx.gasPrice;
        if (tx.fees) obj.fees = tx.fees;
        if (tx.description) obj.description = tx.description;
        if (options.includeMetadata && tx.metadata) {
          obj.metadata = tx.metadata;
        }

        return obj;
      }),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export transactions to PDF (simple format)
   * For full PDF generation, use a library like jsPDF
   */
  static exportToPDF(transactions: Transaction[], options: Partial<ExportOptions> = {}): string {
    const filtered = this.filterTransactions(transactions, options);
    const vaultAddress = options.vaultAddress || 'All Vaults';

    // Build plain text report
    let pdf = '';

    pdf += 'TRANSACTION EXPORT REPORT\n';
    pdf += '=======================\n\n';

    pdf += `Generated: ${new Date().toISOString()}\n`;
    pdf += `Vault Address: ${vaultAddress}\n`;
    pdf += `Total Transactions: ${filtered.length}\n\n`;

    // Summary section
    pdf += 'SUMMARY\n';
    pdf += '-------\n';
    pdf += `Completed: ${filtered.filter((t) => t.status === 'completed').length}\n`;
    pdf += `Pending: ${filtered.filter((t) => t.status === 'pending').length}\n`;
    pdf += `Failed: ${filtered.filter((t) => t.status === 'failed').length}\n`;
    pdf += `Rejected: ${filtered.filter((t) => t.status === 'rejected').length}\n\n`;

    // Type breakdown
    pdf += 'TRANSACTION TYPES\n';
    pdf += '-----------------\n';
    pdf += `Deposits: ${filtered.filter((t) => t.type === 'deposit').length}\n`;
    pdf += `Withdrawals: ${filtered.filter((t) => t.type === 'withdrawal').length}\n`;
    pdf += `Transfers: ${filtered.filter((t) => t.type === 'transfer').length}\n`;
    pdf += `Approvals: ${filtered.filter((t) => t.type === 'approval').length}\n\n`;

    // Transaction details
    pdf += 'TRANSACTIONS\n';
    pdf += '=============\n\n';

    filtered.forEach((tx, index) => {
      pdf += `${index + 1}. ${tx.type.toUpperCase()} - ${tx.hash.substring(0, 10)}...\n`;
      pdf += `   Date: ${new Date(tx.timestamp).toISOString()}\n`;
      pdf += `   Amount: ${tx.amount} ${tx.token}\n`;
      pdf += `   From: ${tx.from}\n`;
      pdf += `   To: ${tx.to}\n`;
      pdf += `   Status: ${tx.status.toUpperCase()}\n`;
      pdf += `   Block: ${tx.blockNumber}\n`;

      if (tx.description) {
        pdf += `   Description: ${tx.description}\n`;
      }

      if (tx.fees) {
        pdf += `   Fees: ${tx.fees}\n`;
      }

      if (options.includeMetadata && tx.metadata) {
        pdf += `   Metadata: ${JSON.stringify(tx.metadata)}\n`;
      }

      pdf += '\n';
    });

    // Footer
    pdf += '=======================\n';
    pdf += 'End of Report\n';

    return pdf;
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
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  /**
   * Filter transactions based on options
   */
  private static filterTransactions(
    transactions: Transaction[],
    options: Partial<ExportOptions>
  ): Transaction[] {
    return transactions.filter((tx) => {
      // Filter by vault address
      if (options.vaultAddress && tx.vaultAddress !== options.vaultAddress) {
        return false;
      }

      // Filter by date range
      if (options.dateRange) {
        if (tx.timestamp < options.dateRange.start || tx.timestamp > options.dateRange.end) {
          return false;
        }
      }

      // Filter by transaction types
      if (options.types && !options.types.includes(tx.type)) {
        return false;
      }

      // Filter by status
      if (options.statuses && !options.statuses.includes(tx.status)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Generate default filename for export
   */
  static generateFilename(format: 'csv' | 'json' | 'pdf', vaultAddress?: string): string {
    const date = new Date().toISOString().split('T')[0];
    const vault = vaultAddress ? vaultAddress.substring(2, 8).toUpperCase() : 'vault';
    const ext = format === 'pdf' ? 'txt' : format;
    return `transactions_${vault}_${date}.${ext}`;
  }

  /**
   * Get export statistics
   */
  static getStatistics(transactions: Transaction[]): Record<string, any> {
    const completed = transactions.filter((t) => t.status === 'completed');
    const pending = transactions.filter((t) => t.status === 'pending');
    const failed = transactions.filter((t) => t.status === 'failed');

    // Parse amounts (assuming they're strings with decimals)
    const getAmount = (tx: Transaction): number => {
      try {
        return parseFloat(tx.amount);
      } catch {
        return 0;
      }
    };

    const totalAmount = completed.reduce((sum, tx) => sum + getAmount(tx), 0);
    const avgAmount = completed.length > 0 ? totalAmount / completed.length : 0;

    return {
      total: transactions.length,
      completed: completed.length,
      pending: pending.length,
      failed: failed.length,
      totalAmount: totalAmount.toFixed(4),
      averageAmount: avgAmount.toFixed(4),
      highestAmount: completed.length > 0
        ? Math.max(...completed.map((t) => getAmount(t))).toFixed(4)
        : '0',
      lowestAmount: completed.length > 0
        ? Math.min(...completed.map((t) => getAmount(t))).toFixed(4)
        : '0',
      dateRange: {
        earliest: transactions.length > 0
          ? new Date(Math.min(...transactions.map((t) => t.timestamp))).toISOString()
          : null,
        latest: transactions.length > 0
          ? new Date(Math.max(...transactions.map((t) => t.timestamp))).toISOString()
          : null,
      },
    };
  }
}
