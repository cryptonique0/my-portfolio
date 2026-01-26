import { Router, Request, Response } from 'express';
import { TransactionHistoryService } from '../services/transaction-history.service';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/transactions/history
 * Get user's transaction history with pagination and filters
 */
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user added by authenticateToken
    const userId = req.user.id;
    
    const {
      type,
      startDate,
      endDate,
      limit = '50',
      offset = '0',
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      type: type as any,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as 'timestamp' | 'price',
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await TransactionHistoryService.getUserTransactions(userId, options);
    
    res.json({
      success: true,
      data: result.transactions,
      pagination: {
        total: result.total,
        limit: options.limit,
        offset: options.offset,
        hasMore: result.total > (options.offset + options.limit)
      }
    });
  } catch (error: any) {
    logger.error('Error fetching transaction history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch transaction history' });
  }
});

/**
 * GET /api/transactions/analytics
 * Get transaction analytics for the authenticated user
 */
router.get('/analytics', authenticateToken, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const period = (startDate && endDate) ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const analytics = await TransactionHistoryService.getTransactionAnalytics(userId, period);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    logger.error('Error fetching transaction analytics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/transactions/price-history
 * Get price history over time
 */
router.get('/price-history', authenticateToken, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { days = '30', groupBy = 'day' } = req.query;

    const history = await TransactionHistoryService.getPriceHistory(
      userId,
      parseInt(days as string),
      groupBy as 'day' | 'week' | 'month'
    );
    
    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    logger.error('Error fetching price history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch price history' });
  }
});

/**
 * GET /api/transactions/tax-report/:year
 * Generate tax report for a specific year
 */
router.get('/tax-report/:year', authenticateToken, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const year = parseInt(req.params.year);

    if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const report = await TransactionHistoryService.generateTaxReport(userId, year);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    logger.error('Error generating tax report:', error);
    res.status(500).json({ error: error.message || 'Failed to generate tax report' });
  }
});

/**
 * GET /api/transactions/export/csv
 * Export transactions to CSV
 */
router.get('/export/csv', authenticateToken, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { startDate, endDate, type } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as any
    };

    const csv = await TransactionHistoryService.exportToCSV(userId, options);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${userId}-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error: any) {
    logger.error('Error exporting transactions:', error);
    res.status(500).json({ error: error.message || 'Failed to export transactions' });
  }
});

/**
 * GET /api/transactions/stats
 * Get transaction statistics summary
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    
    const stats = await TransactionHistoryService.getTransactionStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logger.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch stats' });
  }
});

export default router;
