import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface Transaction {
  id: string;
  userId: string;
  nftId: string;
  nftName: string;
  nftImage: string;
  type: 'purchase' | 'sale' | 'mint' | 'transfer' | 'listing' | 'delisting' | 'bid' | 'bid_accepted';
  price: number;
  currency: 'STX' | 'ETH' | 'USD';
  from?: string;
  to?: string;
  timestamp: Date;
  transactionHash?: string;
  gasPrice?: number;
  status: 'pending' | 'completed' | 'failed';
  metadata?: any;
}

export interface TransactionAnalytics {
  totalTransactions: number;
  totalPurchases: number;
  totalSales: number;
  totalSpent: number;
  totalEarned: number;
  netProfit: number;
  realizedGains: number;
  unrealizedGains: number;
  roi: number;
  avgPurchasePrice: number;
  avgSalePrice: number;
  mostProfitableSale: Transaction | null;
  biggestLoss: Transaction | null;
  topNFTs: Array<{
    nftId: string;
    nftName: string;
    profit: number;
    transactions: number;
  }>;
}

export interface PriceHistoryPoint {
  date: string;
  avgPrice: number;
  volume: number;
  transactions: number;
  minPrice: number;
  maxPrice: number;
}

export interface TaxReport {
  year: number;
  totalGains: number;
  totalLosses: number;
  netGainLoss: number;
  shortTermGains: number;
  longTermGains: number;
  transactions: Array<{
    date: string;
    type: 'sale' | 'purchase';
    nftName: string;
    costBasis: number;
    salePrice: number;
    gainLoss: number;
    holdingPeriod: number;
    isShortTerm: boolean;
  }>;
}

class TransactionHistoryServiceClass {
  /**
   * Get user's complete transaction history
   */
  async getUserTransactions(
    userId: string,
    options: {
      type?: Transaction['type'];
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
      sortBy?: 'timestamp' | 'price';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .or(`from.eq.${userId},to.eq.${userId}`);

      // Apply filters
      if (options.type) {
        query = query.eq('type', options.type);
      }

      if (options.startDate) {
        query = query.gte('timestamp', options.startDate.toISOString());
      }

      if (options.endDate) {
        query = query.lte('timestamp', options.endDate.toISOString());
      }

      // Sorting
      const sortBy = options.sortBy || 'timestamp';
      const sortOrder = options.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        transactions: data || [],
        total: count || 0
      };
    } catch (error) {
      logger.error('Error fetching user transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction analytics for a user
   */
  async getTransactionAnalytics(userId: string, period?: { start: Date; end: Date }): Promise<TransactionAnalytics> {
    try {
      // Fetch all transactions for the period
      const { transactions } = await this.getUserTransactions(userId, {
        startDate: period?.start,
        endDate: period?.end,
        limit: 10000
      });

      // Calculate analytics
      const purchases = transactions.filter(t => t.type === 'purchase' || t.type === 'mint');
      const sales = transactions.filter(t => t.type === 'sale' || t.type === 'bid_accepted');
      
      const totalSpent = purchases.reduce((sum, t) => sum + (t.price || 0), 0);
      const totalEarned = sales.reduce((sum, t) => sum + (t.price || 0), 0);
      const netProfit = totalEarned - totalSpent;
      
      // Calculate realized gains (matched buy-sell pairs)
      const realizedGains = this.calculateRealizedGains(transactions);
      
      // ROI calculation
      const roi = totalSpent > 0 ? ((totalEarned - totalSpent) / totalSpent) * 100 : 0;
      
      // Average prices
      const avgPurchasePrice = purchases.length > 0 ? totalSpent / purchases.length : 0;
      const avgSalePrice = sales.length > 0 ? totalEarned / sales.length : 0;
      
      // Most profitable sale and biggest loss
      const salesWithProfit = sales.map(sale => {
        const purchase = purchases.find(p => p.nftId === sale.nftId);
        return {
          ...sale,
          profit: purchase ? (sale.price || 0) - (purchase.price || 0) : (sale.price || 0)
        };
      });
      
      const mostProfitableSale = salesWithProfit.reduce((max, s) => 
        s.profit > (max?.profit || 0) ? s : max, salesWithProfit[0] || null
      );
      
      const biggestLoss = salesWithProfit.reduce((min, s) => 
        s.profit < (min?.profit || 0) ? s : min, salesWithProfit[0] || null
      );
      
      // Top NFTs by profit
      const nftProfits = new Map<string, { name: string; profit: number; transactions: number }>();
      
      salesWithProfit.forEach(sale => {
        const existing = nftProfits.get(sale.nftId) || { name: sale.nftName, profit: 0, transactions: 0 };
        existing.profit += sale.profit;
        existing.transactions += 1;
        nftProfits.set(sale.nftId, existing);
      });
      
      const topNFTs = Array.from(nftProfits.entries())
        .map(([nftId, data]) => ({ nftId, nftName: data.name, profit: data.profit, transactions: data.transactions }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10);

      return {
        totalTransactions: transactions.length,
        totalPurchases: purchases.length,
        totalSales: sales.length,
        totalSpent,
        totalEarned,
        netProfit,
        realizedGains,
        unrealizedGains: 0, // Would need current NFT values
        roi,
        avgPurchasePrice,
        avgSalePrice,
        mostProfitableSale,
        biggestLoss,
        topNFTs
      };
    } catch (error) {
      logger.error('Error calculating transaction analytics:', error);
      throw error;
    }
  }

  /**
   * Get price history over time
   */
  async getPriceHistory(
    userId: string,
    days: number = 30,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<PriceHistoryPoint[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { transactions } = await this.getUserTransactions(userId, {
        startDate,
        limit: 10000
      });

      // Group transactions by date
      const grouped = new Map<string, Transaction[]>();
      
      transactions.forEach(t => {
        const date = new Date(t.timestamp);
        let key: string;
        
        if (groupBy === 'day') {
          key = date.toISOString().split('T')[0];
        } else if (groupBy === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(t);
      });

      // Calculate stats for each group
      const history: PriceHistoryPoint[] = [];
      
      grouped.forEach((txs, date) => {
        const prices = txs.filter(t => t.price > 0).map(t => t.price);
        const totalVolume = prices.reduce((sum, p) => sum + p, 0);
        
        if (prices.length > 0) {
          history.push({
            date,
            avgPrice: totalVolume / prices.length,
            volume: totalVolume,
            transactions: txs.length,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices)
          });
        }
      });

      return history.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      logger.error('Error fetching price history:', error);
      throw error;
    }
  }

  /**
   * Generate tax report for a specific year
   */
  async generateTaxReport(userId: string, year: number): Promise<TaxReport> {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const { transactions } = await this.getUserTransactions(userId, {
        startDate,
        endDate,
        limit: 10000
      });

      const purchases = transactions.filter(t => t.type === 'purchase' || t.type === 'mint');
      const sales = transactions.filter(t => t.type === 'sale' || t.type === 'bid_accepted');

      let totalGains = 0;
      let totalLosses = 0;
      let shortTermGains = 0;
      let longTermGains = 0;

      const taxTransactions = sales.map(sale => {
        const purchase = purchases.find(p => p.nftId === sale.nftId);
        const costBasis = purchase?.price || 0;
        const salePrice = sale.price || 0;
        const gainLoss = salePrice - costBasis;

        // Calculate holding period in days
        const holdingPeriod = purchase 
          ? Math.floor((new Date(sale.timestamp).getTime() - new Date(purchase.timestamp).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const isShortTerm = holdingPeriod < 365;

        if (gainLoss > 0) {
          totalGains += gainLoss;
          if (isShortTerm) {
            shortTermGains += gainLoss;
          } else {
            longTermGains += gainLoss;
          }
        } else {
          totalLosses += Math.abs(gainLoss);
        }

        return {
          date: new Date(sale.timestamp).toISOString().split('T')[0],
          type: 'sale' as const,
          nftName: sale.nftName,
          costBasis,
          salePrice,
          gainLoss,
          holdingPeriod,
          isShortTerm
        };
      });

      return {
        year,
        totalGains,
        totalLosses,
        netGainLoss: totalGains - totalLosses,
        shortTermGains,
        longTermGains,
        transactions: taxTransactions
      };
    } catch (error) {
      logger.error('Error generating tax report:', error);
      throw error;
    }
  }

  /**
   * Export transactions to CSV
   */
  async exportToCSV(userId: string, options: {
    startDate?: Date;
    endDate?: Date;
    type?: Transaction['type'];
  } = {}): Promise<string> {
    try {
      const { transactions } = await this.getUserTransactions(userId, {
        ...options,
        limit: 100000
      });

      // CSV headers
      const headers = [
        'Date',
        'Type',
        'NFT Name',
        'Price',
        'Currency',
        'From',
        'To',
        'Transaction Hash',
        'Status'
      ];

      // CSV rows
      const rows = transactions.map(t => [
        new Date(t.timestamp).toISOString(),
        t.type,
        t.nftName,
        t.price?.toString() || '0',
        t.currency,
        t.from || '',
        t.to || '',
        t.transactionHash || '',
        t.status
      ]);

      // Generate CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      logger.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Calculate realized gains from matched buy-sell pairs
   */
  private calculateRealizedGains(transactions: Transaction[]): number {
    const purchases = transactions.filter(t => t.type === 'purchase' || t.type === 'mint');
    const sales = transactions.filter(t => t.type === 'sale' || t.type === 'bid_accepted');

    let realizedGains = 0;

    sales.forEach(sale => {
      const purchase = purchases.find(p => p.nftId === sale.nftId);
      if (purchase) {
        realizedGains += (sale.price || 0) - (purchase.price || 0);
      }
    });

    return realizedGains;
  }

  /**
   * Get transaction statistics summary
   */
  async getTransactionStats(userId: string): Promise<{
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  }> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [today, thisWeek, thisMonth, allTime] = await Promise.all([
        this.getUserTransactions(userId, { startDate: startOfDay }),
        this.getUserTransactions(userId, { startDate: startOfWeek }),
        this.getUserTransactions(userId, { startDate: startOfMonth }),
        this.getUserTransactions(userId, {})
      ]);

      return {
        today: today.total,
        thisWeek: thisWeek.total,
        thisMonth: thisMonth.total,
        allTime: allTime.total
      };
    } catch (error) {
      logger.error('Error fetching transaction stats:', error);
      throw error;
    }
  }
}

export const TransactionHistoryService = new TransactionHistoryServiceClass();
