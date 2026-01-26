/**
 * CSV Export Utility - Re-export for frontend usage
 */

export interface AirdropDataExport {
  timestamp: string;
  address: string;
  campaignId: string;
  allocationAmount: string;
  claimedAmount: string;
  claimDate?: string;
  claimStatus: 'claimed' | 'pending' | 'expired';
  vestingSchedule?: string;
  transactionHash?: string;
}

export interface MetricsExport {
  date: string;
  totalUsers: number;
  claimedUsers: number;
  pendingUsers: number;
  totalAllocated: string;
  totalClaimed: string;
  claimRate: number;
  averageClaimSize: string;
  uniqueClaimers: number;
  transactionCount: number;
}

export interface LeaderboardExport {
  rank: number;
  address: string;
  totalClaimed: string;
  numberOfClaims: number;
  percentageOfTotal: number;
  firstClaimDate: string;
  lastClaimDate: string;
  joinDate: string;
}

export interface ExportOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
  quoteFields?: boolean;
}

class CSVExportService {
  static exportAirdropData(
    data: AirdropDataExport[],
    options: ExportOptions = {}
  ): string {
    const defaultOptions: ExportOptions = {
      includeHeaders: true,
      delimiter: ',',
      quoteFields: true,
      ...options
    };

    const headers = [
      'Timestamp',
      'Address',
      'Campaign ID',
      'Allocation Amount',
      'Claimed Amount',
      'Claim Date',
      'Status',
      'Vesting Schedule',
      'Transaction Hash'
    ];

    const rows: string[] = [];

    if (defaultOptions.includeHeaders) {
      rows.push(
        this.formatCSVRow(headers, defaultOptions.delimiter!, defaultOptions.quoteFields!)
      );
    }

    for (const item of data) {
      const row = [
        item.timestamp,
        item.address,
        item.campaignId,
        item.allocationAmount,
        item.claimedAmount,
        item.claimDate || '',
        item.claimStatus,
        item.vestingSchedule || '',
        item.transactionHash || ''
      ];
      rows.push(
        this.formatCSVRow(row, defaultOptions.delimiter!, defaultOptions.quoteFields!)
      );
    }

    return rows.join('\n');
  }

  static exportMetrics(
    data: MetricsExport[],
    options: ExportOptions = {}
  ): string {
    const defaultOptions: ExportOptions = {
      includeHeaders: true,
      delimiter: ',',
      quoteFields: true,
      ...options
    };

    const headers = [
      'Date',
      'Total Users',
      'Claimed Users',
      'Pending Users',
      'Total Allocated',
      'Total Claimed',
      'Claim Rate (%)',
      'Average Claim Size',
      'Unique Claimers',
      'Transaction Count'
    ];

    const rows: string[] = [];

    if (defaultOptions.includeHeaders) {
      rows.push(
        this.formatCSVRow(headers, defaultOptions.delimiter!, defaultOptions.quoteFields!)
      );
    }

    for (const item of data) {
      const row = [
        item.date,
        item.totalUsers.toString(),
        item.claimedUsers.toString(),
        item.pendingUsers.toString(),
        item.totalAllocated,
        item.totalClaimed,
        item.claimRate.toFixed(2),
        item.averageClaimSize,
        item.uniqueClaimers.toString(),
        item.transactionCount.toString()
      ];
      rows.push(
        this.formatCSVRow(row, defaultOptions.delimiter!, defaultOptions.quoteFields!)
      );
    }

    return rows.join('\n');
  }

  static exportLeaderboard(
    data: LeaderboardExport[],
    options: ExportOptions = {}
  ): string {
    const defaultOptions: ExportOptions = {
      includeHeaders: true,
      delimiter: ',',
      quoteFields: true,
      ...options
    };

    const headers = [
      'Rank',
      'Address',
      'Total Claimed',
      'Number of Claims',
      'Percentage of Total (%)',
      'First Claim Date',
      'Last Claim Date',
      'Join Date'
    ];

    const rows: string[] = [];

    if (defaultOptions.includeHeaders) {
      rows.push(
        this.formatCSVRow(headers, defaultOptions.delimiter!, defaultOptions.quoteFields!)
      );
    }

    for (const item of data) {
      const row = [
        item.rank.toString(),
        item.address,
        item.totalClaimed,
        item.numberOfClaims.toString(),
        item.percentageOfTotal.toFixed(4),
        item.firstClaimDate,
        item.lastClaimDate,
        item.joinDate
      ];
      rows.push(
        this.formatCSVRow(row, defaultOptions.delimiter!, defaultOptions.quoteFields!)
      );
    }

    return rows.join('\n');
  }

  static exportGeneric(
    data: Record<string, any>[],
    options: ExportOptions = {}
  ): string {
    if (data.length === 0) {
      return '';
    }

    const defaultOptions: ExportOptions = {
      includeHeaders: true,
      delimiter: ',',
      quoteFields: true,
      ...options
    };

    const headers = Object.keys(data[0]);
    const rows: string[] = [];

    if (defaultOptions.includeHeaders) {
      rows.push(
        this.formatCSVRow(headers, defaultOptions.delimiter!, defaultOptions.quoteFields!)
      );
    }

    for (const item of data) {
      const row = headers.map(header => this.formatCSVValue(item[header]));
      rows.push(
        this.formatCSVRow(row, defaultOptions.delimiter!, defaultOptions.quoteFields!)
      );
    }

    return rows.join('\n');
  }

  static downloadCSV(content: string, filename: string): void {
    if (typeof window === 'undefined') {
      console.error('downloadCSV can only be used in browser environment');
      return;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static generateFilename(prefix: string = 'export', extension: string = 'csv'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    return `${prefix}_${timestamp}.${extension}`;
  }

  private static formatCSVRow(
    values: string[],
    delimiter: string,
    quoteFields: boolean
  ): string {
    return values
      .map(value => this.formatCSVValue(value, quoteFields))
      .join(delimiter);
  }

  private static formatCSVValue(value: any, quote: boolean = true): string {
    let stringValue = String(value ?? '');

    stringValue = stringValue.replace(/"/g, '""');

    if (quote && (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n'))) {
      return `"${stringValue}"`;
    }

    return stringValue;
  }
}

export default CSVExportService;
