import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface TradingStats {
  user_id: string;
  total_volume: number;
  total_sales: number;
  total_purchases: number;
  profit_loss: number;
  best_sale: number;
  worst_loss: number;
  avg_sale_price: number;
  avg_purchase_price: number;
  total_trades: number;
  successful_sales: number;
  successful_purchases: number;
  period: 'all_time' | '30d' | '7d' | '24h';
}

export interface TradingActivity {
  date: string;
  sales_volume: number;
  purchases_volume: number;
  net_profit: number;
  trades_count: number;
}

export interface TopTrade {
  nft_id: string;
  nft_name: string;
  nft_image: string;
  type: 'sale' | 'purchase';
  amount: number;
  counterparty: string;
  timestamp: string;
}

class TradingStatsServiceClass {
  /**
   * Get trading statistics for a user
   */
  async getTradingStats(
    userId: string,
    period: 'all_time' | '30d' | '7d' | '24h' = 'all_time'
  ): Promise<TradingStats | null> {
    try {
      let dateFilter: Date | undefined;

      // Calculate date filter based on period
      if (period !== 'all_time') {
        dateFilter = new Date();
        switch (period) {
          case '24h':
            dateFilter.setHours(dateFilter.getHours() - 24);
            break;
          case '7d':
            dateFilter.setDate(dateFilter.getDate() - 7);
            break;
          case '30d':
            dateFilter.setDate(dateFilter.getDate() - 30);
            break;
        }
      }

      // Get sales
      let salesQuery = supabase
        .from('transactions')
        .select('amount')
        .eq('seller_id', userId)
        .eq('type', 'sale');

      if (dateFilter) {
        salesQuery = salesQuery.gte('created_at', dateFilter.toISOString());
      }

      const { data: sales, error: salesError } = await salesQuery;

      if (salesError) {
        logger.error('Error fetching sales:', salesError);
      }

      // Get purchases
      let purchasesQuery = supabase
        .from('transactions')
        .select('amount')
        .eq('buyer_id', userId)
        .eq('type', 'sale');

      if (dateFilter) {
        purchasesQuery = purchasesQuery.gte('created_at', dateFilter.toISOString());
      }

      const { data: purchases, error: purchasesError } = await purchasesQuery;

      if (purchasesError) {
        logger.error('Error fetching purchases:', purchasesError);
      }

      // Calculate stats
      const salesAmounts = sales?.map(s => s.amount || 0) || [];
      const purchaseAmounts = purchases?.map(p => p.amount || 0) || [];

      const totalSales = salesAmounts.reduce((sum, amount) => sum + amount, 0);
      const totalPurchases = purchaseAmounts.reduce((sum, amount) => sum + amount, 0);
      const profitLoss = totalSales - totalPurchases;
      const totalVolume = totalSales + totalPurchases;
      const totalTrades = salesAmounts.length + purchaseAmounts.length;

      const bestSale = salesAmounts.length > 0 ? Math.max(...salesAmounts) : 0;
      const worstLoss = purchaseAmounts.length > 0 ? Math.max(...purchaseAmounts) : 0;

      const avgSalePrice = salesAmounts.length > 0 ? totalSales / salesAmounts.length : 0;
      const avgPurchasePrice = purchaseAmounts.length > 0 ? totalPurchases / purchaseAmounts.length : 0;

      return {
        user_id: userId,
        total_volume: totalVolume,
        total_sales: totalSales,
        total_purchases: totalPurchases,
        profit_loss: profitLoss,
        best_sale: bestSale,
        worst_loss: worstLoss,
        avg_sale_price: avgSalePrice,
        avg_purchase_price: avgPurchasePrice,
        total_trades: totalTrades,
        successful_sales: salesAmounts.length,
        successful_purchases: purchaseAmounts.length,
        period,
      };
    } catch (error) {
      logger.error('Error in getTradingStats:', error);
      return null;
    }
  }

  /**
   * Get trading activity chart data
   */
  async getTradingActivity(
    userId: string,
    days: number = 30
  ): Promise<TradingActivity[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
        .eq('type', 'sale')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching trading activity:', error);
        return [];
      }

      // Group by date
      const activityByDate: { [key: string]: TradingActivity } = {};

      transactions?.forEach((tx: any) => {
        const date = new Date(tx.created_at).toISOString().split('T')[0];

        if (!activityByDate[date]) {
          activityByDate[date] = {
            date,
            sales_volume: 0,
            purchases_volume: 0,
            net_profit: 0,
            trades_count: 0,
          };
        }

        if (tx.seller_id === userId) {
          activityByDate[date].sales_volume += tx.amount || 0;
          activityByDate[date].net_profit += tx.amount || 0;
        } else if (tx.buyer_id === userId) {
          activityByDate[date].purchases_volume += tx.amount || 0;
          activityByDate[date].net_profit -= tx.amount || 0;
        }

        activityByDate[date].trades_count++;
      });

      return Object.values(activityByDate).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      logger.error('Error in getTradingActivity:', error);
      return [];
    }
  }

  /**
   * Get top trades (best sales and purchases)
   */
  async getTopTrades(userId: string, limit: number = 5): Promise<{
    top_sales: TopTrade[];
    top_purchases: TopTrade[];
  }> {
    try {
      // Get top sales
      const { data: topSales, error: salesError } = await supabase
        .from('transactions')
        .select(`
          amount,
          created_at,
          buyer_id,
          nft:nfts(id, name, image_url)
        `)
        .eq('seller_id', userId)
        .eq('type', 'sale')
        .order('amount', { ascending: false })
        .limit(limit);

      if (salesError) {
        logger.error('Error fetching top sales:', salesError);
      }

      // Get top purchases
      const { data: topPurchases, error: purchasesError } = await supabase
        .from('transactions')
        .select(`
          amount,
          created_at,
          seller_id,
          nft:nfts(id, name, image_url)
        `)
        .eq('buyer_id', userId)
        .eq('type', 'sale')
        .order('amount', { ascending: false })
        .limit(limit);

      if (purchasesError) {
        logger.error('Error fetching top purchases:', purchasesError);
      }

      // Get usernames for counterparties
      const buyerIds = topSales?.map((t: any) => t.buyer_id) || [];
      const sellerIds = topPurchases?.map((t: any) => t.seller_id) || [];
      const allUserIds = [...new Set([...buyerIds, ...sellerIds])];

      const { data: users } = await supabase
        .from('users')
        .select('user_id, username')
        .in('user_id', allUserIds);

      const userMap = new Map(users?.map(u => [u.user_id, u.username]) || []);

      // Format top sales
      const formattedSales: TopTrade[] = topSales?.map((t: any) => ({
        nft_id: t.nft?.id || '',
        nft_name: t.nft?.name || 'Unknown NFT',
        nft_image: t.nft?.image_url || '',
        type: 'sale' as const,
        amount: t.amount || 0,
        counterparty: userMap.get(t.buyer_id) || 'Unknown',
        timestamp: t.created_at,
      })) || [];

      // Format top purchases
      const formattedPurchases: TopTrade[] = topPurchases?.map((t: any) => ({
        nft_id: t.nft?.id || '',
        nft_name: t.nft?.name || 'Unknown NFT',
        nft_image: t.nft?.image_url || '',
        type: 'purchase' as const,
        amount: t.amount || 0,
        counterparty: userMap.get(t.seller_id) || 'Unknown',
        timestamp: t.created_at,
      })) || [];

      return {
        top_sales: formattedSales,
        top_purchases: formattedPurchases,
      };
    } catch (error) {
      logger.error('Error in getTopTrades:', error);
      return {
        top_sales: [],
        top_purchases: [],
      };
    }
  }

  /**
   * Get trading streak (consecutive days with trades)
   */
  async getTradingStreak(userId: string): Promise<{
    current_streak: number;
    longest_streak: number;
    last_trade_date: string | null;
  }> {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('created_at')
        .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
        .eq('type', 'sale')
        .order('created_at', { ascending: false });

      if (error || !transactions || transactions.length === 0) {
        return { current_streak: 0, longest_streak: 0, last_trade_date: null };
      }

      // Get unique trade dates
      const tradeDates = [...new Set(
        transactions.map(t => new Date(t.created_at).toISOString().split('T')[0])
      )].sort().reverse();

      if (tradeDates.length === 0) {
        return { current_streak: 0, longest_streak: 0, last_trade_date: null };
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let checkDate = tradeDates[0] === today || tradeDates[0] === yesterday ? tradeDates[0] : null;

      if (checkDate) {
        for (let i = 0; i < tradeDates.length; i++) {
          const expectedDate = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
          if (tradeDates[i] === expectedDate) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;

      for (let i = 1; i < tradeDates.length; i++) {
        const prevDate = new Date(tradeDates[i - 1]);
        const currDate = new Date(tradeDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_trade_date: tradeDates[0],
      };
    } catch (error) {
      logger.error('Error in getTradingStreak:', error);
      return { current_streak: 0, longest_streak: 0, last_trade_date: null };
    }
  }

  /**
   * Get profit/loss breakdown by NFT category
   */
  async getProfitByCategory(userId: string): Promise<{
    category: string;
    profit_loss: number;
    trades_count: number;
  }[]> {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          seller_id,
          buyer_id,
          nft:nfts(category)
        `)
        .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
        .eq('type', 'sale');

      if (error || !transactions) {
        logger.error('Error fetching transactions for category breakdown:', error);
        return [];
      }

      // Group by category
      const categoryStats: { [key: string]: { profit_loss: number; trades_count: number } } = {};

      transactions.forEach((tx: any) => {
        const category = tx.nft?.category || 'Uncategorized';

        if (!categoryStats[category]) {
          categoryStats[category] = { profit_loss: 0, trades_count: 0 };
        }

        if (tx.seller_id === userId) {
          categoryStats[category].profit_loss += tx.amount || 0;
        } else if (tx.buyer_id === userId) {
          categoryStats[category].profit_loss -= tx.amount || 0;
        }

        categoryStats[category].trades_count++;
      });

      return Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        profit_loss: stats.profit_loss,
        trades_count: stats.trades_count,
      }));
    } catch (error) {
      logger.error('Error in getProfitByCategory:', error);
      return [];
    }
  }

  /**
   * Get comparative stats (user vs platform average)
   */
  async getComparativeStats(userId: string): Promise<{
    user_avg_sale: number;
    platform_avg_sale: number;
    user_success_rate: number;
    platform_success_rate: number;
    user_rank: number;
    total_users: number;
  }> {
    try {
      // Get user stats
      const userStats = await this.getTradingStats(userId, 'all_time');

      // Get platform averages
      const { data: allSales } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'sale');

      const platformAvgSale = allSales && allSales.length > 0
        ? allSales.reduce((sum, t) => sum + (t.amount || 0), 0) / allSales.length
        : 0;

      // Calculate success rate (assuming any completed sale is successful)
      const userSuccessRate = userStats ? 100 : 0; // Simplified

      // Get user ranking by total volume
      const { data: allUsers } = await supabase
        .from('users')
        .select('user_id, total_sales, total_purchases')
        .order('total_sales', { ascending: false });

      const userRank = allUsers?.findIndex(u => u.user_id === userId) + 1 || 0;

      return {
        user_avg_sale: userStats?.avg_sale_price || 0,
        platform_avg_sale: platformAvgSale,
        user_success_rate: userSuccessRate,
        platform_success_rate: 95, // Placeholder
        user_rank: userRank,
        total_users: allUsers?.length || 0,
      };
    } catch (error) {
      logger.error('Error in getComparativeStats:', error);
      return {
        user_avg_sale: 0,
        platform_avg_sale: 0,
        user_success_rate: 0,
        platform_success_rate: 0,
        user_rank: 0,
        total_users: 0,
      };
    }
  }

  /**
   * Get monthly trading summary
   */
  async getMonthlySummary(userId: string, year: number, month: number): Promise<{
    total_volume: number;
    total_profit: number;
    best_day: string;
    total_trades: number;
    days_active: number;
  }> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
        .eq('type', 'sale')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error || !transactions) {
        return { total_volume: 0, total_profit: 0, best_day: '', total_trades: 0, days_active: 0 };
      }

      let totalVolume = 0;
      let totalProfit = 0;
      const dailyVolume: { [key: string]: number } = {};
      const activeDays = new Set<string>();

      transactions.forEach((tx: any) => {
        const date = new Date(tx.created_at).toISOString().split('T')[0];
        activeDays.add(date);

        if (tx.seller_id === userId) {
          totalVolume += tx.amount || 0;
          totalProfit += tx.amount || 0;
          dailyVolume[date] = (dailyVolume[date] || 0) + (tx.amount || 0);
        } else if (tx.buyer_id === userId) {
          totalVolume += tx.amount || 0;
          totalProfit -= tx.amount || 0;
        }
      });

      const bestDay = Object.entries(dailyVolume).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      return {
        total_volume: totalVolume,
        total_profit: totalProfit,
        best_day: bestDay,
        total_trades: transactions.length,
        days_active: activeDays.size,
      };
    } catch (error) {
      logger.error('Error in getMonthlySummary:', error);
      return { total_volume: 0, total_profit: 0, best_day: '', total_trades: 0, days_active: 0 };
    }
  }
}

export const TradingStatsService = new TradingStatsServiceClass();
