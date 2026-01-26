/**
 * CSV Export Utility
 * Generates CSV files for analytics data export
 */

import { logger } from './logger';

export interface CSVExportOptions {
  filename: string;
  headers: string[];
  data: Array<Record<string, any>>;
}

export class CSVExporter {
  /**
   * Convert data array to CSV format
   */
  static generateCSV(options: CSVExportOptions): string {
    const { headers, data } = options;

    // Create header row
    const headerRow = headers.map((h) => `"${h}"`).join(',');

    // Create data rows
    const dataRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '""';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
          return `"${value}"`;
        })
        .join(',')
    );

    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Export transaction data to CSV
   */
  static exportTransactionData(transactions: any[]): string {
    const headers = ['Transaction ID', 'NFT ID', 'Seller', 'Buyer', 'Price', 'Date', 'Status', 'Type'];

    const data = transactions.map((tx) => ({
      'Transaction ID': tx.id,
      'NFT ID': tx.nft_id,
      Seller: tx.seller_id,
      Buyer: tx.buyer_id,
      Price: tx.price,
      Date: new Date(tx.created_at).toLocaleString(),
      Status: tx.status,
      Type: tx.transaction_type,
    }));

    return this.generateCSV({ filename: 'transactions', headers, data });
  }

  /**
   * Export NFT data to CSV
   */
  static exportNFTData(nfts: any[]): string {
    const headers = ['NFT ID', 'Title', 'Creator', 'Owner', 'Price', 'Status', 'Collection', 'Created Date'];

    const data = nfts.map((nft) => ({
      'NFT ID': nft.id,
      Title: nft.title,
      Creator: nft.creator_id,
      Owner: nft.owner_id,
      Price: nft.current_price,
      Status: nft.status,
      Collection: nft.collection_id,
      'Created Date': new Date(nft.created_at).toLocaleString(),
    }));

    return this.generateCSV({ filename: 'nfts', headers, data });
  }

  /**
   * Export user data to CSV
   */
  static exportUserData(users: any[]): string {
    const headers = ['User ID', 'Username', 'Wallet', 'Email', 'Role', 'Followers', 'Created Date', 'Verified'];

    const data = users.map((user) => ({
      'User ID': user.id,
      Username: user.username,
      Wallet: user.wallet_address,
      Email: user.email,
      Role: user.role,
      Followers: user.follower_count,
      'Created Date': new Date(user.created_at).toLocaleString(),
      Verified: user.verified ? 'Yes' : 'No',
    }));

    return this.generateCSV({ filename: 'users', headers, data });
  }

  /**
   * Export collection data to CSV
   */
  static exportCollectionData(collections: any[]): string {
    const headers = ['Collection ID', 'Name', 'Creator', 'Item Count', 'Floor Price', 'Volume', 'Created Date'];

    const data = collections.map((collection) => ({
      'Collection ID': collection.id,
      Name: collection.name,
      Creator: collection.creator_id,
      'Item Count': collection.item_count,
      'Floor Price': collection.floor_price,
      Volume: collection.volume,
      'Created Date': new Date(collection.created_at).toLocaleString(),
    }));

    return this.generateCSV({ filename: 'collections', headers, data });
  }

  /**
   * Export dashboard metrics to CSV
   */
  static exportDashboardMetrics(metrics: any[]): string {
    const headers = [
      'Date',
      'Total Volume',
      'Total Transactions',
      'NFTs Sold',
      'Average Price',
      'Total Users',
      'Active Users',
      'New Collections',
    ];

    const data = metrics.map((metric) => ({
      Date: metric.metric_date,
      'Total Volume': metric.total_volume,
      'Total Transactions': metric.total_transactions,
      'NFTs Sold': metric.total_nfts_sold,
      'Average Price': metric.average_price,
      'Total Users': metric.total_users,
      'Active Users': metric.active_users,
      'New Collections': metric.new_collections,
    }));

    return this.generateCSV({ filename: 'dashboard_metrics', headers, data });
  }

  /**
   * Export leaderboard data to CSV
   */
  static exportLeaderboardData(leaderboard: any[]): string {
    const headers = ['Rank', 'User/Entity', 'Type', 'Score', 'Period'];

    const data = leaderboard.map((entry) => ({
      Rank: entry.rank,
      'User/Entity': entry.username || entry.name || entry.user_id,
      Type: entry.entity_type || 'user',
      Score: entry.score,
      Period: entry.period,
    }));

    return this.generateCSV({ filename: 'leaderboard', headers, data });
  }

  /**
   * Export volume metrics to CSV
   */
  static exportVolumeMetrics(metrics: any[]): string {
    const headers = ['Timestamp', 'Volume', 'Transaction Count', 'Average Price', 'Active Users'];

    const data = metrics.map((metric) => ({
      Timestamp: new Date(metric.metric_hour).toLocaleString(),
      Volume: metric.volume,
      'Transaction Count': metric.transaction_count,
      'Average Price': metric.average_price || (metric.volume / metric.transaction_count).toFixed(8),
      'Active Users': metric.active_users,
    }));

    return this.generateCSV({ filename: 'volume_metrics', headers, data });
  }

  /**
   * Export auction data to CSV
   */
  static exportAuctionData(auctions: any[]): string {
    const headers = ['Auction ID', 'NFT ID', 'Creator', 'Start Price', 'Current Bid', 'Bids Count', 'Status', 'End Time'];

    const data = auctions.map((auction) => ({
      'Auction ID': auction.id,
      'NFT ID': auction.nft_id,
      Creator: auction.creator_id,
      'Start Price': auction.start_price,
      'Current Bid': auction.current_bid,
      'Bids Count': auction.bid_count,
      Status: auction.status,
      'End Time': new Date(auction.end_time).toLocaleString(),
    }));

    return this.generateCSV({ filename: 'auctions', headers, data });
  }

  /**
   * Export search analytics to CSV
   */
  static exportSearchAnalytics(searches: any[]): string {
    const headers = ['Search Query', 'Result Count', 'User ID', 'Timestamp', 'Clicked Result'];

    const data = searches.map((search) => ({
      'Search Query': search.search_query,
      'Result Count': search.result_count,
      'User ID': search.user_id || 'Anonymous',
      Timestamp: new Date(search.created_at).toLocaleString(),
      'Clicked Result': search.clicked_result_id || 'None',
    }));

    return this.generateCSV({ filename: 'search_analytics', headers, data });
  }

  /**
   * Export ROI tracking data to CSV
   */
  static exportROIData(roiData: any[]): string {
    const headers = ['User ID', 'NFT ID', 'Purchase Price', 'Current Price', 'ROI %', 'Purchase Date', 'Last Updated'];

    const data = roiData.map((roi) => ({
      'User ID': roi.user_id,
      'NFT ID': roi.nft_id,
      'Purchase Price': roi.purchase_price,
      'Current Price': roi.current_price,
      'ROI %': roi.roi_percent?.toFixed(2) || 'N/A',
      'Purchase Date': new Date(roi.purchase_date).toLocaleString(),
      'Last Updated': new Date(roi.last_updated).toLocaleString(),
    }));

    return this.generateCSV({ filename: 'roi_tracking', headers, data });
  }

  /**
   * Create downloadable blob from CSV
   */
  static createDownloadBlob(csvContent: string): Blob {
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Generate download filename with timestamp
   */
  static generateFilename(baseFilename: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    return `${baseFilename}_${timestamp}.csv`;
  }
}
